import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';

// Very lightweight Card primitives for demo purposes.
// Replace with your design-system implementation as needed.

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div
    {...props}
    className={clsx(
      'rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
      className,
    )}
  />
);

export const CardHeader: React.FC<CardProps> = ({ className, ...props }) => (
  <div
    {...props}
    className={clsx('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}
  />
);

export const CardTitle: React.FC<CardProps> = ({ className, ...props }) => (
  <h3 {...props} className={clsx('text-lg font-semibold', className)} />
);

export const CardDescription: React.FC<CardProps> = ({ className, ...props }) => (
  <p {...props} className={clsx('text-sm text-gray-500 dark:text-gray-400', className)} />
);

export const CardContent: React.FC<CardProps> = ({ className, ...props }) => (
  <div {...props} className={clsx('p-6', className)} />
);

export const CardFooter: React.FC<CardProps> = ({ className, ...props }) => (
  <div
    {...props}
    className={clsx('px-6 py-4 border-t border-gray-200 dark:border-gray-700', className)}
  />
);
