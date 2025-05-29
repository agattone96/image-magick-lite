import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AutomagicPage from './page'; // Adjust path as necessary
import { AppContextProvider } from '@/hooks/useAppContext';
import { AutomationProvider, useAutomation } from '@/hooks/useAutomation'; // Import real provider and hook for mocking
import { AppImageFile } from '@/types/supabase';

// --- Mocks ---

// Mock supabaseClient (as AutomagicPage fetches images)
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockImplementation(() => ({ // Mock the .then() structure from the actual client mock
      then: jest.fn(callback => callback({ data: [
        // Provide mock DbImage data that transformDbImageToAppImageFile expects
        { id: 'img1', name: 'Test Image 1', storage_path: 'public/img1.jpg', created_at: new Date().toISOString(), title: 'Title 1', tags: ['tag1'], color_palette: ['#ffffff'] },
        { id: 'img2', name: 'Test Image 2', storage_path: 'public/img2.jpg', created_at: new Date().toISOString(), title: 'Title 2', tags: ['tag2'], color_palette: ['#000000'] },
      ], error: null }))
    })),
    storage: { // Mock storage for transformDbImageToAppImageFile
      from: jest.fn().mockReturnThis(),
      getPublicUrl: jest.fn(path => ({ data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/images/${path}` }})),
    }
  },
}));


// Mock useAppContext
const mockSetSelectedImages = jest.fn();
const mockSelectedImageIds = ['img1']; // Simulate one image selected by default for some tests
jest.mock('@/hooks/useAppContext', () => ({
  ...jest.requireActual('@/hooks/useAppContext'),
  useAppContext: () => ({
    selectedImages: mockSelectedImageIds, 
    setSelectedImages: mockSetSelectedImages,
    activeModal: null,
    setActiveModal: jest.fn(),
    currentUser: null, // Or mock user if needed
    // Add other context values if your component uses them
  }),
}));

// Mock useAutomation hook
const mockStartTask = jest.fn();
const mockRetryTask = jest.fn();
const mockClearCompletedTasks = jest.fn();
const mockTasks = [ // Provide some mock tasks for display
  { id: 'task1', imageId: 'img1', imageName: 'Test Image 1', taskType: 'title', status: 'completed', progress: 100, createdAt: new Date(), updatedAt: new Date(), imageForRetry: {id: 'img1', name: 'Test Image 1', url:'', metadata: {}}},
  { id: 'task2', imageId: 'img2', imageName: 'Test Image 2', taskType: 'tags', status: 'in-progress', progress: 50, createdAt: new Date(), updatedAt: new Date(), imageForRetry: {id: 'img2', name: 'Test Image 2', url:'', metadata: {}}},
];

jest.mock('@/hooks/useAutomation', () => ({
  ...jest.requireActual('@/hooks/useAutomation'),
  useAutomation: () => ({
    tasks: mockTasks,
    startTask: mockStartTask,
    retryTask: mockRetryTask,
    getOverallProgress: jest.fn(() => 75), // Mock overall progress
    clearCompletedTasks: mockClearCompletedTasks,
  }),
}));

// Mock ImageGrid to simplify testing selection
jest.mock('@/components/images/ImageGrid', () => {
  return jest.fn(({ onSelectionChange, selectedIds }) => (
    <div data-testid="mock-image-grid">
      <button onClick={() => onSelectionChange(['img1'])}>Select img1</button>
      <button onClick={() => onSelectionChange(['img1', 'img2'])}>Select img1, img2</button>
      <p>Selected: {selectedIds.join(', ')}</p>
    </div>
  ));
});


// Helper function to render with providers
const renderAutomagicPage = () => {
  return render(
    <AppContextProvider> {/* Real AppContextProvider */}
      <AutomationProvider> {/* Real AutomationProvider */}
        <AutomagicPage />
      </AutomationProvider>
    </AppContextProvider>
  );
};


describe('AutomagicPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset selected images for tests that rely on starting with no selection
    mockSelectedImageIds.length = 0; 
    mockSelectedImageIds.push('img1'); // Default to one selected
  });

  test('renders images and automation controls', async () => {
    renderAutomagicPage();
    // Wait for images to load (due to async fetch in useEffect)
    await waitFor(() => {
        expect(screen.getByTestId('mock-image-grid')).toBeInTheDocument();
    });
    expect(screen.getByText('Run Selected Automations')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    expect(screen.getByLabelText('Palette')).toBeInTheDocument();
  });

  test('displays tasks from useAutomation hook', async () => {
    renderAutomagicPage();
    await waitFor(() => { // Wait for initial image fetch
      expect(screen.getByText('Image: Test Image 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Task: title')).toBeInTheDocument();
    expect(screen.getByText('Status: completed')).toBeInTheDocument();
    
    expect(screen.getByText('Image: Test Image 2')).toBeInTheDocument();
    expect(screen.getByText('Task: tags')).toBeInTheDocument();
    expect(screen.getByText('Status: in-progress')).toBeInTheDocument();
  });

  test('calls startTask with selected images and automation types', async () => {
    renderAutomagicPage();
    await waitFor(() => {
        expect(screen.getByTestId('mock-image-grid')).toBeInTheDocument();
    });

    // Simulate selecting "Title" and "Tags" automations
    fireEvent.click(screen.getByLabelText('Title')); // Checked by default
    // fireEvent.click(screen.getByLabelText('Tags')); // Checked by default
    fireEvent.click(screen.getByLabelText('Palette')); // Uncheck palette

    // Simulate clicking the "Run Selected Automations" button
    fireEvent.click(screen.getByText('Run Selected Automations'));

    // Verify startTask calls
    // mockSelectedImageIds currently contains 'img1'
    // allImages mock contains img1 and img2
    const expectedImageForTask = expect.objectContaining({ id: 'img1' });
    
    expect(mockStartTask).toHaveBeenCalledWith(expectedImageForTask, 'title', expect.any(String));
    expect(mockStartTask).toHaveBeenCalledWith(expectedImageForTask, 'tags', expect.any(String));
    expect(mockStartTask).not.toHaveBeenCalledWith(expectedImageForTask, 'palette', expect.any(String));
    expect(mockStartTask).toHaveBeenCalledTimes(2); // Called for title and tags for img1
  });
  
  test('shows toast if no images are selected when running automations', async () => {
    mockSelectedImageIds.length = 0; // Clear default selection
    const { getByText } = renderAutomagicPage();
    await waitFor(() => { // Wait for initial image fetch
      expect(screen.getByTestId('mock-image-grid')).toBeInTheDocument();
    });
    
    fireEvent.click(getByText('Run Selected Automations'));
    
    // This relies on useToast being mocked or its effects being observable.
    // For this test, we check that startTask was NOT called. A more robust test would check for the toast.
    expect(mockStartTask).not.toHaveBeenCalled();
    // If you have a mock for useToast, you can assert that toast was called with specific params.
  });

  test('shows toast if no automation types are selected', async () => {
    const { getByText, getByLabelText } = renderAutomagicPage();
    await waitFor(() => { // Wait for initial image fetch
      expect(screen.getByTestId('mock-image-grid')).toBeInTheDocument();
    });

    // Uncheck all automation types
    fireEvent.click(getByLabelText('Title'));
    fireEvent.click(getByLabelText('Tags'));
    // Palette is already unchecked from a previous test's side effect if not reset, ensure it is for this test
    const paletteCheckbox = getByLabelText('Palette') as HTMLInputElement;
    if (paletteCheckbox.checked) fireEvent.click(paletteCheckbox);


    fireEvent.click(getByText('Run Selected Automations'));
    expect(mockStartTask).not.toHaveBeenCalled();
    // Add assertion for toast message if useToast is effectively mocked
  });
  
   test('calls clearCompletedTasks when "Clear Completed" button is clicked', async () => {
    renderAutomagicPage();
    await waitFor(() => { // Wait for initial image fetch & tasks to render
      expect(screen.getByText('Image: Test Image 1')).toBeInTheDocument();
    });
    
    const clearButton = screen.getByText('Clear Completed');
    fireEvent.click(clearButton);
    expect(mockClearCompletedTasks).toHaveBeenCalledTimes(1);
  });

});
