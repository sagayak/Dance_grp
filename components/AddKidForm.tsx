
import React, { useState } from 'react';
import { Kid } from '../types';

interface AddKidFormProps {
  onSubmit: (kidData: Omit<Kid, 'id' | 'lastBillPaidDate'> & { lastBillPaidDate: string }) => void;
}

const AddKidForm: React.FC<AddKidFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [lastBillPaidDate, setLastBillPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age) {
      setError('Name and Age are required.');
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum <= 0) {
      setError('Please enter a valid age.');
      return;
    }
    
    setError('');
    onSubmit({ name, age: ageNum, lastBillPaidDate });
    
    // Reset form
    setName('');
    setAge('');
    setLastBillPaidDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t pt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Student Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="e.g., Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="e.g., 8"
          />
        </div>
        <div>
          <label htmlFor="lastBillPaidDate" className="block text-sm font-medium text-gray-700">Last Bill Paid Date</label>
          <input
            type="date"
            id="lastBillPaidDate"
            value={lastBillPaidDate}
            onChange={(e) => setLastBillPaidDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="text-right mt-4">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Add Student
        </button>
      </div>
    </form>
  );
};

export default AddKidForm;
