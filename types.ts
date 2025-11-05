
export interface Kid {
  id: string;
  name: string;
  age: number;
  lastBillPaidDate: Date;
}

export interface Batch {
  id: string;
  time: string;
  day: string;
  instructor: string;
  kids: Kid[];
}
