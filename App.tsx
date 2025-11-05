import React, { useState, useEffect } from 'react';
import { Batch, Kid } from './types';
import BatchGallery from './components/BatchGallery';
import BatchDetails from './components/BatchDetails';
import GoogleSheetConnector, { SheetUrls } from './components/GoogleSheetConnector';
import { SpinnerIcon } from './components/icons';

const LOCAL_STORAGE_KEY = 'danceAppSheetUrls';

// --- CSV Parsing and Data Processing Logic ---

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


// --- App Component ---

const App: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [sheetUrls, setSheetUrls] = useState<SheetUrls | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check localStorage
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
        const savedUrls = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedUrls) {
            const parsedUrls: SheetUrls = JSON.parse(savedUrls);
            handleConnectSheet(parsedUrls);
        } else {
            setIsLoading(false); // No saved URLs, stop loading and show connector
        }
    } catch (e) {
        console.error("Failed to parse stored URLs", e);
        setIsLoading(false);
    }
  }, []);

  const handleConnectSheet = async (urls: SheetUrls) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSheetData(urls);
      setBatches(data);
      setSheetUrls(urls);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(urls));
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please check the URLs and ensure they are correct CSV links from "Publish to the web".');
      // If auto-loading fails, clear stored URLs so user can re-enter them
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setSheetUrls(null);
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

    try {
      const response = await fetch(sheetUrls.appsScriptUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          studentId: kidId,
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
      setBatches(originalBatches);
      if(selectedBatch?.id === batchId) {
        const originalSelectedBatch = originalBatches.find((b: Batch) => b.id === batchId);
        if (originalSelectedBatch) setSelectedBatch(originalSelectedBatch);
    }
    }
  };


  const handleDisconnect = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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
          <p className="text-lg text-gray-600 mt-4">Loading Dashboard...</p>
        </div>
      );
    }

    if (!sheetUrls) {
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
         {sheetUrls && (
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