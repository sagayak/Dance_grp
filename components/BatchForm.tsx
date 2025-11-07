import React, { useState } from 'react';
import { Batch } from '../types';

interface BatchFormProps {
  onAddBatch: (batch: Omit<Batch, 'id' | 'kids'>) => void;
  onCancel: () => void;
}

const BatchForm: React.FC<BatchFormProps> = ({ onAddBatch, onCancel }) => {
  const [time, setTime] = useState('');
  const [day, setDay] = useState('');
  const [instructor, setInstructor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !day || !instructor) {
      alert('Please fill out all fields.');
      return;
    }
    onAddBatch({
      time,
      day,
      instructor,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Add New Batch</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="time" className="block text-gray-700 font-semibold mb-2">Time</label>
            <input
              type="text"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="day" className="block text-gray-700 font-semibold mb-2">Day</label>
            <input
              type="text"
              id="day"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="instructor" className="block text-gray-700 font-semibold mb-2">Instructor</label>
            <input
              type="text"
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">
              Add Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchForm;
