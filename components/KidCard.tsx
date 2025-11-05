import React, { useState } from 'react';
import { Kid } from '../types';
import { PencilIcon } from './icons';

interface KidCardProps {
  kid: Kid;
  onUpdateDate: (date: Date) => void;
}

const KidCard: React.FC<KidCardProps> = ({ kid, onUpdateDate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    // Adjust for timezone offset to prevent the date from being off by one day
    const timezoneOffset = newDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(newDate.getTime() + timezoneOffset);
    onUpdateDate(adjustedDate);
    setIsEditing(false);
  };

  const isPaymentOverdue = () => {
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfCurrentMonth.setHours(0, 0, 0, 0);
    const paidDate = new Date(kid.lastBillPaidDate);
    paidDate.setHours(0,0,0,0);
    return paidDate < firstDayOfCurrentMonth;
  };

  const overdue = isPaymentOverdue();
  const cardBgClass = overdue ? 'bg-red-100 border-red-400' : 'bg-white';
  const textColorClass = overdue ? 'text-red-800' : 'text-gray-800';
  const subTextColorClass = overdue ? 'text-red-600' : 'text-gray-500';

  const dateToInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
      <div className="text-right">
        <p className={`text-sm font-medium ${subTextColorClass}`}>Last Bill Paid</p>
        {isEditing ? (
          <input
            type="date"
            defaultValue={dateToInputValue(kid.lastBillPaidDate)}
            onChange={handleDateChange}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className={`p-1 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm ${textColorClass} bg-transparent`}
          />
        ) : (
          <div className="flex items-center space-x-2 justify-end">
            <p className={`font-semibold ${textColorClass}`}>
                {kid.lastBillPaidDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <button onClick={() => setIsEditing(true)} className={`p-1 rounded-full hover:bg-gray-200 ${subTextColorClass}`}>
                <PencilIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KidCard;
