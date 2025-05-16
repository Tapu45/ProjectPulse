import React from 'react';
import type { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, icon, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h1>
      {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;