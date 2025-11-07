import React, { useState } from 'react';
import { Batch } from '../types';
import BatchForm from './BatchForm';
import { AddIcon } from './icons';

interface BatchGalleryProps {
  batches: Batch[];
  onSelectBatch: (batch: Batch) => void;
  onAddBatch: (batch: Omit<Batch, 'id' | 'kids'>) => void;
}

const BatchGallery: React.FC<BatchGalleryProps> = ({ batches, onSelectBatch, onAddBatch }) => {
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);

  const colors = [
    'from-purple-400 to-pink-500',
    'from-blue-400 to-indigo-500',
    'from-green-400 to-teal-500',
    'from-yellow-400 to-orange-500',
  ];

  const handleAddBatch = (batch: Omit<Batch, 'id' | 'kids'>) => {
    onAddBatch(batch);
    setIsAddBatchModalOpen(false);
  };

  return (
    <div>
      {isAddBatchModalOpen && (
        <BatchForm
          onAddBatch={handleAddBatch}
          onCancel={() => setIsAddBatchModalOpen(false)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Our Dance Batches</h2>
        <button
          onClick={() => setIsAddBatchModalOpen(true)}
          className="flex items-center bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <AddIcon />
          <span className="ml-2">Add Batch</span>
        </button>
      </div>
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
