import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Landmark,
  Database,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
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
    setReconciliationResult,
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
              (line) =>
                line.trim() !== ''
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
              (header) =>
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
              (line) => {

                const values = line
                  .split(',')
                  .map(
                    (value) =>
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
         
         IMPORTANT:
         runReconciliation() should send the
         logged-in user's JWT automatically.
         
         Backend:
         
         POST /reconcile
         
         identifies the current user and
         saves the history to MySQL.
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
         SAVE CURRENT RESULT
         
         This is NOT reconciliation history.
         
         It is only the current reconciliation
         result used by the Reconciliation page.
      ========================================= */

      setAnalysisResult(result);


      /* =========================================
         SAVE RESULT TO RECON CONTEXT
      ========================================= */

      setReconciliationResult(result);


      /* =========================================
         SAVE CURRENT RESULT TO SESSION STORAGE
         
         We keep this because the current result
         may be needed when navigating to the
         Reconciliation page.
         
         This is NOT permanent history.
      ========================================= */

      sessionStorage.setItem(
        'reconciliationResult',
        JSON.stringify(result)
      );


      /* =========================================
         GET COUNTS FROM BACKEND RESPONSE
      ========================================= */

      const matchCount =

        result.matches?.length ||

        result.matched_transactions?.length ||

        result.total_matches ||

        result.summary?.matched ||

        result.summary?.total_matches ||

        0;


      const exceptionCount =

        result.exceptions?.length ||

        result.unmatched_transactions?.length ||

        result.total_exceptions ||

        result.summary?.exceptions ||

        result.summary?.total_exceptions ||

        0;


      /* =========================================
         LOG BACKEND HISTORY ID
         
         Your backend currently adds:
         
         result["history_id"]
         
         after saving the record to MySQL.
      ========================================= */

      console.log(
        'History ID:',
        result.history_id
      );


      console.log(
        'Created At:',
        result.created_at
      );


      /* =========================================
         SUCCESS
      ========================================= */

      setIsSuccess(true);


      console.log(
        'Reconciliation completed successfully.'
      );


      console.log(
        `${matchCount} matches and ${exceptionCount} exceptions detected.`
      );


    }

    catch (error) {

      console.error(
        'Reconciliation Failed:',
        error
      );


      setError(

        error?.message ||

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


  /* =========================================
     RESET UPLOAD
  ========================================= */

  const handleUploadNewData = () => {

    setIsSuccess(false);

    setBankFile(null);

    setLedgerFile(null);

    setAnalysisResult(null);

    setReconciliationResult(null);

    setError(null);


    /*
     * Remove only the current temporary result.
     *
     * We do NOT touch backend history.
     */

    sessionStorage.removeItem(
      'reconciliationResult'
    );

  };


  /* =========================================
     RENDER
  ========================================= */

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


        {/* =====================================
           BANK FILE
        ===================================== */}

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


        {/* =====================================
           LEDGER FILE
        ===================================== */}

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


            {/* SUCCESS ICON */}

            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">

              <CheckCircle2 className="w-8 h-8" />

            </div>


            {/* SUCCESS TEXT */}

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


            {/* =====================================
               HISTORY SAVED MESSAGE
            ===================================== */}

            {analysisResult?.history_id && (

              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">

                This reconciliation has been saved to your history.

              </div>

            )}


            {/* =====================================
               ACTION BUTTONS
            ===================================== */}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">


              <button

                type="button"

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

                type="button"

                onClick={handleUploadNewData}

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

              type="button"

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