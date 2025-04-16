import React from 'react';
import { IconType } from 'react-icons';

interface IconWrapperProps {
  icon: IconType;
  size?: number;
  className?: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({ icon: Icon, size, className }) => {
  return (
    <span className="icon-wrapper">
      {/* @ts-ignore - Ignoring the ReactNode return type error */}
      <Icon size={size} className={className} />
    </span>
  );
};
