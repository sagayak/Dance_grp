import React, { useState } from 'react';

export interface SheetUrls {
  batchesUrl: string;
  studentsUrl: string;
  appsScriptUrl: string;
}

interface GoogleSheetConnectorProps {
  onConnect: (urls: SheetUrls) => void;
  error: string | null;
}

const GoogleSheetConnector: React.FC<GoogleSheetConnectorProps> = ({ onConnect, error }) => {
  const [urls, setUrls] = useState<SheetUrls>({ batchesUrl: '', studentsUrl: '', appsScriptUrl: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urls.batchesUrl.trim() && urls.studentsUrl.trim() && urls.appsScriptUrl.trim()) {
      onConnect(urls);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUrls(prev => ({...prev, [name]: value}));
  };
  
  const appsScriptCode = `
const STUDENTS_SHEET_NAME = "Students";
const ID_COLUMN_INDEX = 1; 
const DATE_COLUMN_NAME = "lastBillPaidDate";

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STUDENTS_SHEET_NAME);
    if (!sheet) {
      throw new Error(\`Sheet "\${STUDENTS_SHEET_NAME}" not found.\`);
    }
    const postData = JSON.parse(e.postData.contents);
    const { studentId, newDate } = postData;
    if (!studentId || !newDate) {
      throw new Error("Missing 'studentId' or 'newDate'.");
    }
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dateColumnIndex = headers.indexOf(DATE_COLUMN_NAME) + 1;
    if (dateColumnIndex === 0) {
      throw new Error(\`Column "\${DATE_COLUMN_NAME}" not found.\`);
    }
    const idRange = sheet.getRange(2, ID_COLUMN_INDEX, sheet.getLastRow() - 1, 1).getValues();
    let rowIndex = -1;
    for (let i = 0; i < idRange.length; i++) {
      if (idRange[i][0] == studentId) {
        rowIndex = i + 2;
        break;
      }
    }
    if (rowIndex === -1) {
      throw new Error(\`Student with ID "\${studentId}" not found.\`);
    }
    sheet.getRange(rowIndex, dateColumnIndex).setValue(newDate);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}`;


  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Your Google Sheet</h2>
      <p className="text-gray-500 mb-6">
        Provide links to your published sheets and a deployed Apps Script to enable editing.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="batchesUrl" className="block text-sm font-medium text-gray-700 text-left mb-1">1. Batches CSV URL</label>
          <input
            id="batchesUrl" name="batchesUrl" type="url" value={urls.batchesUrl} onChange={handleInputChange}
            placeholder="URL for the published 'Batches' sheet"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required
          />
        </div>
        <div>
           <label htmlFor="studentsUrl" className="block text-sm font-medium text-gray-700 text-left mb-1">2. Students CSV URL</label>
          <input
            id="studentsUrl" name="studentsUrl" type="url" value={urls.studentsUrl} onChange={handleInputChange}
            placeholder="URL for the published 'Students' sheet"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required
          />
        </div>
         <div>
           <label htmlFor="appsScriptUrl" className="block text-sm font-medium text-gray-700 text-left mb-1">3. Google Apps Script URL (for editing)</label>
          <input
            id="appsScriptUrl" name="appsScriptUrl" type="url" value={urls.appsScriptUrl} onChange={handleInputChange}
            placeholder="URL of your deployed Web App script"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required
          />
        </div>
        <button type="submit" className="w-full bg-pink-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-pink-600 transition-colors duration-200 shadow-sm">
          Load Data
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <div className="text-left mt-8 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold text-gray-700 mb-2">Setup Instructions:</h3>
          <div className="text-sm text-gray-600 space-y-4">
            <div>
              <p className="font-semibold">Part A: Get CSV URLs (Read Access)</p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>In your Google Sheet, go to <span className="font-semibold">File &rarr; Share &rarr; Publish to web</span>.</li>
                  <li>Select the <code className="bg-gray-200 px-1 rounded">Batches</code> sheet, choose <span className="font-semibold">"Comma-separated values (.csv)"</span>, click <span className="font-semibold">Publish</span>, and copy the link into field #1.</li>
                  <li>Repeat for the <code className="bg-gray-200 px-1 rounded">Students</code> sheet and paste its link into field #2.</li>
              </ol>
            </div>
             <div>
              <p className="font-semibold">Part B: Create Apps Script (Write Access)</p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>In the same Google Sheet, go to <span className="font-semibold">Extensions &rarr; Apps Script</span>.</li>
                  <li>Delete any placeholder code and paste the code below into the editor:
                    <pre className="w-full text-xs overflow-auto bg-gray-800 text-white p-3 rounded-md my-2"><code>{appsScriptCode}</code></pre>
                  </li>
                  <li>Click the <span className="font-semibold">Save project</span> icon.</li>
                  <li>Click the blue <span className="font-semibold">Deploy</span> button, then select <span className="font-semibold">New deployment</span>.</li>
                  <li>Click the gear icon next to "Select type", and choose <span className="font-semibold">Web app</span>.</li>
                  <li>In the "Who has access" dropdown, select <span className="font-semibold">Anyone</span>. This is required for the app to reach the script.</li>
                  <li>Click <span className="font-semibold">Deploy</span>. You may need to grant permissions to the script.</li>
                  <li>Copy the <span className="font-semibold">Web app URL</span> and paste it into field #3 above.</li>
              </ol>
            </div>
          </div>
      </div>
    </div>
  );
};

export default GoogleSheetConnector;
