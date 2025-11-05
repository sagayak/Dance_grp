import React, { useState } from 'react';
import { Kid } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface KidCardProps {
  kid: Kid;
  onDelete: () => void;
  onUpdateDate: (newDate: Date) => void;
}

const KidCard: React.FC<KidCardProps> = ({ kid, onDelete, onUpdateDate }) => {
  const [isEditingDate, setIsEditingDate] = useState(false);

  const isPaymentOverdue = () => {
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Set hours to 0 to avoid timezone issues where the date might be the last day of the previous month
    firstDayOfCurrentMonth.setHours(0, 0, 0, 0);
    const paidDate = new Date(kid.lastBillPaidDate);
    paidDate.setHours(0,0,0,0);
    return paidDate < firstDayOfCurrentMonth;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      // Using 'T00:00:00' helps prevent timezone-related issues where new Date('YYYY-MM-DD') might result in the previous day.
      onUpdateDate(new Date(`${dateValue}T00:00:00`));
      setIsEditingDate(false);
    }
  };

  const overdue = isPaymentOverdue();
  const cardBgClass = overdue ? 'bg-red-100 border-red-400' : 'bg-white';
  const textColorClass = overdue ? 'text-red-800' : 'text-gray-800';
  const subTextColorClass = overdue ? 'text-red-600' : 'text-gray-500';

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl shadow-sm border ${cardBgClass} transition-colors duration-300`}>
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${overdue ? 'bg-red-200 text-red-700' : 'bg-pink-100 text-pink-600'}`}>
          {kid.name.charAt(0)}
        </div>
        <div>
            <div className="flex items-center space-x-2">
                <p className={`font-bold text-lg ${textColorClass}`}>{kid.name}</p>
                {overdue ? (
                    <span className="px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Overdue</span>
                ) : (
                    <span className="px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Paid</span>
                )}
            </div>
          <p className={`text-sm ${subTextColorClass}`}>Age: {kid.age}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className={`text-sm font-medium ${subTextColorClass}`}>Last Bill Paid</p>
          {isEditingDate ? (
             <input
                type="date"
                value={kid.lastBillPaidDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                onBlur={() => setIsEditingDate(false)} // Hide if user clicks away
                autoFocus
                className="block w-full px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          ) : (
            <div className="flex items-center justify-end group">
                <p className={`font-semibold ${textColorClass} mr-1`}>
                    {kid.lastBillPaidDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <button onClick={() => setIsEditingDate(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-pink-500 transition-opacity" aria-label="Edit date">
                    <PencilIcon />
                </button>
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Are you sure you want to remove ${kid.name}?`)) {
              onDelete();
            }
          }}
          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
          aria-label={`Delete ${kid.name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default KidCard;