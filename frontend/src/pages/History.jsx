import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  History as HistoryIcon,
  Eye,
  Download,
  Trash2,
  Calendar,
} from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency } from '../utils/formatCurrency';

export const History = () => {

  const navigate = useNavigate();

  const [runs, setRuns] = useState([]);


  /* =========================================
     LOAD HISTORY
  ========================================= */

  useEffect(() => {

    try {

      const savedHistory =
        localStorage.getItem(
          'reconciliationHistory'
        );


      if (savedHistory) {

        const parsedHistory =
          JSON.parse(savedHistory);

        setRuns(parsedHistory);

      }

    }

    catch (error) {

      console.error(
        'Failed to load reconciliation history:',
        error
      );

    }

  }, []);


  /* =========================================
     DELETE SINGLE RUN
  ========================================= */

  const handleDelete = (id) => {

    const updatedRuns =
      runs.filter(
        (run) =>
          run.id !== id
      );


    setRuns(
      updatedRuns
    );


    localStorage.setItem(
      'reconciliationHistory',
      JSON.stringify(
        updatedRuns
      )
    );

  };


  /* =========================================
     CLEAR ALL HISTORY
  ========================================= */

  const handleClearAll = () => {

    const confirmed =
      window.confirm(
        'Are you sure you want to clear all reconciliation run history?'
      );


    if (!confirmed) {

      return;

    }


    setRuns([]);


    localStorage.removeItem(
      'reconciliationHistory'
    );

  };


  /* =========================================
     VIEW RUN
  ========================================= */

  const handleViewRun = (
    run
  ) => {

    try {

      sessionStorage.setItem(

        'reconciliationResult',

        JSON.stringify(
          run.result
        )

      );


      navigate(
        '/reconciliation'
      );

    }

    catch (error) {

      console.error(
        'Failed to load historical run:',
        error
      );

    }

  };


  /* =========================================
     GET RUN STATUS
  ========================================= */

  const getStatus = (
    run
  ) => {

    if (
      run.exceptionCount === 0
    ) {

      return 'MATCHED';

    }


    if (
      run.exceptionCount >= 5
    ) {

      return 'HIGH';

    }


    return 'REVIEW REQUIRED';

  };


  /* =========================================
     DOWNLOAD CSV
  ========================================= */

  const handleDownload = (
    run
  ) => {

    if (
      !run.result
    ) {

      alert(
        'No reconciliation data available for this run.'
      );

      return;

    }


    const matches =
      run.result.matches ||
      [];


    const exceptions =
      run.result.exceptions ||
      [];


    const headers = [

      'Transaction ID',

      'Bank Reference',

      'Ledger Reference',

      'Amount',

      'Status',

      'Confidence',

    ];


    const rows = [];


    /* =========================
       MATCHES
    ========================= */

    matches.forEach(
      (item, index) => {

        rows.push([

          `MATCH-${index + 1}`,

          item.bank_ref ||
          'N/A',

          item.ledger_ref ||
          'N/A',

          item.amount ||
          0,

          'MATCHED',

          item.confidence
            ? `${Math.round(
                Number(
                  item.confidence
                ) * 100
              )}%`
            : '100%',

        ]);

      }
    );


    /* =========================
       EXCEPTIONS
    ========================= */

    exceptions.forEach(
      (item, index) => {

        rows.push([

          `EXCEPTION-${index + 1}`,

          item.bank_ref ||
          'N/A',

          item.ledger_ref ||
          'N/A',

          item.amount ||
          item.bank_amount ||
          0,

          item.exception_type ||
          'REVIEW REQUIRED',

          item.confidence
            ? `${Math.round(
                Number(
                  item.confidence
                ) * 100
              )}%`
            : 'N/A',

        ]);

      }
    );


    const csvContent =

      [
        headers,
        ...rows,
      ]

        .map(

          (row) =>

            row

              .map(

                (value) =>

                  `"${value}"`

              )

              .join(',')

        )

        .join('\n');


    const blob =

      new Blob(

        [
          csvContent
        ],

        {

          type:
            'text/csv;charset=utf-8;'

        }

      );


    const url =

      URL.createObjectURL(
        blob
      );


    const link =

      document.createElement(
        'a'
      );


    link.href =
      url;


    link.setAttribute(

      'download',

      `ReconAI_${run.id}.csv`

    );


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );

  };


  return (

    <div className="space-y-6 pb-12 animate-in fade-in duration-200">


      {/* =========================================
         PAGE HEADER
      ========================================= */}

      <PageHeader

        title="Reconciliation History"

        subtitle="Audit history of all previous reconciliation execution runs and generated reports."

        actions={

          runs.length > 0 && (

            <button

              onClick={
                handleClearAll
              }

              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition-colors"

            >

              <Trash2 className="w-3.5 h-3.5" />

              <span>

                Clear All History

              </span>

            </button>

          )

        }

      />


      {/* =========================================
         HISTORY LIST
      ========================================= */}

      {

        runs.length > 0

          ? (

            <div className="space-y-4">


              {

                runs.map(
                  (run) => (

                    <div

                      key={
                        run.id
                      }

                      className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"

                    >


                      {/* =========================
                         RUN INFO
                      ========================= */}

                      <div className="flex items-start gap-4">


                        <div className="w-10 h-10 rounded-xl bg-recon-light-soft dark:bg-recon-dark-cardHover flex items-center justify-center text-recon-forest dark:text-recon-dark-accent font-mono font-bold text-xs">

                          {

                            run.id

                          }

                        </div>


                        <div>


                          <div className="flex items-center gap-2">


                            <h3 className="text-sm font-extrabold text-recon-light-text dark:text-recon-dark-text">

                              Reconciliation Run #

                              {

                                run.runNumber ||
                                run.id

                              }

                            </h3>


                            <RiskBadge

                              priority={
                                getStatus(
                                  run
                                )
                              }

                            />


                          </div>


                          <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-1 font-medium flex items-center gap-1.5">


                            <Calendar className="w-3.5 h-3.5" />


                            <span>

                              {

                                run.dateTime

                              }

                            </span>


                          </p>


                        </div>


                      </div>


                      {/* =========================
                         RUN METRICS
                      ========================= */}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">


                        <div>


                          <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase font-bold block">

                            Bank / Ledger

                          </span>


                          <span className="font-bold text-recon-light-text dark:text-recon-dark-text">


                            {

                              run.bankCount

                            }

                            {' / '}

                            {

                              run.ledgerCount

                            }


                          </span>


                        </div>


                        <div>


                          <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase font-bold block">

                            Matches

                          </span>


                          <span className="font-bold text-emerald-600 dark:text-emerald-400">


                            {

                              run.matchCount

                            }


                          </span>


                        </div>


                        <div>


                          <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase font-bold block">

                            Exceptions

                          </span>


                          <span className="font-bold text-rose-600 dark:text-rose-400">


                            {

                              run.exceptionCount

                            }


                          </span>


                        </div>


                        <div>


                          <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase font-bold block">

                            Exposure

                          </span>


                          <span className="font-bold text-recon-light-text dark:text-recon-dark-text">


                            {

                              formatCurrency(
                                run.exposure
                              )

                            }


                          </span>


                        </div>


                      </div>


                      {/* =========================
                         ACTION BUTTONS
                      ========================= */}

                      <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-recon-light-border/40 dark:border-recon-dark-border/40">


                        <button

                          onClick={
                            () =>
                              handleViewRun(
                                run
                              )
                          }

                          className="p-2 rounded-xl text-recon-forest dark:text-recon-dark-accent hover:bg-recon-light-soft dark:hover:bg-recon-dark-cardHover transition-colors flex items-center gap-1 text-xs font-bold"

                          title="View Analysis"

                        >

                          <Eye className="w-4 h-4" />

                          <span className="hidden sm:inline">

                            View Analysis

                          </span>

                        </button>


                        <button

                          onClick={
                            () =>
                              handleDownload(
                                run
                              )
                          }

                          className="p-2 rounded-xl text-recon-light-muted dark:text-recon-dark-muted hover:text-recon-light-text dark:hover:text-recon-dark-text hover:bg-gray-100 dark:hover:bg-recon-dark-cardHover transition-colors"

                          title="Download CSV"

                        >

                          <Download className="w-4 h-4" />

                        </button>


                        <button

                          onClick={
                            () =>
                              handleDelete(
                                run.id
                              )
                          }

                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"

                          title="Delete Run Record"

                        >

                          <Trash2 className="w-4 h-4" />

                        </button>


                      </div>


                    </div>

                  )
                )

              }


            </div>

          )

          : (


            /* =====================================
               EMPTY STATE
            ===================================== */

            <div className="p-12 text-center rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft space-y-3">


              <HistoryIcon className="w-12 h-12 text-recon-light-muted dark:text-recon-dark-muted mx-auto" />


              <h3 className="text-base font-extrabold text-recon-light-text dark:text-recon-dark-text">

                No Reconciliation History

              </h3>


              <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted max-w-sm mx-auto font-medium">

                You have not executed any reconciliation runs yet or history was cleared.

              </p>


              <button

                onClick={
                  () =>
                    navigate(
                      '/upload'
                    )
                }

                className="px-4 py-2 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white font-extrabold text-xs shadow-soft hover:bg-recon-forestHover transition-colors"

              >

                Upload Data & Run Audit

              </button>


            </div>

          )

      }


    </div>

  );

};