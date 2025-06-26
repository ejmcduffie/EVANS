import React from 'react';
import Link from 'next/link';

type DashboardCardProps = {
  title: string;
  description: string;
  linkText: string;
  href: string;
};

export default function DashboardCard({
  title,
  description,
  linkText,
  href
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link 
        href={href} 
        className="text-primary hover:underline inline-flex items-center"
      >
        {linkText}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
