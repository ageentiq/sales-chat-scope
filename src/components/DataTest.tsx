import React from 'react';
import { useConversations, useUniqueConversations } from '@/hooks/useConversations';

export const DataTest: React.FC = () => {
  const { data: allConversations, isLoading: isLoadingAll, error: errorAll } = useConversations();
  const { data: uniqueConversations, isLoading: isLoadingUnique, error: errorUnique } = useUniqueConversations();

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">Data Test Component</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">All Conversations:</h4>
          <p>Loading: {isLoadingAll ? 'Yes' : 'No'}</p>
          <p>Error: {errorAll ? errorAll.message : 'None'}</p>
          <p>Data: {allConversations ? `${allConversations.length} items` : 'null'}</p>
          {allConversations && allConversations.length > 0 && (
            <pre className="text-xs bg-white p-2 rounded mt-2">
              {JSON.stringify(allConversations[0], null, 2)}
            </pre>
          )}
        </div>

        <div>
          <h4 className="font-semibold">Unique Conversations:</h4>
          <p>Loading: {isLoadingUnique ? 'Yes' : 'No'}</p>
          <p>Error: {errorUnique ? errorUnique.message : 'None'}</p>
          <p>Data: {uniqueConversations ? `${uniqueConversations.length} items` : 'null'}</p>
          {uniqueConversations && uniqueConversations.length > 0 && (
            <pre className="text-xs bg-white p-2 rounded mt-2">
              {JSON.stringify(uniqueConversations[0], null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
