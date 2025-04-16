import React from 'react';

// NOTE: This is the original Watch Together component code.
// Temporarily disabled but preserved for future implementation.
export const WatchTogetherOriginal: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Watch Together</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
          Create Room
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 text-center">
        <p className="text-gray-500 mb-4">
          Create or join a watch party to sync videos with friends.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter room code"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full">
            Join Room
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-medium mb-2">Recent Rooms</h2>
        <div className="space-y-2">
          <div className="bg-white rounded-lg shadow p-3 flex justify-between items-center">
            <div>
              <p className="font-medium">Movie Night</p>
              <p className="text-sm text-gray-500">Created 2 days ago</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-800">Join</button>
          </div>
        </div>
      </div>
    </div>
  );
};
