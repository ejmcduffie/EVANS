import React from 'react';

type ActivityItem = {
  type: 'verification' | 'nft' | 'defi' | 'dao' | 'download' | 'delete';
  timestamp: Date;
  message: string;
};

type RecentActivityProps = {
  recentActivity: ActivityItem[];
};

export default function RecentActivity({ recentActivity }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-6">Recent Blockchain Activity</h2>
      
      {recentActivity.length === 0 ? (
        <p className="text-gray-500">No recent blockchain activity</p>
      ) : (
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="border-l-4 pl-4 py-2" 
              style={{
                borderColor: 
                  activity.type === 'verification' ? '#10b981' : 
                  activity.type === 'nft' ? '#8b5cf6' :
                  activity.type === 'defi' ? '#f59e0b' :
                  activity.type === 'dao' ? '#3b82f6' :
                  activity.type === 'download' ? '#0ea5e9' :
                  activity.type === 'delete' ? '#ef4444' : '#6b7280'
              }}>
              <p className="text-gray-800">{activity.message}</p>
              <p className="text-xs text-gray-500">
                {activity.timestamp.toLocaleTimeString()} • {activity.timestamp.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
