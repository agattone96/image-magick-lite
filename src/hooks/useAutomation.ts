import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppImageFile } from '@/types/supabase'; // Assuming AppImageFile is the type for images
import {
  generateTitle,
  saveTitleToSupabase,
  extractTagsFromImage,
  cleanTagsWithGPT,
  saveTagsToSupabase,
  extractColorPalette,
  saveColorPaletteToSupabase,
} from '@/lib/aiUtils'; // Import AI utility functions

// Define Task type
export type AutomationTaskType = 'title' | 'tags' | 'palette' | 'all';

export interface Task {
  id: string;
  imageId: string;
  imageName?: string;
  taskType: AutomationTaskType;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number; // 0-100
  error: string | null;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
  // Store necessary image data for retry
  imageForRetry: Pick<AppImageFile, 'id' | 'name' | 'url' | 'metadata'>; 
  descriptionForRetry?: string; // Store original description for title tasks
}

interface AutomationContextType {
  tasks: Task[];
  startTask: (image: AppImageFile, taskType: AutomationTaskType, description?: string) => void;
  retryTask: (taskId: string) => void;
  getOverallProgress: () => number;
  clearCompletedTasks: () => void;
}

const AutomationContext = createContext<AutomationContextType | undefined>(undefined);

export const AutomationProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const updateTaskState = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
      )
    );
  }, []);

  const processTask = async (task: Task) => { // Image and description now come from task object
    updateTaskState(task.id, { status: 'in-progress', progress: 10 });
    const imageToProcess = task.imageForRetry; // Use stored image data
    const descriptionForTitle = task.descriptionForRetry;

    try {
      let result: any;
      switch (task.taskType) {
        case 'title':
          updateTaskState(task.id, { progress: 30 });
          // Use descriptionForTitle or fallback to image name
          const title = await generateTitle(imageToProcess, descriptionForTitle || imageToProcess.name);
          updateTaskState(task.id, { progress: 70 });
          await saveTitleToSupabase(imageToProcess.id, title);
          result = title;
          break;
        case 'tags':
          updateTaskState(task.id, { progress: 20 });
          let tags = await extractTagsFromImage(imageToProcess);
          updateTaskState(task.id, { progress: 50 });
          tags = await cleanTagsWithGPT(tags);
          updateTaskState(task.id, { progress: 70 });
          await saveTagsToSupabase(imageToProcess.id, tags);
          result = tags;
          break;
        case 'palette':
          updateTaskState(task.id, { progress: 30 });
          const palette = await extractColorPalette(imageToProcess);
          updateTaskState(task.id, { progress: 70 });
          await saveColorPaletteToSupabase(imageToProcess.id, palette);
          result = palette;
          break;
        default:
          // 'all' task type should not reach here if startTask handles it by creating individual tasks
          throw new Error(`Unsupported task type in processTask: ${task.taskType}`);
      }
      updateTaskState(task.id, { status: 'completed', progress: 100, result });
    } catch (error: any) {
      console.error(`Error processing task ${task.id} (${task.taskType}) for image ${imageToProcess.id}:`, error);
      updateTaskState(task.id, { status: 'failed', error: error.message || 'Unknown error', progress: task.progress });
    }
  };
  
  const createTaskObject = (image: AppImageFile, taskType: AutomationTaskType, description?: string): Task => {
    return {
      id: uuidv4(),
      imageId: image.id,
      imageName: image.name,
      taskType,
      status: 'pending',
      progress: 0,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageForRetry: { // Store essential image data
        id: image.id,
        name: image.name,
        url: image.url, // May not be strictly needed for all AI, but good to have
        metadata: image.metadata, // Store metadata for context (e.g. description for title, existing colors/tags)
      },
      descriptionForRetry: description, // Store description for title task
    };
  };

  const startTask = (image: AppImageFile, taskType: AutomationTaskType, description?: string) => {
    if (taskType === 'all') {
      // Create individual tasks for 'title', 'tags', and 'palette'
      const titleTask = createTaskObject(image, 'title', description);
      const tagsTask = createTaskObject(image, 'tags'); // No specific description needed for tags
      const paletteTask = createTaskObject(image, 'palette'); // No specific description for palette

      setTasks(prevTasks => [...prevTasks, titleTask, tagsTask, paletteTask]);
      
      // Start processing each individual task
      processTask(titleTask);
      processTask(tagsTask);
      processTask(paletteTask);
    } else {
      // Handle single task type
      const newTask = createTaskObject(image, taskType, description);
      setTasks(prevTasks => [...prevTasks, newTask]);
      processTask(newTask);
    }
  };

  const retryTask = (taskId: string) => {
    const taskToRetry = tasks.find(t => t.id === taskId);
    if (taskToRetry && taskToRetry.status === 'failed') {
      updateTaskState(taskId, { status: 'pending', progress: 0, error: null, updatedAt: new Date() });
      // processTask will use the imageForRetry and descriptionForRetry stored in the task object
      processTask({ ...taskToRetry, status: 'pending', progress: 0, error: null }); 
    }
  };

  const clearCompletedTasks = () => {
    setTasks(prevTasks => prevTasks.filter(task => task.status !== 'completed'));
  };

  const getOverallProgress = () => {
    if (tasks.length === 0) return 0;
    // Consider only active tasks for overall progress, or define behavior as needed
    const activeTasks = tasks.filter(task => task.status === 'in-progress' || task.status === 'pending');
    if (activeTasks.length === 0) {
      // If all tasks are completed or failed, consider it 100% "done" with processing queue
      // or 0% if you mean "0% currently in progress". Let's go with 0% in progress.
      return tasks.every(task => task.status === 'completed' || task.status === 'failed') ? 100 : 0;
    }
    const totalProgress = activeTasks.reduce((acc, task) => acc + task.progress, 0);
    return totalProgress / activeTasks.length;
  };

  return (
    <AutomationContext.Provider
      value={{
        tasks,
        startTask,
        retryTask,
        getOverallProgress,
        clearCompletedTasks,
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
};

export const useAutomation = () => {
  const context = useContext(AutomationContext);
  if (context === undefined) {
    throw new Error('useAutomation must be used within an AutomationProvider');
  }
  return context;
};
