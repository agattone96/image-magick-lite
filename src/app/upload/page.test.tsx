import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadPage from './page'; // Adjust path as necessary
import { AppContextProvider } from '@/hooks/useAppContext'; // Real provider
import { AutomationProvider } from '@/hooks/useAutomation'; // Real provider

// --- Mocks ---

// Mock supabaseClient
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

// Mock useAutomation hook
const mockStartTask = jest.fn();
jest.mock('@/hooks/useAutomation', () => ({
  ...jest.requireActual('@/hooks/useAutomation'), // Import and retain default exports
  useAutomation: () => ({
    startTask: mockStartTask,
    tasks: [], // Provide mock tasks array
    getOverallProgress: jest.fn(() => 0),
    clearCompletedTasks: jest.fn(),
    retryTask: jest.fn(),
  }),
}));

// Mock UploadArea component
jest.mock('@/components/upload/UploadArea', () => {
  // Mocking the default export of UploadArea
  return jest.fn(({ onFilesSelect }) => (
    <div data-testid="mock-upload-area">
      <input
        type="file"
        data-testid="file-input"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            onFilesSelect(Array.from(e.target.files));
          }
        }}
      />
      <button onClick={() => onFilesSelect([new File(['dummy'], 'test1.png', { type: 'image/png' })])}>
        Simulate File Select
      </button>
    </div>
  ));
});

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
}));


// Helper function to render with providers
const renderUploadPage = () => {
  return render(
    <AppContextProvider>
      <AutomationProvider>
        <UploadPage />
      </AutomationProvider>
    </AppContextProvider>
  );
};

describe('UploadPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock successful Supabase responses
    const { supabase } = require('@/lib/supabaseClient');
    supabase.storage.upload.mockResolvedValue({ data: { path: 'public/mock-uuid-test1.png' }, error: null });
    supabase.storage.getPublicUrl.mockReturnValue({ data: { publicUrl: 'https://mock.supabase.co/storage/v1/object/public/images/public/mock-uuid-test1.png' } });
    supabase.from('images').insert().select().single.mockResolvedValue({ 
        data: { 
            id: 'db-mock-id', 
            name: 'test1.png', 
            metadata: {}, 
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
        }, 
        error: null 
    });
  });

  test('renders UploadArea and handles file selection', async () => {
    renderUploadPage();
    expect(screen.getByTestId('mock-upload-area')).toBeInTheDocument();

    const fileInput = screen.getByTestId('file-input');
    const testFile = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    // Wait for the async operations in handleFilesUpload to complete
    await waitFor(() => {
      // Check if the image name appears in the document (preview)
      expect(screen.getByText(testFile.name)).toBeInTheDocument();
    });
  });

  test('calls startTask from useAutomation if "Run AI Automations" switch is on', async () => {
    renderUploadPage();
    
    // Ensure the switch is on (it's on by default in the component)
    const aiSwitch = screen.getByLabelText(/Run AI Automations/i);
    expect(aiSwitch).toBeChecked();

    const fileInput = screen.getByTestId('file-input');
    const testFile = new File(['(⌐□_□)'], 'test-ai.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(mockStartTask).toHaveBeenCalledTimes(1); // Assuming 'all' creates one meta-task or similar
      expect(mockStartTask).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test-ai.png' }), // The AppImageFile object
        'all', // Task type
        expect.any(String) // Description
      );
    });
  });
  
  test('does NOT call startTask if "Run AI Automations" switch is off', async () => {
    renderUploadPage();

    // Turn the switch off
    const aiSwitch = screen.getByLabelText(/Run AI Automations/i);
    fireEvent.click(aiSwitch); // Unchecks it
    expect(aiSwitch).not.toBeChecked();


    const fileInput = screen.getByTestId('file-input');
    const testFile = new File(['(⌐□_□)'], 'test-no-ai.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      // Check that the file preview is still rendered
      expect(screen.getByText(testFile.name)).toBeInTheDocument();
    });
    
    // Check that startTask was NOT called
    expect(mockStartTask).not.toHaveBeenCalled();
  });

});
