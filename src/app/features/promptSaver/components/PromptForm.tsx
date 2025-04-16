import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  createPrompt,
  updatePromptAsync,
  setAddModalOpen,
  selectEditingPrompt,
  selectLoading,
  selectError,
} from '../promptSlice';

export const PromptForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const editingPrompt = useAppSelector(selectEditingPrompt);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({ title: false, content: false });

  // Reset form when editing prompt changes
  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title);
      setContent(editingPrompt.content);
      setTags([...editingPrompt.tags]);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
    setTagInput('');
    setErrors({ title: false, content: false });
  }, [editingPrompt]);

  const handleClose = () => {
    dispatch(setAddModalOpen(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors = {
      title: false,
      content: content.trim() === '',
    };

    if (newErrors.content) {
      setErrors(newErrors);
      return;
    }

    // Auto-generate title if not provided
    const finalTitle = title.trim() || content.split('\n')[0].substring(0, 30);

    if (editingPrompt) {
      await dispatch(
        updatePromptAsync({
          promptId: editingPrompt.id,
          promptData: {
            title: finalTitle,
            content: content.trim(),
            tags,
          },
        })
      );
    } else {
      await dispatch(
        createPrompt({
          title: finalTitle,
          content: content.trim(),
          tags,
        })
      );
    }

    // Only close if there was no error
    if (!error) {
      handleClose();
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e as unknown as React.FormEvent);
      return;
    }

    // Add tag on Enter in tag input
    if (e.key === 'Enter' && e.target === document.getElementById('tagInput')) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">
            {editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-4">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Prompt Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title or leave blank for auto-title"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">Please enter a title</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Prompt Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt here"
              rows={6}
              className={`w-full px-3 py-2 border rounded-md font-mono text-sm ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">Prompt content is required</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Press Ctrl+Enter to save</p>
          </div>

          <div className="mb-4">
            <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (optional)
            </label>
            <div className="flex">
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-blue-500 text-white px-3 py-2 rounded-r-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-gray-600 hover:text-gray-900"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {editingPrompt ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
