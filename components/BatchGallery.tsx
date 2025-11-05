import React from 'react';
import { Batch } from '../types';

interface BatchGalleryProps {
  batches: Batch[];
  onSelectBatch: (batch: Batch) => void;
}

const BatchGallery: React.FC<BatchGalleryProps> = ({ batches, onSelectBatch }) => {
  const colors = [
    'from-purple-400 to-pink-500',
    'from-blue-400 to-indigo-500',
    'from-green-400 to-teal-500',
    'from-yellow-400 to-orange-500',
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Our Dance Batches</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {batches.map((batch, index) => (
          <div
            key={batch.id}
            onClick={() => onSelectBatch(batch)}
            className={`group relative cursor-pointer rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-6 text-white bg-gradient-to-br ${colors[index % colors.length]}`}
          >
            <div className="flex flex-col h-full">
              <h3 className="text-3xl font-extrabold tracking-wider">{batch.time}</h3>
              <p className="mt-1 font-medium">{batch.day}</p>
              <div className="mt-auto pt-4">
                <p className="text-sm opacity-90">Instructor: {batch.instructor}</p>
                <p className="text-lg font-semibold mt-1 bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">{batch.kids.length} Student{batch.kids.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        ))}
         {batches.length === 0 && (
          <div className="col-span-full text-center bg-white rounded-xl shadow-sm p-12">
            <p className="text-gray-500">No batch data found in the Google Sheet.</p>
            <p className="text-gray-400 text-sm mt-2">Please ensure the 'Batches' tab is populated correctly.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchGallery;
