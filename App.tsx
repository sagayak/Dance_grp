import React, { useState } from 'react';
import { Batch, Kid } from './types';
import { INITIAL_BATCHES } from './constants';
import BatchGallery from './components/BatchGallery';
import BatchDetails from './components/BatchDetails';
import BatchForm from './components/BatchForm';

type BatchFormData = Omit<Batch, 'id' | 'kids'>;

const App: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const [isBatchFormOpen, setIsBatchFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const handleSelectBatch = (batch: Batch) => {
    setSelectedBatch(batch);
  };

  const handleGoBack = () => {
    setSelectedBatch(null);
  };

  // Kid Management
  const handleAddKid = (batchId: string, kidData: Omit<Kid, 'id' | 'lastBillPaidDate'> & { lastBillPaidDate: string }) => {
    const newKid: Kid = {
        ...kidData,
        id: `kid-${batchId}-${Date.now()}`,
        lastBillPaidDate: new Date(kidData.lastBillPaidDate),
    };

    setBatches(prevBatches => {
        const updatedBatches = prevBatches.map(batch => {
            if (batch.id === batchId) {
                const updatedKids = [...batch.kids, newKid];
                return { ...batch, kids: updatedKids };
            }
            return batch;
        });

        if (selectedBatch && selectedBatch.id === batchId) {
            setSelectedBatch(prevSelected => prevSelected ? { ...prevSelected, kids: [...prevSelected.kids, newKid] } : null);
        }

        return updatedBatches;
    });
  };

  const handleDeleteKid = (batchId: string, kidId: string) => {
    setBatches(prevBatches => {
        const updatedBatches = prevBatches.map(batch => {
            if (batch.id === batchId) {
                const updatedKids = batch.kids.filter(kid => kid.id !== kidId);
                return { ...batch, kids: updatedKids };
            }
            return batch;
        });

        if (selectedBatch && selectedBatch.id === batchId) {
            setSelectedBatch(prevSelected => prevSelected ? { ...prevSelected, kids: prevSelected.kids.filter(kid => kid.id !== kidId) } : null);
        }

        return updatedBatches;
    });
  };

  // Batch Management
  const handleOpenAddBatchForm = () => {
    setEditingBatch(null);
    setIsBatchFormOpen(true);
  };

  const handleOpenEditBatchForm = (batch: Batch) => {
    setEditingBatch(batch);
    setIsBatchFormOpen(true);
  };
  
  const handleCloseBatchForm = () => {
    setIsBatchFormOpen(false);
    setEditingBatch(null);
  };

  const handleSaveBatch = (batchData: BatchFormData) => {
    if (editingBatch) {
      // Update existing batch
      setBatches(prevBatches => {
        const updatedBatches = prevBatches.map(b => 
          b.id === editingBatch.id ? { ...b, ...batchData } : b
        );
        if (selectedBatch && selectedBatch.id === editingBatch.id) {
            setSelectedBatch(prev => prev ? {...prev, ...batchData} : null);
        }
        return updatedBatches;
      });
    } else {
      // Add new batch
      const newBatch: Batch = {
        ...batchData,
        id: `batch-${Date.now()}`,
        kids: [],
      };
      setBatches(prevBatches => [...prevBatches, newBatch]);
    }
    handleCloseBatchForm();
  };

  const handleDeleteBatch = (batchId: string) => {
    if(window.confirm('Are you sure you want to delete this batch? All student data within it will be lost.')) {
      setBatches(prevBatches => prevBatches.filter(b => b.id !== batchId));
      if(selectedBatch && selectedBatch.id === batchId) {
        setSelectedBatch(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-pink-600 tracking-tight">
          Little Stars Dance Academy
        </h1>
        <p className="text-lg text-gray-500 mt-2">Your dance group management dashboard</p>
      </header>
      <main>
        {selectedBatch ? (
          <BatchDetails
            batch={selectedBatch}
            onBack={handleGoBack}
            onAddKid={handleAddKid}
            onDeleteKid={handleDeleteKid}
            onEditBatch={handleOpenEditBatchForm}
          />
        ) : (
          <BatchGallery 
            batches={batches} 
            onSelectBatch={handleSelectBatch}
            onAddBatch={handleOpenAddBatchForm}
            onEditBatch={handleOpenEditBatchForm}
            onDeleteBatch={handleDeleteBatch}
          />
        )}
      </main>
      <footer className="text-center mt-12 text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Little Stars Dance Academy. All rights reserved.</p>
      </footer>
      
      {isBatchFormOpen && (
        <BatchForm 
          onSubmit={handleSaveBatch}
          onCancel={handleCloseBatchForm}
          initialData={editingBatch}
        />
      )}
    </div>
  );
};

export default App;
