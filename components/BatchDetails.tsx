import React, { useState } from 'react';
import { Batch, Kid } from '../types';
import KidCard from './KidCard';
import { BackArrowIcon, AddIcon } from './icons';
import AddKidForm from './AddKidForm';

interface BatchDetailsProps {
  batch: Batch;
  onBack: () => void;
  onUpdateKid: (kidId: string, batchId: string, newDate: Date) => void;
  onAddKid: (kid: Omit<Kid, 'id'>) => void;
}

const BatchDetails: React.FC<BatchDetailsProps> = ({ batch, onBack, onUpdateKid, onAddKid }) => {
  const [isAddKidModalOpen, setIsAddKidModalOpen] = useState(false);

  const handleAddKid = (kid: Omit<Kid, 'id'>) => {
    onAddKid(kid);
    setIsAddKidModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {isAddKidModalOpen && (
        <AddKidForm
          onAddKid={handleAddKid}
          onCancel={() => setIsAddKidModalOpen(false)}
          batchId={batch.id}
        />
      )}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-pink-600 font-semibold transition-colors duration-200"
        >
          <BackArrowIcon />
          <span className="ml-2">All Batches</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-3xl font-bold text-pink-600">{batch.time} Batch</h2>
              <p className="text-gray-500 mt-1">{batch.day} with {batch.instructor}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddKidModalOpen(true)}
            className="mt-4 sm:mt-0 flex items-center bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
          >
            <AddIcon />
            <span className="ml-2">Add Student</span>
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4 px-1">Student Roster ({batch.kids.length})</h3>
        {batch.kids.length > 0 ? (
          <div className="space-y-4">
            {batch.kids
                .slice() // Create a shallow copy to avoid mutating the original array
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort kids alphabetically by name
                .map(kid => (
                    <KidCard 
                        key={kid.id} 
                        kid={kid}
                        onUpdateDate={(newDate) => onUpdateKid(kid.id, batch.id, newDate)} 
                    />
                ))
            }
          </div>
        ) : (
          <div className="text-center bg-white rounded-xl shadow-sm p-12">
            <p className="text-gray-500">No students found for this batch in the Google Sheet.</p>
            <p className="text-gray-400 text-sm mt-2">Check the 'batchId' in your 'Students' tab.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchDetails;
