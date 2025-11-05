export interface Kid {
  id: string;
  name:string;
  age: number;
  lastBillPaidDate: Date;
  batchId?: string; // Used temporarily for mapping, not needed in the final state
}

export interface Batch {
  id: string;
  time: string;
  day: string;
  instructor: string;
  kids: Kid[];
}