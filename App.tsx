import React, { useState } from 'react';
import { Batch, Kid } from './types';
import BatchGallery from './components/BatchGallery';
import BatchDetails from './components/BatchDetails';
import GoogleSheetConnector, { SheetUrls } from './components/GoogleSheetConnector';
import { SpinnerIcon } from './components/icons';

// --- CSV Parsing and Data Processing Logic ---

// A more robust CSV parser that handles quoted fields containing commas and escaped quotes.
const parseCSV = (csvText: string): Record<string, string>[] => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // This simple split should be fine for headers, as they don't usually contain commas or quotes.
  // We'll also trim them for safety.
  const headers = lines[0].split(',').map(h => h.trim());

  // Function to parse a single, complex CSV line
  const parseLine = (line: string): string[] => {
    const values = [];
    let currentVal = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // This is an escaped quote (e.g., "" inside a field)
          currentVal += '"';
          i++; // Skip the second quote in the pair
        } else {
          // This is a regular quote, toggle the inQuotes flag
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // A comma outside of quotes is a field separator
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        // A regular character, part of the current field
        currentVal += char;
      }
    }
    values.push(currentVal.trim()); // Add the last value
    return values;
  };
  
  const rows = lines.slice(1).map(line => {
    if (!line.trim()) return null; // Skip empty lines
    const values = parseLine(line);

    return headers.reduce((obj, header, index) => {
      // Assign value to header, provide empty string if value is missing
      obj[header] = values[index] || ''; 
      return obj;
    }, {} as Record<string, string>);
  }).filter(row => row !== null); // Filter out the empty lines we nulled earlier
  
  return rows as Record<string, string>[];
};

// Fetches and processes data from published Google Sheet CSVs
async function fetchSheetData(urls: SheetUrls): Promise<Batch[]> {
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
    // FIX: Be case-insensitive for common headers from the sheet
    name: kid.name || kid.Name,
    age: parseInt(kid.age || kid.Age, 10),
    lastBillPaidDate: new Date(kid.lastBillPaidDate),
    batchId: kid.batchId || kid.BatchId // Keep batchId for mapping
  }))
  // Filter out any kids that are missing an id or a name from the CSV
  // This prevents crashes from incomplete rows in the Google Sheet.
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


// --- App Component ---

const App: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [sheetUrls, setSheetUrls] = useState<SheetUrls | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDataLoaded = sheetUrls !== null;

  const handleConnectSheet = async (urls: SheetUrls) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSheetData(urls);
      setBatches(data);
      setSheetUrls(urls);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please check the URLs and ensure they are correct CSV links from "Publish to the web".');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateKid = async (kidId: string, batchId: string, newDate: Date) => {
    if (!sheetUrls?.appsScriptUrl) {
      alert("Apps Script URL is not configured. Cannot update the sheet.");
      return;
    }

    const originalBatches = JSON.parse(JSON.stringify(batches));

    // Optimistic UI Update
    const updatedBatches = batches.map(b => {
      if (b.id === batchId) {
        return {
          ...b,
          kids: b.kids.map(k => k.id === kidId ? { ...k, lastBillPaidDate: newDate } : k)
        };
      }
      return b;
    });
    setBatches(updatedBatches);
    if(selectedBatch?.id === batchId) {
        const updatedSelectedBatch = updatedBatches.find(b => b.id === batchId);
        if (updatedSelectedBatch) setSelectedBatch(updatedSelectedBatch);
    }


    // Call Apps Script to update the sheet
    try {
      const response = await fetch(sheetUrls.appsScriptUrl, {
        method: 'POST',
        // CORS is required. The Apps Script needs to be deployed to allow anonymous access.
        mode: 'cors',
        // Apps Script web apps often perform a redirect, which needs to be followed.
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Recommended for simple POST to Apps Script
        },
        body: JSON.stringify({
          studentId: kidId,
          // Format date as YYYY-MM-DD for easy parsing in the sheet
          newDate: newDate.toISOString().split('T')[0]
        })
      });

      const result = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.message || 'The script returned an error.');
      }
    } catch (error) {
      console.error("Failed to update Google Sheet:", error);
      alert("Could not update the Google Sheet. Your change has been reverted. Please check your Apps Script setup and internet connection.");
      // Revert UI on failure
      setBatches(originalBatches);
      if(selectedBatch?.id === batchId) {
        const originalSelectedBatch = originalBatches.find((b: Batch) => b.id === batchId);
        if (originalSelectedBatch) setSelectedBatch(originalSelectedBatch);
    }
    }
  };


  const handleDisconnect = () => {
    setSheetUrls(null);
    setBatches([]);
    setSelectedBatch(null);
    setError(null);
  };

  const handleSelectBatch = (batch: Batch) => {
    setSelectedBatch(batch);
  };

  const handleGoBack = () => {
    setSelectedBatch(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <SpinnerIcon />
          <p className="text-lg text-gray-600 mt-4">Fetching data from Google Sheets...</p>
        </div>
      );
    }

    if (!isDataLoaded) {
      return <GoogleSheetConnector onConnect={handleConnectSheet} error={error} />;
    }

    return selectedBatch ? (
      <BatchDetails
        batch={selectedBatch}
        onBack={handleGoBack}
        onUpdateKid={handleUpdateKid}
      />
    ) : (
      <BatchGallery
        batches={batches}
        onSelectBatch={handleSelectBatch}
      />
    );
  };

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8 relative">
        <h1 className="text-4xl sm:text-5xl font-bold text-pink-600 tracking-tight">
          Little Stars Dance Academy
        </h1>
        <p className="text-lg text-gray-500 mt-2">Your dance group management dashboard</p>
         {isDataLoaded && (
          <button 
            onClick={handleDisconnect} 
            className="absolute top-0 right-0 mt-2 mr-2 bg-gray-200 text-gray-700 text-sm font-semibold py-1 px-3 rounded-lg hover:bg-gray-300 transition-colors">
            Disconnect Sheet
          </button>
        )}
      </header>

      <main>
        {renderContent()}
      </main>
      
      <footer className="text-center mt-12 text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Little Stars Dance Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;