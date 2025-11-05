import React, { useState, useEffect } from 'react';
import { Batch } from '../types';

type BatchFormData = Omit<Batch, 'id' | 'kids'>;

interface BatchFormProps {
  onSubmit: (data: BatchFormData) => void;
  onCancel: () => void;
  initialData?: Batch | null;
}

const BatchForm: React.FC<BatchFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [time, setTime] = useState('');
  const [day, setDay] = useState('');
  const [instructor, setInstructor] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (initialData) {
      setTime(initialData.time);
      setDay(initialData.day);
      setInstructor(initialData.instructor);
    } else {
      setTime('');
      setDay('');
      setInstructor('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time.trim() || !day.trim() || !instructor.trim()) {
      setError('All fields are required.');
      return;
    }
    setError('');
    onSubmit({ time, day, instructor });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{initialData ? 'Edit Batch' : 'Add New Batch'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time Slot</label>
              <input
                type="text"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="e.g., 8 PM - 9 PM"
              />
            </div>
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700">Days</label>
              <input
                type="text"
                id="day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="e.g., Sat, Sun"
              />
            </div>
            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">Instructor</label>
              <input
                type="text"
                id="instructor"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="e.g., Ms. Emily"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Save Batch
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BatchForm;
