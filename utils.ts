import { Batch, Kid } from './types';
import { SheetUrls } from './components/GoogleSheetConnector';

// A more robust CSV parser that handles quoted fields containing commas and escaped quotes.
const parseCSV = (csvText: string): Record<string, string>[] => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());

  const parseLine = (line: string): string[] => {
    const values = [];
    let currentVal = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          currentVal += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());
    return values;
  };

  const rows = lines.slice(1).map(line => {
    if (!line.trim()) return null;
    const values = parseLine(line);

    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || '';
      return obj;
    }, {} as Record<string, string>);
  }).filter(row => row !== null);

  return rows as Record<string, string>[];
};

export async function fetchSheetData(urls: SheetUrls): Promise<Batch[]> {
  const [batchesResponse, kidsResponse] = await Promise.all([
    fetch(urls.batchesUrl),
    fetch(urls.studentsUrl)
  ]);

  if (!batchesResponse.ok || !kidsResponse.ok) {
    throw new Error('Could not fetch one or both of the CSV files.');
  }

  const [batchesCSV, kidsCSV] = await Promise.all([
    batchesResponse.text(),
    kidsResponse.text()
  ]);

  const rawBatches = parseCSV(batchesCSV);
  const rawKids = parseCSV(kidsCSV);

  const kidsData: Kid[] = rawKids.map(kid => ({
    id: kid.id,
    name: kid.name || kid.Name,
    age: parseInt(kid.age || kid.Age, 10),
    lastBillPaidDate: new Date(kid.lastBillPaidDate),
    batchId: kid.batchId || kid.BatchId
  }))
  .filter(kid => kid.id && kid.name);

  const batchesData: Batch[] = rawBatches.map(batch => ({
    id: batch.id,
    time: batch.time,
    day: batch.day,
    instructor: batch.instructor,
    kids: kidsData.filter(kid => kid.batchId === batch.id)
  }));

  return batchesData;
}
