import React, { useEffect, useState } from "react";
import {
  History as HistoryIcon,
  RefreshCw,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Database,
  ShieldCheck,
  X,
} from "lucide-react";

import { PageHeader } from "../components/PageHeader";

import {
  getHistory,
  getHistoryById,
  deleteHistoryRecord,
  clearHistory,
} from "../services/api";


/* =========================================================
   HISTORY PAGE
   ========================================================= */

export const History = () => {

  /* =======================================================
     STATE
  ======================================================= */

  const [history, setHistory] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  const [isLoadingRecord, setIsLoadingRecord] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [isClearing, setIsClearing] =
    useState(false);


  /* =======================================================
     LOAD HISTORY FROM MYSQL
  ======================================================= */

  const loadHistory = async (
    showRefreshState = false
  ) => {

    try {

      setError("");

      if (showRefreshState) {

        setIsRefreshing(true);

      } else {

        setIsLoading(true);

      }


      /* -----------------------------------------------
         GET HISTORY FROM BACKEND

         services/api.js automatically attaches:

         Authorization: Bearer <JWT>
      ------------------------------------------------ */

      const data =
        await getHistory();


      console.log(
        "MYSQL HISTORY:",
        data
      );


      /* -----------------------------------------------
         BACKEND RESPONSE:

         {
           total_records: number,
           history: [...]
         }
      ------------------------------------------------ */

      if (Array.isArray(data)) {

        setHistory(data);

      } else if (
        Array.isArray(data?.history)
      ) {

        setHistory(
          data.history
        );

      } else {

        setHistory([]);

      }

    }

    catch (err) {

      console.error(
        "Failed to load history:",
        err
      );


      setError(

        err?.message ||

        "Failed to load reconciliation history."

      );

    }

    finally {

      setIsLoading(false);

      setIsRefreshing(false);

    }

  };


  /* =======================================================
     LOAD HISTORY WHEN PAGE OPENS
  ======================================================= */

  useEffect(() => {

    loadHistory();

  }, []);


  /* =======================================================
     VIEW HISTORY RECORD
  ======================================================= */

  const handleViewRecord = async (
    historyId
  ) => {

    try {

      setIsLoadingRecord(true);

      setError("");


      /*
       * Get the complete record from MySQL.
       */

      const record =
        await getHistoryById(
          historyId
        );


      console.log(
        "HISTORY RECORD:",
        record
      );


      setSelectedRecord(
        record
      );

    }

    catch (err) {

      console.error(
        "Failed to load history record:",
        err
      );


      setError(

        err?.message ||

        "Failed to load history record."

      );

    }

    finally {

      setIsLoadingRecord(false);

    }

  };


  /* =======================================================
     DELETE SINGLE RECORD
  ======================================================= */

  const handleDeleteRecord = async (
    historyId
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this reconciliation record?"
      );


    if (!confirmed) {

      return;

    }


    try {

      setDeletingId(
        historyId
      );

      setError("");


      /*
       * Delete from MySQL.
       */

      await deleteHistoryRecord(
        historyId
      );


      /*
       * Remove the deleted record
       * from the current screen.
       *
       * No localStorage is used.
       */

      setHistory(
        previousHistory =>
          previousHistory.filter(
            record =>
              getRecordId(record) !==
              historyId
          )
      );


      /*
       * Close modal if the deleted
       * record was being viewed.
       */

      if (
        selectedRecord &&
        getRecordId(selectedRecord) ===
          historyId
      ) {

        setSelectedRecord(
          null
        );

      }

    }

    catch (err) {

      console.error(
        "Failed to delete history record:",
        err
      );


      setError(

        err?.message ||

        "Failed to delete history record."

      );

    }

    finally {

      setDeletingId(null);

    }

  };


  /* =======================================================
     CLEAR ALL HISTORY
  ======================================================= */

  const handleClearHistory = async () => {

    if (history.length === 0) {

      return;

    }


    const confirmed =
      window.confirm(
        "Are you sure you want to delete ALL reconciliation history? This action cannot be undone."
      );


    if (!confirmed) {

      return;

    }


    try {

      setIsClearing(true);

      setError("");


      /*
       * Clear the logged-in user's history
       * from MySQL.
       */

      await clearHistory();


      /*
       * Clear the screen.
       */

      setHistory([]);

      setSelectedRecord(null);

    }

    catch (err) {

      console.error(
        "Failed to clear history:",
        err
      );


      setError(

        err?.message ||

        "Failed to clear reconciliation history."

      );

    }

    finally {

      setIsClearing(false);

    }

  };


  /* =======================================================
     GET RECORD ID
  ======================================================= */

  const getRecordId = (
    record
  ) => {

    return (

      record?.id ??

      record?.history_id ??

      record?.historyId

    );

  };


  /* =======================================================
     GET MATCH COUNT
  ======================================================= */

  const getMatchCount = (
    record
  ) => {

    return (

      record?.match_count ??

      record?.matches_count ??

      record?.summary?.matched ??

      record?.summary?.total_matches ??

      record?.result?.matches?.length ??

      record?.result?.matched_transactions?.length ??

      0

    );

  };


  /* =======================================================
     GET EXCEPTION COUNT
  ======================================================= */

  const getExceptionCount = (
    record
  ) => {

    return (

      record?.exception_count ??

      record?.exceptions_count ??

      record?.summary?.exceptions ??

      record?.summary?.total_exceptions ??

      record?.result?.exceptions?.length ??

      record?.result?.unmatched_transactions?.length ??

      0

    );

  };


  /* =======================================================
     GET EXPOSURE
  ======================================================= */

  const getExposure = (
    record
  ) => {

    const value =

      record?.exposure ??

      record?.total_exposure ??

      record?.total_risk_exposure ??

      record?.summary?.total_exposure ??

      record?.summary?.exposure ??

      record?.result?.summary?.total_exposure ??

      record?.result?.summary?.exposure ??

      0;


    return Number(value) || 0;

  };


  /* =======================================================
     GET BANK COUNT
  ======================================================= */

  const getBankCount = (
    record
  ) => {

    return (

      record?.bank_count ??

      record?.bankCount ??

      record?.result?.bank_count ??

      0

    );

  };


  /* =======================================================
     GET LEDGER COUNT
  ======================================================= */

  const getLedgerCount = (
    record
  ) => {

    return (

      record?.ledger_count ??

      record?.ledgerCount ??

      record?.result?.ledger_count ??

      0

    );

  };


  /* =======================================================
     GET DATE
  ======================================================= */

  const getDate = (
    record
  ) => {

    return (

      record?.created_at ??

      record?.date_time ??

      record?.dateTime ??

      record?.createdAt ??

      "Unknown date"

    );

  };


  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */

  const formatCurrency = (
    value
  ) => {

    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
      }
    ).format(
      Number(value) || 0
    );

  };


  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (isLoading) {

    return (

      <div className="space-y-6">

        <PageHeader

          title="Reconciliation History"

          subtitle="Review your previous ReconAI reconciliation runs."

        />


        <div className="p-12 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border flex flex-col items-center justify-center">

          <div className="w-10 h-10 border-4 border-recon-light-border dark:border-recon-dark-border border-t-recon-forest dark:border-t-recon-dark-accent rounded-full animate-spin" />

          <p className="mt-4 text-sm font-bold text-recon-light-muted dark:text-recon-dark-muted">

            Loading reconciliation history...

          </p>

        </div>

      </div>

    );

  }


  /* =======================================================
     PAGE
  ======================================================= */

  return (

    <div className="space-y-6 pb-12">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

        <PageHeader

          title="Reconciliation History"

          subtitle="Review reconciliation runs stored securely in your account."

        />


        <div className="flex items-center gap-2">

          {/* REFRESH */}

          <button

            type="button"

            onClick={() =>
              loadHistory(true)
            }

            disabled={isRefreshing}

            className="px-4 py-2.5 rounded-xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text text-xs font-extrabold hover:bg-recon-light-bg dark:hover:bg-recon-dark-cardHover transition-colors disabled:opacity-50 flex items-center gap-2"

          >

            <RefreshCw
              className={`w-4 h-4 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh

          </button>


          {/* CLEAR */}

          <button

            type="button"

            onClick={handleClearHistory}

            disabled={
              isClearing ||
              history.length === 0
            }

            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-extrabold hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-40 flex items-center gap-2"

          >

            {isClearing ? (

              <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />

            ) : (

              <Trash2 className="w-4 h-4" />

            )}

            Clear All

          </button>

        </div>

      </div>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 flex items-start gap-3">

          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />

          <div className="flex-1">

            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">

              Unable to load history

            </h4>

            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">

              {error}

            </p>

          </div>

        </div>

      )}


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


        {/* TOTAL RUNS */}

        <div className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                Total Runs

              </p>

              <p className="mt-2 text-2xl font-black text-recon-light-text dark:text-recon-dark-text">

                {history.length}

              </p>

            </div>


            <div className="w-10 h-10 rounded-xl bg-recon-light-soft dark:bg-recon-dark-cardHover flex items-center justify-center">

              <HistoryIcon className="w-5 h-5 text-recon-forest dark:text-recon-dark-accent" />

            </div>

          </div>

        </div>


        {/* MATCHES */}

        <div className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                Total Matches

              </p>

              <p className="mt-2 text-2xl font-black text-recon-light-text dark:text-recon-dark-text">

                {history.reduce(

                  (total, record) =>

                    total +
                    Number(
                      getMatchCount(record)
                    ),

                  0

                )}

              </p>

            </div>


            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">

              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />

            </div>

          </div>

        </div>


        {/* EXCEPTIONS */}

        <div className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                Total Exceptions

              </p>

              <p className="mt-2 text-2xl font-black text-recon-light-text dark:text-recon-dark-text">

                {history.reduce(

                  (total, record) =>

                    total +
                    Number(
                      getExceptionCount(record)
                    ),

                  0

                )}

              </p>

            </div>


            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">

              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />

            </div>

          </div>

        </div>

      </div>


      {/* ===================================================
          EMPTY STATE
      =================================================== */}

      {history.length === 0 ? (

        <div className="p-12 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-center">

          <div className="w-14 h-14 rounded-2xl bg-recon-light-soft dark:bg-recon-dark-cardHover flex items-center justify-center mx-auto">

            <Database className="w-7 h-7 text-recon-forest dark:text-recon-dark-accent" />

          </div>


          <h3 className="mt-5 text-base font-extrabold text-recon-light-text dark:text-recon-dark-text">

            No reconciliation history

          </h3>


          <p className="mt-2 text-xs text-recon-light-muted dark:text-recon-dark-muted max-w-md mx-auto">

            Your completed reconciliation runs will appear here after you analyze financial data.

          </p>

        </div>

      ) : (


        /* =================================================
           HISTORY TABLE
        ================================================= */

        <div className="rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border overflow-hidden">


          {/* TABLE HEADER */}

          <div className="px-5 py-4 border-b border-recon-light-border dark:border-recon-dark-border">

            <div className="flex items-center gap-2">

              <ShieldCheck className="w-4 h-4 text-recon-forest dark:text-recon-dark-accent" />

              <h3 className="text-sm font-extrabold text-recon-light-text dark:text-recon-dark-text">

                Your Reconciliation Runs

              </h3>

            </div>

          </div>


          {/* DESKTOP TABLE */}

          <div className="hidden md:block overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-recon-light-border dark:border-recon-dark-border">

                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                    Run

                  </th>

                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                    Date

                  </th>

                  <th className="px-5 py-3 text-center text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                    Bank

                  </th>

                  <th className="px-5 py-3 text-center text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                    Ledger

                  </th>

                  <th className="px-5 py-3 text-center text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                    Matches

                  </th>

                  <th className="px-5 py-3 text-center text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                    Exceptions

                  </th>

                  <th className="px-5 py-3 text-right text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                    Exposure

                  </th>

                  <th className="px-5 py-3 text-right text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                    Actions

                  </th>

                </tr>

              </thead>


              <tbody>

                {history.map(
                  (record, index) => {

                    const id =
                      getRecordId(
                        record
                      );


                    return (

                      <tr

                        key={
                          id ??
                          index
                        }

                        className="border-b border-recon-light-border dark:border-recon-dark-border last:border-b-0 hover:bg-recon-light-bg/50 dark:hover:bg-recon-dark-cardHover/50 transition-colors"

                      >

                        {/* RUN */}

                        <td className="px-5 py-4">

                          <span className="text-xs font-extrabold text-recon-light-text dark:text-recon-dark-text">

                            {record?.run_number ??
                              record?.runNumber ??
                              `RUN-${id ?? index + 1}`}

                          </span>

                        </td>


                        {/* DATE */}

                        <td className="px-5 py-4">

                          <span className="text-xs text-recon-light-muted dark:text-recon-dark-muted">

                            {getDate(record)}

                          </span>

                        </td>


                        {/* BANK */}

                        <td className="px-5 py-4 text-center">

                          <span className="text-xs font-bold text-recon-light-text dark:text-recon-dark-text">

                            {getBankCount(record)}

                          </span>

                        </td>


                        {/* LEDGER */}

                        <td className="px-5 py-4 text-center">

                          <span className="text-xs font-bold text-recon-light-text dark:text-recon-dark-text">

                            {getLedgerCount(record)}

                          </span>

                        </td>


                        {/* MATCHES */}

                        <td className="px-5 py-4 text-center">

                          <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">

                            {getMatchCount(record)}

                          </span>

                        </td>


                        {/* EXCEPTIONS */}

                        <td className="px-5 py-4 text-center">

                          <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-extrabold">

                            {getExceptionCount(record)}

                          </span>

                        </td>


                        {/* EXPOSURE */}

                        <td className="px-5 py-4 text-right">

                          <span className="text-xs font-extrabold text-recon-light-text dark:text-recon-dark-text">

                            {formatCurrency(
                              getExposure(record)
                            )}

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button

                              type="button"

                              onClick={() =>
                                handleViewRecord(
                                  id
                                )
                              }

                              disabled={
                                isLoadingRecord
                              }

                              className="p-2 rounded-lg bg-recon-light-soft dark:bg-recon-dark-cardHover text-recon-light-text dark:text-recon-dark-text hover:text-recon-forest dark:hover:text-recon-dark-accent transition-colors"

                              title="View record"

                            >

                              <Eye className="w-4 h-4" />

                            </button>


                            <button

                              type="button"

                              onClick={() =>
                                handleDeleteRecord(
                                  id
                                )
                              }

                              disabled={
                                deletingId ===
                                id
                              }

                              className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-40"

                              title="Delete record"

                            >

                              {deletingId ===
                              id ? (

                                <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />

                              ) : (

                                <Trash2 className="w-4 h-4" />

                              )}

                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  }

                )}

              </tbody>

            </table>

          </div>


          {/* MOBILE CARDS */}

          <div className="md:hidden divide-y divide-recon-light-border dark:divide-recon-dark-border">

            {history.map(
              (record, index) => {

                const id =
                  getRecordId(
                    record
                  );


                return (

                  <div
                    key={
                      id ??
                      index
                    }
                    className="p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs font-extrabold text-recon-light-text dark:text-recon-dark-text">

                          {record?.run_number ??
                            record?.runNumber ??
                            `RUN-${id ?? index + 1}`}

                        </p>

                        <p className="mt-1 text-[11px] text-recon-light-muted dark:text-recon-dark-muted">

                          {getDate(record)}

                        </p>

                      </div>


                      <div className="flex gap-2">

                        <button

                          type="button"

                          onClick={() =>
                            handleViewRecord(
                              id
                            )
                          }

                          className="p-2 rounded-lg bg-recon-light-soft dark:bg-recon-dark-cardHover"

                        >

                          <Eye className="w-4 h-4" />

                        </button>


                        <button

                          type="button"

                          onClick={() =>
                            handleDeleteRecord(
                              id
                            )
                          }

                          disabled={
                            deletingId ===
                            id
                          }

                          className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"

                        >

                          <Trash2 className="w-4 h-4" />

                        </button>

                      </div>

                    </div>


                    <div className="grid grid-cols-2 gap-3 mt-4">

                      <HistoryStat

                        label="Bank"

                        value={
                          getBankCount(
                            record
                          )
                        }

                      />

                      <HistoryStat

                        label="Ledger"

                        value={
                          getLedgerCount(
                            record
                          )
                        }

                      />

                      <HistoryStat

                        label="Matches"

                        value={
                          getMatchCount(
                            record
                          )
                        }

                      />

                      <HistoryStat

                        label="Exceptions"

                        value={
                          getExceptionCount(
                            record
                          )
                        }

                      />

                    </div>


                    <div className="mt-3 px-3 py-2.5 rounded-lg bg-recon-light-bg dark:bg-recon-dark-bg">

                      <p className="text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                        Risk Exposure

                      </p>

                      <p className="mt-1 text-sm font-black text-recon-light-text dark:text-recon-dark-text">

                        {formatCurrency(
                          getExposure(
                            record
                          )
                        )}

                      </p>

                    </div>

                  </div>

                );

              }

            )}

          </div>

        </div>

      )}


      {/* ===================================================
          DETAIL MODAL
      =================================================== */}

      {selectedRecord && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">

          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-2xl">


            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-4 border-b border-recon-light-border dark:border-recon-dark-border">

              <div>

                <p className="text-[10px] uppercase tracking-widest text-recon-dark-accent font-extrabold">

                  Reconciliation Record

                </p>

                <h3 className="mt-1 text-lg font-black text-recon-light-text dark:text-recon-dark-text">

                  {selectedRecord?.run_number ??
                    selectedRecord?.runNumber ??
                    `RUN-${getRecordId(selectedRecord)}`}

                </h3>

              </div>


              <button

                type="button"

                onClick={() =>
                  setSelectedRecord(null)
                }

                className="p-2 rounded-lg hover:bg-recon-light-bg dark:hover:bg-recon-dark-cardHover transition-colors"

              >

                <X className="w-5 h-5" />

              </button>

            </div>


            {/* MODAL CONTENT */}

            <div className="p-6 overflow-y-auto max-h-[75vh]">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">


                <HistoryStat

                  label="Bank"

                  value={
                    getBankCount(
                      selectedRecord
                    )
                  }

                />


                <HistoryStat

                  label="Ledger"

                  value={
                    getLedgerCount(
                      selectedRecord
                    )
                  }

                />


                <HistoryStat

                  label="Matches"

                  value={
                    getMatchCount(
                      selectedRecord
                    )
                  }

                />


                <HistoryStat

                  label="Exceptions"

                  value={
                    getExceptionCount(
                      selectedRecord
                    )
                  }

                />

              </div>


              {/* EXPOSURE */}

              <div className="mb-6 p-4 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg">

                <p className="text-[10px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                  Risk Exposure

                </p>

                <p className="mt-1 text-xl font-black text-recon-light-text dark:text-recon-dark-text">

                  {formatCurrency(
                    getExposure(
                      selectedRecord
                    )
                  )}

                </p>

              </div>


              {/* RAW RESULT */}

              <div>

                <div className="flex items-center gap-2 mb-3">

                  <Database className="w-4 h-4 text-recon-dark-accent" />

                  <h4 className="text-sm font-extrabold">

                    Reconciliation Data

                  </h4>

                </div>


                <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs overflow-x-auto whitespace-pre-wrap break-words">

                  {JSON.stringify(
                    selectedRecord?.result ??
                    selectedRecord,
                    null,
                    2
                  )}

                </pre>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};


/* =========================================================
   HISTORY STAT
   ========================================================= */

const HistoryStat = ({
  label,
  value,
}) => {

  return (

    <div className="p-3 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg">

      <p className="text-[9px] uppercase tracking-widest font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

        {label}

      </p>

      <p className="mt-1 text-base font-black text-recon-light-text dark:text-recon-dark-text">

        {value}

      </p>

    </div>

  );

};