import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Landmark,
  Database,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { UploadCard } from '../components/UploadCard';

import { runReconciliation } from '../services/api';
import { useRecon } from '../context/ReconContext';


export const UploadData = () => {

  const navigate = useNavigate();


  /* =========================================
     RECONCILIATION CONTEXT
  ========================================= */

  const {
    setReconciliationResult
  } = useRecon();


  /* =========================================
     LOCAL STATE
  ========================================= */

  const [bankFile, setBankFile] = useState(null);

  const [ledgerFile, setLedgerFile] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const [error, setError] = useState(null);

  const [analysisResult, setAnalysisResult] = useState(null);


  /* =========================================
     CSV → JSON CONVERTER
  ========================================= */

  const parseCSV = (file) => {

    return new Promise((resolve, reject) => {

      const reader = new FileReader();


      reader.onload = (event) => {

        try {

          const text = event.target.result;


          const lines = text
            .trim()
            .split('\n')
            .filter(
              line => line.trim() !== ''
            );


          if (lines.length < 2) {

            reject(
              new Error(
                'CSV file must contain headers and at least one transaction.'
              )
            );

            return;

          }


          /* =========================================
             GET HEADERS
          ========================================= */

          const headers = lines[0]
            .split(',')
            .map(
              header =>
                header
                  .trim()
                  .replace(/^"|"$/g, '')
            );


          /* =========================================
             CREATE JSON TRANSACTIONS
          ========================================= */

          const transactions = lines
            .slice(1)
            .map(
              line => {

                const values = line
                  .split(',')
                  .map(
                    value =>
                      value
                        .trim()
                        .replace(/^"|"$/g, '')
                  );


                const transaction = {};


                headers.forEach(
                  (header, index) => {

                    transaction[header] =
                      values[index] ?? '';

                  }
                );


                return transaction;

              }
            );


          resolve(transactions);

        }

        catch (error) {

          reject(error);

        }

      };


      reader.onerror = () => {

        reject(
          new Error(
            'Failed to read CSV file.'
          )
        );

      };


      reader.readAsText(file);

    });

  };


  /* =========================================
     RUN RECONCILIATION
  ========================================= */

  const handleRunAnalysis = async () => {

    if (!bankFile || !ledgerFile) {

      setError(
        'Please upload both Bank Statement and Ledger CSV files.'
      );

      return;

    }


    try {

      /* =========================================
         RESET PREVIOUS STATE
      ========================================= */

      setError(null);

      setIsSuccess(false);

      setAnalysisResult(null);

      setIsAnalyzing(true);


      /* =========================================
         READ BANK CSV
      ========================================= */

      const bankTransactions =
        await parseCSV(bankFile);


      /* =========================================
         READ LEDGER CSV
      ========================================= */

      const ledgerTransactions =
        await parseCSV(ledgerFile);


      console.log(
        'BANK TRANSACTIONS:',
        bankTransactions
      );


      console.log(
        'LEDGER TRANSACTIONS:',
        ledgerTransactions
      );


      /* =========================================
         SEND DATA TO BACKEND
      ========================================= */

      const result =
        await runReconciliation(
          bankTransactions,
          ledgerTransactions
        );


      /* =========================================
         VIEW BACKEND RESPONSE
      ========================================= */

      console.log(
        'RECONCILIATION RESULT:',
        result
      );


      /* =========================================
         SAVE LOCAL RESULT
      ========================================= */

      setAnalysisResult(result);


      /* =========================================
         SAVE RESULT TO RECON CONTEXT
      ========================================= */

      setReconciliationResult(result);


      /* =========================================
         SAVE CURRENT RESULT TO SESSION STORAGE
      ========================================= */

      sessionStorage.setItem(
        'reconciliationResult',
        JSON.stringify(result)
      );


      /* =========================================
         CALCULATE MATCH COUNT
      ========================================= */

      const matchCount =

        result.matches?.length ||

        result.matched_transactions?.length ||

        result.total_matches ||

        result.summary?.matched ||

        result.summary?.total_matches ||

        0;


      /* =========================================
         CALCULATE EXCEPTION COUNT
      ========================================= */

      const exceptionCount =

        result.exceptions?.length ||

        result.unmatched_transactions?.length ||

        result.total_exceptions ||

        result.summary?.exceptions ||

        result.summary?.total_exceptions ||

        0;


      /* =========================================
         CALCULATE TOTAL EXPOSURE
      ========================================= */

      const exposure =

        result.summary?.total_exposure ||

        result.summary?.exposure ||

        result.total_exposure ||

        result.total_risk_exposure ||

        0;


      /* =========================================
         LOAD EXISTING HISTORY
      ========================================= */

      let existingHistory = [];


      try {

        const savedHistory =
          localStorage.getItem(
            'reconciliationHistory'
          );


        if (savedHistory) {

          existingHistory =
            JSON.parse(savedHistory);

        }

      }

      catch (historyError) {

        console.error(
          'Failed to load reconciliation history:',
          historyError
        );

        existingHistory = [];

      }


      /* =========================================
         CREATE NEW HISTORY RUN
      ========================================= */

      const newRun = {

        id:
          `RUN-${Date.now()}`,


        runNumber:
          existingHistory.length + 1,


        dateTime:
          new Date().toLocaleString(),


        bankCount:
          bankTransactions.length,


        ledgerCount:
          ledgerTransactions.length,


        matchCount:
          matchCount,


        exceptionCount:
          exceptionCount,


        exposure:
          Number(exposure) || 0,


        result:
          result,

      };


      /* =========================================
         ADD NEW RUN TO HISTORY
      ========================================= */

      const updatedHistory = [

        newRun,

        ...existingHistory,

      ];


      /* =========================================
         SAVE HISTORY
      ========================================= */

      localStorage.setItem(

        'reconciliationHistory',

        JSON.stringify(
          updatedHistory
        )

      );


      console.log(
        'RECONCILIATION HISTORY SAVED:',
        updatedHistory
      );


      /* =========================================
         SUCCESS
      ========================================= */

      setIsSuccess(true);


    }

    catch (error) {

      console.error(
        'Reconciliation Failed:',
        error
      );


      setError(

        error.message ||

        'Reconciliation failed. Please try again.'

      );

    }

    finally {

      setIsAnalyzing(false);

    }

  };


  /* =========================================
     GET MATCHES COUNT
  ========================================= */

  const getMatchesCount = () => {

    if (!analysisResult) {

      return 0;

    }


    return (

      analysisResult.matches?.length ||

      analysisResult.matched_transactions?.length ||

      analysisResult.total_matches ||

      analysisResult.summary?.matched ||

      analysisResult.summary?.total_matches ||

      0

    );

  };


  /* =========================================
     GET EXCEPTIONS COUNT
  ========================================= */

  const getExceptionsCount = () => {

    if (!analysisResult) {

      return 0;

    }


    return (

      analysisResult.exceptions?.length ||

      analysisResult.unmatched_transactions?.length ||

      analysisResult.total_exceptions ||

      analysisResult.summary?.exceptions ||

      analysisResult.summary?.total_exceptions ||

      0

    );

  };


  return (

    <div className="space-y-6 pb-12 animate-in fade-in duration-200">


      {/* =========================================
         PAGE HEADER
      ========================================= */}

      <PageHeader

        title="Upload Financial Data"

        subtitle="Import bank statements and internal ledger CSVs for neural reconciliation and risk detection."

      />


      {/* =========================================
         UPLOAD CARDS
      ========================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


        {/* BANK FILE */}

        <UploadCard

          title="Bank Statement CSV"

          subtitle="Cleared bank transactions, reference codes, debit and credit postings"

          icon={Landmark}

          file={bankFile}

          onFileSelect={(file) => {

            setBankFile(file);

            setError(null);

            setIsSuccess(false);

          }}

          onFileRemove={() => {

            setBankFile(null);

            setIsSuccess(false);

          }}

        />


        {/* LEDGER FILE */}

        <UploadCard

          title="Internal Ledger CSV"

          subtitle="ERP ledger journal entries, invoice IDs, and internal accounts payable"

          icon={Database}

          file={ledgerFile}

          onFileSelect={(file) => {

            setLedgerFile(file);

            setError(null);

            setIsSuccess(false);

          }}

          onFileRemove={() => {

            setLedgerFile(null);

            setIsSuccess(false);

          }}

        />


      </div>


      {/* =========================================
         ERROR MESSAGE
      ========================================= */}

      {error && (

        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 flex items-start gap-3">


          <AlertTriangle

            className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"

          />


          <div>


            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">

              Reconciliation Failed

            </h4>


            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">

              {error}

            </p>


          </div>


        </div>

      )}


      {/* =========================================
         ANALYSIS SECTION
      ========================================= */}

      <div className="p-6 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft text-center transition-colors">


        {/* =====================================
           SUCCESS STATE
        ===================================== */}

        {isSuccess ? (

          <div className="py-4 space-y-4 animate-in zoom-in-95 duration-200">


            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">

              <CheckCircle2 className="w-8 h-8" />

            </div>


            <div>


              <h3 className="text-lg font-extrabold text-recon-light-text dark:text-recon-dark-text">

                ReconAI Analysis Complete!

              </h3>


              <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-1 font-medium max-w-md mx-auto">

                Reconciliation completed successfully.

                {' '}

                {getMatchesCount()}

                {' '}

                matches verified and

                {' '}

                {getExceptionsCount()}

                {' '}

                exceptions detected.

              </p>


            </div>


            {/* ACTION BUTTONS */}

            <div className="flex items-center justify-center gap-3 pt-2">


              <button

                onClick={() =>
                  navigate('/reconciliation')
                }

                className="px-6 py-2.5 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white font-extrabold text-xs shadow-soft hover:bg-recon-forestHover transition-all flex items-center gap-2"

              >

                <span>

                  View Reconciliation Results

                </span>


                <ArrowRight className="w-4 h-4" />


              </button>


              <button

                onClick={() => {

                  setIsSuccess(false);

                  setBankFile(null);

                  setLedgerFile(null);

                  setAnalysisResult(null);

                  setReconciliationResult(null);

                  setError(null);


                  sessionStorage.removeItem(
                    'reconciliationResult'
                  );

                }}

                className="px-4 py-2.5 rounded-xl bg-recon-light-bg dark:bg-recon-dark-cardHover text-recon-light-text dark:text-recon-dark-text font-bold text-xs hover:bg-recon-light-border dark:hover:bg-recon-dark-border transition-colors"

              >

                Upload New Data

              </button>


            </div>


          </div>

        ) : (


          /* =====================================
             READY STATE
          ===================================== */

          <div className="py-4 space-y-3">


            <div className="w-12 h-12 rounded-2xl bg-recon-light-soft dark:bg-recon-dark-cardHover text-recon-forest dark:text-recon-dark-accent flex items-center justify-center mx-auto">

              <ShieldCheck className="w-6 h-6" />

            </div>


            <h3 className="text-base font-extrabold text-recon-light-text dark:text-recon-dark-text">

              Ready for ReconAI Audit

            </h3>


            <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted max-w-lg mx-auto font-medium">

              Upload both CSV files above. ReconAI will analyze
              transaction amounts, reference strings, timestamps,
              duplicate transactions, mismatches and potential risks.

            </p>


            <button

              onClick={handleRunAnalysis}

              disabled={
                !bankFile ||
                !ledgerFile ||
                isAnalyzing
              }

              className={`mt-4 px-8 py-3 rounded-xl font-extrabold text-xs shadow-soft transition-all flex items-center gap-2 mx-auto ${
                bankFile &&
                ledgerFile &&
                !isAnalyzing

                  ? 'bg-recon-forest dark:bg-recon-dark-accent text-white hover:bg-recon-forestHover cursor-pointer'

                  : 'bg-gray-200 dark:bg-recon-dark-border text-gray-400 dark:text-recon-dark-muted cursor-not-allowed'
              }`}

            >


              {isAnalyzing ? (

                <>


                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />


                  <span>

                    Processing ReconAI Analysis...

                  </span>


                </>

              ) : (

                <>


                  <Sparkles className="w-4 h-4" />


                  <span>

                    Run ReconAI Analysis

                  </span>


                </>

              )}


            </button>


          </div>

        )}


      </div>


    </div>

  );

};