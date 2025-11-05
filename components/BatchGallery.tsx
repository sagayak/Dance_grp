import React from 'react';
import { Batch } from '../types';
import { PencilIcon, PlusIcon, TrashIcon } from './icons';

interface BatchGalleryProps {
  batches: Batch[];
  onSelectBatch: (batch: Batch) => void;
  onAddBatch: () => void;
  onEditBatch: (batch: Batch) => void;
  onDeleteBatch: (batchId: string) => void;
}

const BatchGallery: React.FC<BatchGalleryProps> = ({ batches, onSelectBatch, onAddBatch, onEditBatch, onDeleteBatch }) => {
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
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => { e.stopPropagation(); onEditBatch(batch); }}
                className="p-2 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40"
                aria-label="Edit batch"
              >
                <PencilIcon />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteBatch(batch.id); }}
                className="p-2 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40"
                aria-label="Delete batch"
              >
                <TrashIcon />
              </button>
            </div>
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
        <div
          onClick={onAddBatch}
          className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition-all duration-300 p-6 flex flex-col items-center justify-center text-gray-400 hover:text-pink-500 min-h-[180px]"
        >
          <PlusIcon />
          <span className="mt-2 font-semibold">Add New Batch</span>
        </div>
      </div>
    </div>
  );
};

export default BatchGallery;
