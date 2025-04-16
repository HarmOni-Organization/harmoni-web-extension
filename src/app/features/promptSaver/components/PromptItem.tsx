import React from 'react';
import { useAppDispatch } from '../../../hooks';
import { Prompt, deletePromptAsync, setEditingPrompt } from '../promptSlice';

interface PromptItemProps {
  prompt: Prompt;
}

export const PromptItem: React.FC<PromptItemProps> = ({ prompt }) => {
  const dispatch = useAppDispatch();

  const handleEdit = () => {
    dispatch(setEditingPrompt(prompt));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content).then(() => {
      // Create a toast notification
      const toast = document.createElement('div');
      toast.className =
        'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      toast.textContent = 'Prompt copied!';
      document.body.appendChild(toast);

      // Remove toast after 2 seconds
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 2000);
    });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      await dispatch(deletePromptAsync(prompt.id));
    }
  };

  // Get a preview of the content (first line or first 50 chars)
  const contentPreview =
    prompt.content.split('\n')[0].substring(0, 50) + (prompt.content.length > 50 ? '...' : '');

  return (
    <div className="border rounded-lg p-3 mb-2 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900">{prompt.title}</h3>
        <div className="flex space-x-2">
          <button onClick={handleEdit} className="text-blue-500 hover:text-blue-700" title="Edit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleCopy}
            className="text-green-500 hover:text-green-700"
            title="Copy to clipboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          </button>
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700" title="Delete">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm mt-1">{contentPreview}</p>
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
