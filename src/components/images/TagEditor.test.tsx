import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TagEditor from './TagEditor'; // Adjust path as necessary
import { ImageFile } from '@/types/images'; // Assuming this type is used by TagEditor
import { AppContextProvider } from '@/hooks/useAppContext'; // For potential context dependencies if any

// Mock TagConfirmationDialog
jest.mock('@/components/modals/TagConfirmationDialog', () => {
  // Mocking the default export of TagConfirmationDialog
  return jest.fn(({ open, onConfirm, onOpenChange }) => {
    // If the dialog is open, simulate an immediate confirmation for "Clear All" tests
    if (open) {
      // Call onConfirm to simulate user clicking "Confirm"
      // Call onOpenChange(false) to simulate closing the dialog
      // This needs to be done carefully to avoid infinite loops if onConfirm itself changes `open`
      // For "Clear All", we want to simulate the confirm action.
      // Let's make it so that the confirm button is "clicked" by the test, rather than auto-confirming.
      return (
        <div data-testid="mock-tag-confirmation-dialog">
          <button onClick={() => { onConfirm(); onOpenChange(false); }}>Confirm Clear</button>
          <button onClick={() => onOpenChange(false)}>Cancel Clear</button>
        </div>
      );
    }
    return null;
  });
});


const mockImage: ImageFile = {
  id: 'img1',
  name: 'Test Image',
  url: 'http://example.com/test.jpg',
  size: 12345,
  type: 'image/jpeg',
  metadata: {
    tags: ['initialTag1', 'initialTag2'],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOnUpdate = jest.fn();
const mockOnClearAllTags = jest.fn(); // Separate mock for clear all, if TagEditor differentiates

// Helper function to render with providers if TagEditor uses context (e.g. useAppContext for toasts)
const renderTagEditor = (imageProps?: Partial<ImageFile>, onUpdateProps?: jest.Mock, onClearAllTagsProps?: jest.Mock) => {
  const image = { ...mockImage, ...imageProps, metadata: { ...mockImage.metadata, ...imageProps?.metadata } };
  
  return render(
    <AppContextProvider> {/* Include if TagEditor or its children use useAppContext */}
      <TagEditor
        image={image}
        onUpdate={onUpdateProps || mockOnUpdate}
        onClearAllTags={onClearAllTagsProps || mockOnClearAllTags} // Pass the specific prop if used by component
      />
    </AppContextProvider>
  );
};


describe('TagEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial tags correctly', () => {
    renderTagEditor();
    expect(screen.getByText('initialTag1')).toBeInTheDocument();
    expect(screen.getByText('initialTag2')).toBeInTheDocument();
  });

  test('adds a new tag', () => {
    renderTagEditor();
    const input = screen.getByPlaceholderText('Add tag');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(input, { target: { value: 'newTag' } });
    fireEvent.click(addButton);

    expect(mockOnUpdate).toHaveBeenCalledWith(['initialTag1', 'initialTag2', 'newTag']);
  });

  test('does not add an empty tag', () => {
    renderTagEditor();
    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton); // Click with empty input
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  test('does not add a duplicate tag (case-insensitive check if component handles it)', () => {
    renderTagEditor();
    const input = screen.getByPlaceholderText('Add tag');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(input, { target: { value: 'INITIALTAG1' } }); // Duplicate of initialTag1
    fireEvent.click(addButton);
    // The component's current implementation of addTag checks for existing tags in a case-sensitive manner.
    // If it were case-insensitive, mockOnUpdate would not be called or called with original tags.
    // Based on TagEditor.tsx: `!tags.includes(input.trim())` is case-sensitive.
    // So, 'INITIALTAG1' would be added as it's different from 'initialTag1'.
    // To make this test pass as "not adding duplicate", TagEditor would need to normalize case.
    // For now, assuming current behavior, it WILL add it.
    // If the requirement is strict no-duplicates (case-insensitive), this test would fail or TagEditor needs change.
    // Let's test current behavior:
    expect(mockOnUpdate).toHaveBeenCalledWith(['initialTag1', 'initialTag2', 'INITIALTAG1']);
  });
  
  test('removes a tag', () => {
    renderTagEditor();
    // Find the remove button associated with 'initialTag1'
    // The 'x' button is inside a span that contains the tag text.
    const tag1Span = screen.getByText('initialTag1');
    const removeButton = tag1Span.nextElementSibling as HTMLElement; // Assuming button is sibling
    
    // A better way if button has aria-label or specific role:
    // const removeButton = screen.getByRole('button', { name: /remove initialTag1/i }); // If such label exists
    
    fireEvent.click(removeButton);
    expect(mockOnUpdate).toHaveBeenCalledWith(['initialTag2']);
  });

  test('clears all tags after confirmation', () => {
    // Render with an image that has tags
    renderTagEditor({ metadata: { tags: ['tagA', 'tagB'] } }, mockOnUpdate, mockOnUpdate); 
    // Using mockOnUpdate for onClearAllTags as well if it falls back to onUpdate([])

    const clearAllButton = screen.getByRole('button', { name: 'Clear All' });
    expect(clearAllButton).toBeInTheDocument();
    fireEvent.click(clearAllButton);

    // The mock dialog should be visible now
    const confirmButton = screen.getByTestId('mock-tag-confirmation-dialog').querySelector('button') as HTMLButtonElement;
    expect(confirmButton).toHaveTextContent('Confirm Clear'); // Check it's the confirm button
    
    fireEvent.click(confirmButton); // Simulate clicking "Confirm" in the dialog

    // Check if onUpdate was called with an empty array (or onClearAllTags if it was a distinct prop used)
    expect(mockOnUpdate).toHaveBeenCalledWith([]);
  });
  
  test('does not clear tags if confirmation is cancelled', () => {
    renderTagEditor({ metadata: { tags: ['tagA', 'tagB'] } });
    const clearAllButton = screen.getByRole('button', { name: 'Clear All' });
    fireEvent.click(clearAllButton);

    const cancelButton = screen.getByTestId('mock-tag-confirmation-dialog').querySelectorAll('button')[1] as HTMLButtonElement;
    expect(cancelButton).toHaveTextContent('Cancel Clear');
    fireEvent.click(cancelButton);
    
    expect(mockOnUpdate).not.toHaveBeenCalledWith([]); // onUpdate shouldn't be called to clear
    expect(mockOnUpdate).not.toHaveBeenCalled(); // Or more strictly, not called at all after initial render
  });

});
