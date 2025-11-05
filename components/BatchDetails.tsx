import React, { useState } from 'react';
import { Batch, Kid } from '../types';
import KidCard from './KidCard';
import AddKidForm from './AddKidForm';
import { BackArrowIcon, PencilIcon, PlusIcon } from './icons';

interface BatchDetailsProps {
  batch: Batch;
  onBack: () => void;
  onAddKid: (batchId: string, kidData: Omit<Kid, 'id' | 'lastBillPaidDate'> & { lastBillPaidDate: string }) => void;
  onDeleteKid: (batchId: string, kidId: string) => void;
  onUpdateKid: (batchId: string, kidId: string, newDate: Date) => void;
  onEditBatch: (batch: Batch) => void;
}

const BatchDetails: React.FC<BatchDetailsProps> = ({ batch, onBack, onAddKid, onDeleteKid, onUpdateKid, onEditBatch }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  const handleAddKid = (kidData: Omit<Kid, 'id' | 'lastBillPaidDate'> & { lastBillPaidDate: string }) => {
    onAddKid(batch.id, kidData);
    setShowAddForm(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
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
              <button 
                onClick={() => onEditBatch(batch)}
                className="text-gray-400 hover:text-pink-500 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
                aria-label="Edit batch details"
              >
                  <PencilIcon />
              </button>
            </div>
            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="mt-4 sm:mt-0 flex items-center bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors duration-200 shadow-sm"
            >
                <PlusIcon />
                <span className="ml-2">{showAddForm ? 'Cancel' : 'Add Student'}</span>
            </button>
        </div>
        
        {showAddForm && <AddKidForm onSubmit={handleAddKid} />}
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
                        onDelete={() => onDeleteKid(batch.id, kid.id)}
                        onUpdateDate={(newDate) => onUpdateKid(batch.id, kid.id, newDate)}
                    />
                ))
            }
          </div>
        ) : (
          <div className="text-center bg-white rounded-xl shadow-sm p-12">
            <p className="text-gray-500">No students have been added to this batch yet.</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Student" to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchDetails;