import React from 'react';
import { useAppSelector } from '../../hooks';
import { selectIsAddModalOpen } from './promptSlice';
import { PromptList } from './components/PromptList';
import { PromptForm } from './components/PromptForm';

export const PromptSaver: React.FC = () => {
  const isAddModalOpen = useAppSelector(selectIsAddModalOpen);

  return (
    <div className="w-full h-full">
      <PromptList />
      {isAddModalOpen && <PromptForm />}
    </div>
  );
};
