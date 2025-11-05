
import { Batch } from './types';

export const INITIAL_BATCHES: Batch[] = [
  {
    id: 'batch-1',
    time: '4 PM - 5 PM',
    day: 'Mon, Wed, Fri',
    instructor: 'Ms. Alice',
    kids: [
      { id: 'kid-1-1', name: 'Lily Chen', age: 7, lastBillPaidDate: new Date() },
      { id: 'kid-1-2', name: 'Leo Smith', age: 8, lastBillPaidDate: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
      { id: 'kid-1-3', name: 'Mia Wong', age: 6, lastBillPaidDate: new Date() },
    ],
  },
  {
    id: 'batch-2',
    time: '5 PM - 6 PM',
    day: 'Mon, Wed, Fri',
    instructor: 'Mr. David',
    kids: [
      { id: 'kid-2-1', name: 'Noah Brown', age: 9, lastBillPaidDate: new Date() },
      { id: 'kid-2-2', name: 'Ava Jones', age: 10, lastBillPaidDate: new Date() },
    ],
  },
  {
    id: 'batch-3',
    time: '6 PM - 7 PM',
    day: 'Tue, Thu',
    instructor: 'Ms. Clara',
    kids: [
      { id: 'kid-3-1', name: 'Jack Miller', age: 11, lastBillPaidDate: new Date(new Date().setMonth(new Date().getMonth() - 2)) },
      { id: 'kid-3-2', name: 'Zoe Garcia', age: 12, lastBillPaidDate: new Date() },
      { id: 'kid-3-3', name: 'Ethan Roy', age: 11, lastBillPaidDate: new Date() },
    ],
  },
  {
    id: 'batch-4',
    time: '7 PM - 8 PM',
    day: 'Tue, Thu',
    instructor: 'Mr. Frank',
    kids: [],
  },
];
