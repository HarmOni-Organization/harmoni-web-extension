import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../hooks';
import {
  selectFilteredPrompts,
  selectSearchTerm,
  selectLoading,
  selectError,
  setSearchTerm,
  setAddModalOpen,
  fetchPrompts,
} from '../promptSlice';
import { PromptItem } from './PromptItem';

export const PromptList: React.FC = () => {
  const dispatch = useAppDispatch();
  const prompts = useAppSelector(selectFilteredPrompts);
  const searchTerm = useAppSelector(selectSearchTerm);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  // Fetch prompts on component mount
  useEffect(() => {
    dispatch(fetchPrompts());
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleAddNew = () => {
    dispatch(setAddModalOpen(true));
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Prompt Saver</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Prompt
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-3 py-2 pl-10 pr-3 border border-gray-300 rounded-md"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading prompts...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? 'No prompts match your search'
              : 'No prompts saved yet. Add your first one!'}
          </div>
        ) : (
          prompts.map((prompt) => <PromptItem key={prompt.id} prompt={prompt} />)
        )}
      </div>
    </div>
  );
};
