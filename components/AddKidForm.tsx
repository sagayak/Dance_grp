import React, { useState } from 'react';
import { Kid } from '../types';

interface AddKidFormProps {
  onAddKid: (kid: Omit<Kid, 'id'>) => void;
  onCancel: () => void;
  batchId: string;
}

const AddKidForm: React.FC<AddKidFormProps> = ({ onAddKid, onCancel, batchId }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [lastBillPaidDate, setLastBillPaidDate] = useState(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age) {
      alert('Please fill out all fields.');
      return;
    }
    onAddKid({
      name,
      age: parseInt(age, 10),
      lastBillPaidDate,
      batchId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Add New Kid</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="age" className="block text-gray-700 font-semibold mb-2">Age</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lastBillPaidDate" className="block text-gray-700 font-semibold mb-2">Last Bill Paid Date</label>
            <input
              type="date"
              id="lastBillPaidDate"
              value={lastBillPaidDate.toISOString().split('T')[0]}
              onChange={(e) => setLastBillPaidDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400">
              Cancel
            </button>
            <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">
              Add Kid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddKidForm;
