import React, { createContext, useContext, useState } from 'react';

const ReconContext = createContext(null);

export const ReconProvider = ({ children }) => {
  const [reconciliationResult, setReconciliationResult] = useState(null);

  return (
    <ReconContext.Provider
      value={{
        reconciliationResult,
        setReconciliationResult,
      }}
    >
      {children}
    </ReconContext.Provider>
  );
};

export const useRecon = () => {
  const context = useContext(ReconContext);

  if (context === null) {
    throw new Error('useRecon must be used inside ReconProvider');
  }

  return context;
};