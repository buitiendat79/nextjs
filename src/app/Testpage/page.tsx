'use client';

import { useState } from 'react';

import { useStateChangeTracker } from '@/lib/hooks';

export default function HomePage() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // Pass the state variables you want to monitor
  const { style, renderCount, totalRenders } = useStateChangeTracker(
    [count, name],
    800,
  );

  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-4 p-4'>
      <div className='p-6 rounded-lg shadow-md w-full max-w-md' style={style}>
        <h1 className='mb-4 text-xl font-bold'>State Change Tracker Demo</h1>

        <div className='mb-4 p-3 bg-gray-50 rounded-md text-sm'>
          <p>
            <span className='font-medium'>State-driven renders:</span>{' '}
            {renderCount}
          </p>
          {/* <p><span className="font-medium">Total renders:</span> {totalRenders}</p> */}
          {/* <p><span className="font-medium">Current time:</span> {new Date().toLocaleTimeString()}</p> */}
        </div>

        {/* First state change trigger */}
        <div className='mb-4'>
          <p className='font-medium mb-2'>Counter: {count}</p>
          <button
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
            onClick={() => setCount((prev) => prev + 1)}
          >
            Increment Counter
          </button>
        </div>

        {/* Second state change trigger */}
        {/* <div className="mb-4">
          <p className="font-medium mb-2">Name: {name || 'Not set'}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              onClick={() => setName('')}
            >
              Clear
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
