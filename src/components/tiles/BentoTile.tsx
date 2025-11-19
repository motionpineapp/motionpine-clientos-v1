import React from 'react';
import { cn } from '@/lib/utils';
interface BentoTileProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  noPadding?: boolean;
}
export function BentoTile({ 
  children, 
  className, 
  title, 
  icon, 
  action,
  noPadding = false 
}: BentoTileProps) {
  return (
    <div 
      className={cn(
        "group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col",
        className
      )}
    >
      {(title || icon || action) && (
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-gray-500 group-hover:text-primary transition-colors duration-300">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="font-semibold text-gray-900 text-lg tracking-tight">
                {title}
              </h3>
            )}
          </div>
          {action && (
            <div className="text-sm text-gray-500">
              {action}
            </div>
          )}
        </div>
      )}
      <div className={cn("flex-1", !noPadding && "p-6")}>
        {children}
      </div>
    </div>
  );
}