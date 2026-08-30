import React, {
  useState,
  useMemo,
  useEffect
} from 'react';

import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
} from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency } from '../utils/formatCurrency';

import { useRecon } from '../context/ReconContext';


export const Reconciliation = () => {


  /* =========================================
     RECONCILIATION CONTEXT
  ========================================= */

  const {
    reconciliationResult,
    setReconciliationResult
  } = useRecon();


  /* =========================================
     STATE
  ========================================= */

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedStatus, setSelectedStatus] =
    useState('ALL');

  const [sortField, setSortField] =
    useState('amount');

  const [sortOrder, setSortOrder] =
    useState('desc');

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 8;


  /* =========================================
     LOAD RECONCILIATION RESULT
     FROM SESSION STORAGE
  ========================================= */

  useEffect(() => {

    /*
      If data already exists in ReconContext,
      do not load again.
    */

    if (reconciliationResult) {
      return;
    }


    const savedResult =
      sessionStorage.getItem(
        'reconciliationResult'
      );


    if (savedResult) {

      try {

        const parsedResult =
          JSON.parse(savedResult);


        setReconciliationResult(
          parsedResult
        );


      } catch (error) {

        console.error(
          'Failed to load reconciliation result:',
          error
        );

      }

    }

  }, [
    reconciliationResult,
    setReconciliationResult
  ]);


  /* =========================================
     TRANSFORM BACKEND DATA
  ========================================= */

  const reconciliationData =
    useMemo(() => {

      if (!reconciliationResult) {
        return [];
      }


      const matches =
        reconciliationResult.matches || [];


      const exceptions =
        reconciliationResult.exceptions || [];


      /* =====================================
         FORMAT MATCHES
      ===================================== */

      const formattedMatches =

        matches.map(
          (item, index) => ({

            id:
              `MATCH-${index + 1}`,

            bankRef:
              item.bank_ref ||
              'N/A',

            ledgerRef:
              item.ledger_ref ||
              'N/A',

            amount:
              Number(
                item.amount || 0
              ),

            date:
              item.date ||
              null,

            status:
              'MATCHED',

            confidence:
              Math.round(
                Number(
                  item.confidence || 0
                ) * 100
              ),

            matchType:
              item.match_type ||
              'MATCH',

            reason:
              item.reason ||
              '',

            details:
              item.details ||
              {},

          })
        );


      /* =====================================
         FORMAT EXCEPTIONS
      ===================================== */

      const formattedExceptions =

        exceptions.map(
          (item, index) => ({

            id:
              `EXCEPTION-${index + 1}`,

            bankRef:
              item.bank_ref ||
              'N/A',

            ledgerRef:
              item.ledger_ref ||
              'N/A',


            /*
              For amount mismatch:

              BANK002 = 25000
              LEDGER002 = 27000

              We display the bank amount.
            */

            amount:
              Number(

                item.bank_amount ||

                item.amount ||

                item.amount_at_risk ||

                item.amount_difference ||

                0

              ),

            date:
              item.date ||
              null,

            status:
              item.exception_type ||
              'REVIEW REQUIRED',

            confidence:
              Number(
                item.confidence || 0
              ),

            matchType:
              'EXCEPTION',

            reason:

              item.reason ||

              item.message ||

              item.exception_type ||

              'Requires investigation',


            details:
              item,

          })
        );


      /* =====================================
         COMBINE DATA
      ===================================== */

      return [

        ...formattedMatches,

        ...formattedExceptions,

      ];

    }, [
      reconciliationResult
    ]);


  /* =========================================
     FILTER + SEARCH + SORT
  ========================================= */

  const filteredData =
    useMemo(() => {


      const query =
        searchQuery
          .toLowerCase()
          .trim();


      return reconciliationData


        /* =====================================
           SEARCH
        ===================================== */

        .filter((item) => {


          const matchesSearch =


            item.id
              .toLowerCase()
              .includes(query)


            ||


            item.bankRef
              .toLowerCase()
              .includes(query)


            ||


            item.ledgerRef
              .toLowerCase()
              .includes(query)


            ||


            item.status
              .toLowerCase()
              .includes(query);


          /* ===================================
             STATUS FILTER
          =================================== */

          const matchesStatus =


            selectedStatus ===
            'ALL'


            ||


            item.status
              .toUpperCase()
              .includes(

                selectedStatus
                  .toUpperCase()

              );


          return (

            matchesSearch &&

            matchesStatus

          );

        })


        /* =====================================
           SORT
        ===================================== */

        .sort((a, b) => {


          let aVal =
            a[sortField];


          let bVal =
            b[sortField];


          if (

            typeof aVal ===
            'string'

          ) {

            aVal =
              aVal.toLowerCase();


            bVal =
              bVal.toLowerCase();

          }


          if (

            sortOrder ===
            'asc'

          ) {

            return aVal > bVal
              ? 1
              : -1;

          }


          return aVal < bVal
            ? 1
            : -1;


        });


    }, [

      reconciliationData,

      searchQuery,

      selectedStatus,

      sortField,

      sortOrder,

    ]);


  /* =========================================
     PAGINATION
  ========================================= */

  const totalPages =

    Math.max(

      1,

      Math.ceil(

        filteredData.length /

        itemsPerPage

      )

    );


  const paginatedData =

    filteredData.slice(

      (currentPage - 1) *

      itemsPerPage,


      currentPage *

      itemsPerPage

    );


  /* =========================================
     SORT HANDLER
  ========================================= */

  const toggleSort = (
    field
  ) => {


    if (

      sortField === field

    ) {


      setSortOrder(

        sortOrder === 'asc'

          ? 'desc'

          : 'asc'

      );


    } else {


      setSortField(
        field
      );


      setSortOrder(
        'desc'
      );


    }


  };


  /* =========================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================= */

  useEffect(() => {

    setCurrentPage(1);

  }, [

    searchQuery,

    selectedStatus

  ]);


  /* =========================================
     SUMMARY DATA
  ========================================= */

  const summary =

    reconciliationResult?.summary ||

    {};


  /* =========================================
     EXPORT CSV
  ========================================= */

  const exportCSV = () => {


    if (

      reconciliationData.length === 0

    ) {


      alert(
        'No reconciliation data available.'
      );


      return;

    }


    const headers = [

      'Transaction ID',

      'Bank Reference',

      'Ledger Reference',

      'Amount',

      'Status',

      'Confidence',

    ];


    const rows =

      reconciliationData.map(

        (item) => [

          item.id,

          item.bankRef,

          item.ledgerRef,

          item.amount,

          item.status,

          `${item.confidence}%`,

        ]

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

      'ReconAI_Reconciliation.csv'

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


  /* =========================================
     EMPTY STATE
  ========================================= */

  if (

    !reconciliationResult

  ) {


    return (

      <div className="space-y-6 pb-12 animate-in fade-in duration-200">


        <PageHeader

          title="Reconciliation Analysis"

          subtitle="Run a reconciliation first to view transaction results."

        />


        <div className="p-12 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-center">


          <p className="text-sm font-bold text-recon-light-text dark:text-recon-dark-text">

            No reconciliation data available.

          </p>


          <p className="text-xs mt-2 text-recon-light-muted dark:text-recon-dark-muted">

            Upload your bank and ledger CSV files
            and run ReconAI analysis.

          </p>


        </div>


      </div>

    );


  }


  /* =========================================
     MAIN UI
  ========================================= */

  return (

    <div className="space-y-6 pb-12 animate-in fade-in duration-200">


      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <PageHeader

        title="Reconciliation Analysis"

        subtitle="Full transaction level audit log comparing bank statements vs ledger records."


        actions={

          <button

            onClick={
              exportCSV
            }

            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text font-bold text-xs shadow-soft hover:bg-gray-50 dark:hover:bg-recon-dark-cardHover transition-colors"

          >


            <Download className="w-4 h-4 text-recon-forest dark:text-recon-dark-accent" />


            <span>

              Export CSV

            </span>


          </button>

        }

      />


      {/* =====================================
          SUMMARY CARDS
      ===================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">


        {/* BANK TRANSACTIONS */}

        <div className="p-4 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft">


          <p className="text-[11px] font-bold uppercase tracking-wider text-recon-light-muted dark:text-recon-dark-muted">

            Bank Transactions

          </p>


          <p className="text-2xl font-extrabold text-recon-light-text dark:text-recon-dark-text mt-1">

            {
              summary.bank_transactions || 0
            }

          </p>


        </div>


        {/* LEDGER TRANSACTIONS */}

        <div className="p-4 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft">


          <p className="text-[11px] font-bold uppercase tracking-wider text-recon-light-muted dark:text-recon-dark-muted">

            Ledger Transactions

          </p>


          <p className="text-2xl font-extrabold text-recon-light-text dark:text-recon-dark-text mt-1">

            {
              summary.ledger_transactions || 0
            }

          </p>


        </div>


        {/* SUCCESSFUL MATCHES */}

        <div className="p-4 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft">


          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">

            Successful Matches

          </p>


          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">

            {
              summary.total_matches || 0
            }

          </p>


        </div>


        {/* EXCEPTIONS */}

        <div className="p-4 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft">


          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">

            Exceptions

          </p>


          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">

            {
              summary.exceptions || 0
            }

          </p>


        </div>


      </div>


      {/* =====================================
          TABLE
      ===================================== */}

      <div className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft space-y-4">


        {/* SEARCH + FILTER */}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">


          <div className="relative w-full sm:w-80">


            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-recon-light-muted dark:text-recon-dark-muted" />


            <input

              type="text"

              value={
                searchQuery
              }

              onChange={
                (e) =>
                  setSearchQuery(
                    e.target.value
                  )
              }

              placeholder="Search by ID, Bank Ref, Ledger Ref..."

              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl bg-recon-light-bg dark:bg-recon-dark-cardHover border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text placeholder-recon-light-muted dark:placeholder-recon-dark-muted focus:outline-none focus:ring-2 focus:ring-recon-forest/20 dark:focus:ring-recon-dark-accent/20"

            />


          </div>


          <div className="flex items-center gap-2 w-full sm:w-auto">


            <Filter className="w-4 h-4 text-recon-light-muted dark:text-recon-dark-muted hidden sm:block" />


            <select

              value={
                selectedStatus
              }

              onChange={
                (e) =>
                  setSelectedStatus(
                    e.target.value
                  )
              }

              className="px-3 py-2 text-xs font-bold rounded-xl bg-recon-light-bg dark:bg-recon-dark-cardHover border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text focus:outline-none"

            >


              <option value="ALL">

                All Statuses

              </option>


              <option value="MATCHED">

                Matched Only

              </option>


              <option value="AMOUNT_MISMATCH">

                Amount Mismatch

              </option>


              <option value="REVIEW REQUIRED">

                Review Required

              </option>


            </select>


          </div>


        </div>


        {/* TRANSACTION TABLE */}

        <div className="overflow-x-auto rounded-xl border border-recon-light-border dark:border-recon-dark-border">


          <table className="w-full text-left border-collapse text-xs">


            <thead>


              <tr className="bg-recon-light-bg/80 dark:bg-recon-dark-cardHover/80 border-b border-recon-light-border dark:border-recon-dark-border text-recon-light-muted dark:text-recon-dark-muted uppercase font-bold text-[10px] tracking-wider">


                <th className="py-3 px-4">

                  Transaction ID

                </th>


                <th className="py-3 px-4">

                  Bank Ref

                </th>


                <th className="py-3 px-4">

                  Ledger Ref

                </th>


                <th

                  className="py-3 px-4 cursor-pointer"

                  onClick={
                    () =>
                      toggleSort(
                        'amount'
                      )
                  }

                >


                  <div className="flex items-center gap-1">


                    <span>

                      Amount

                    </span>


                    <ArrowUpDown className="w-3 h-3" />


                  </div>


                </th>


                <th className="py-3 px-4">

                  Match Status

                </th>


                <th className="py-3 px-4">

                  Confidence

                </th>


              </tr>


            </thead>


            <tbody className="divide-y divide-recon-light-border/60 dark:divide-recon-dark-border/60 font-medium">


              {

                paginatedData.length > 0

                  ? (

                    paginatedData.map(

                      (row) => (

                        <tr

                          key={
                            row.id
                          }

                          className="hover:bg-recon-light-soft/40 dark:hover:bg-recon-dark-cardHover/50 transition-colors"

                        >


                          <td className="py-3 px-4 font-mono font-bold text-recon-light-text dark:text-recon-dark-text">

                            {
                              row.id
                            }

                          </td>


                          <td className="py-3 px-4 font-mono text-recon-light-muted dark:text-recon-dark-muted">

                            {
                              row.bankRef
                            }

                          </td>


                          <td className="py-3 px-4 font-mono text-recon-light-muted dark:text-recon-dark-muted">

                            {
                              row.ledgerRef
                            }

                          </td>


                          <td className="py-3 px-4 font-extrabold text-recon-light-text dark:text-recon-dark-text">

                            {
                              formatCurrency(
                                row.amount
                              )
                            }

                          </td>


                          <td className="py-3 px-4">

                            <RiskBadge

                              priority={
                                row.status
                              }

                            />

                          </td>


                          <td className="py-3 px-4">


                            <div className="flex items-center gap-2">


                              <div className="w-16 bg-gray-200 dark:bg-recon-dark-border rounded-full h-1.5 overflow-hidden">


                                <div

                                  className={`h-full rounded-full ${
                                    row.confidence >= 90

                                      ? 'bg-emerald-500'

                                      : row.confidence >= 70

                                      ? 'bg-amber-500'

                                      : 'bg-rose-500'

                                  }`}

                                  style={{

                                    width:

                                      `${row.confidence}%`

                                  }}

                                />


                              </div>


                              <span className="font-bold text-[11px] text-recon-light-text dark:text-recon-dark-text">


                                {
                                  row.confidence
                                }

                                %


                              </span>


                            </div>


                          </td>


                        </tr>

                      )

                    )

                  )

                  : (

                    <tr>


                      <td

                        colSpan={6}

                        className="py-8 text-center text-recon-light-muted dark:text-recon-dark-muted font-medium"

                      >

                        No matching reconciliation transactions found.

                      </td>


                    </tr>

                  )

              }


            </tbody>


          </table>


        </div>


        {/* =====================================
            PAGINATION
        ===================================== */}

        <div className="flex items-center justify-between pt-2 text-xs">


          <span className="text-recon-light-muted dark:text-recon-dark-muted font-medium">


            Showing Page{' '}


            <strong className="text-recon-light-text dark:text-recon-dark-text">

              {
                currentPage
              }

            </strong>


            {' '}of{' '}


            <strong className="text-recon-light-text dark:text-recon-dark-text">

              {
                totalPages
              }

            </strong>


            {' '}(

            {
              filteredData.length
            }

            {' '}records)


          </span>


          <div className="flex items-center gap-1.5">


            <button

              onClick={
                () =>
                  setCurrentPage(
                    (p) =>
                      Math.max(
                        1,
                        p - 1
                      )
                  )
              }

              disabled={
                currentPage === 1
              }

              className="px-3 py-1.5 rounded-lg border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text disabled:opacity-40 font-bold hover:bg-gray-50 dark:hover:bg-recon-dark-cardHover transition-colors"

            >

              Previous

            </button>


            <button

              onClick={
                () =>
                  setCurrentPage(
                    (p) =>
                      Math.min(
                        totalPages,
                        p + 1
                      )
                  )
              }

              disabled={
                currentPage ===
                totalPages
              }

              className="px-3 py-1.5 rounded-lg border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text disabled:opacity-40 font-bold hover:bg-gray-50 dark:hover:bg-recon-dark-cardHover transition-colors"

            >

              Next

            </button>


          </div>


        </div>


      </div>


    </div>

  );

};