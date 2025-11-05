import React from 'react';
import { Kid } from '../types';
import { TrashIcon } from './icons';

interface KidCardProps {
  kid: Kid;
  onDelete: () => void;
}

const KidCard: React.FC<KidCardProps> = ({ kid, onDelete }) => {
  const isPaymentOverdue = () => {
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return kid.lastBillPaidDate < firstDayOfCurrentMonth;
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
          <p className={`font-semibold ${textColorClass}`}>
            {kid.lastBillPaidDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
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