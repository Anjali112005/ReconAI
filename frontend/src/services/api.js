const API_BASE_URL = "http://127.0.0.1:8000";


/* =========================================
   GENERIC API HELPER
========================================= */

async function apiRequest(endpoint, options = {}) {

  try {

    const headers = {
      ...options.headers,
    };


    /* =====================================
       ADD JSON HEADER ONLY WHEN BODY EXISTS
    ===================================== */

    if (options.body) {

      headers["Content-Type"] =
        "application/json";

    }


    const response = await fetch(

      `${API_BASE_URL}${endpoint}`,

      {
        ...options,

        headers,

      }

    );


    /* =====================================
       HANDLE API ERRORS
    ===================================== */

    if (!response.ok) {

      let errorMessage =
        "Something went wrong";


      try {

        const errorData =
          await response.json();


        errorMessage =

          errorData.detail ||

          errorData.message ||

          errorMessage;


      }

      catch {

        errorMessage =

          `Request failed with status ${response.status}`;

      }


      throw new Error(
        errorMessage
      );

    }


    return response;


  }

  catch (error) {

    console.error(

      `API Error: ${endpoint}`,

      error

    );


    throw error;

  }

}


/* =========================================
   HEALTH CHECK
========================================= */

export async function checkBackendHealth() {

  const response =
    await apiRequest("/");


  return await response.json();

}


/* =========================================
   RECONCILIATION
========================================= */

export async function runReconciliation(

  bankTransactions,

  ledgerTransactions

) {

  const response =
    await apiRequest(

      "/reconcile",

      {

        method: "POST",

        body: JSON.stringify({

          bank_transactions:
            bankTransactions,

          ledger_transactions:
            ledgerTransactions,

        }),

      }

    );


  return await response.json();

}


/* =========================================
   AI FINANCE COPILOT
========================================= */

export async function askCopilot(

  question,

  reconciliationResult

) {

  const response =
    await apiRequest(

      "/copilot",

      {

        method: "POST",

        body: JSON.stringify({

          question:

            question,


          reconciliation_result:

            reconciliationResult,

        }),

      }

    );


  return await response.json();

}


/* =========================================
   PDF REPORT
========================================= */

export async function generatePdfReport(

  reconciliationResult

) {

  const response =
    await apiRequest(

      "/report/pdf",

      {

        method: "POST",

        body: JSON.stringify(
          reconciliationResult
        ),

      }

    );


  return await response.blob();

}


/* =========================================
   GET ALL HISTORY
========================================= */

export async function getHistory() {

  const response =
    await apiRequest(
      "/history"
    );


  return await response.json();

}


/* =========================================
   GET SINGLE HISTORY RECORD
========================================= */

export async function getHistoryById(

  historyId

) {

  const response =
    await apiRequest(

      `/history/${historyId}`

    );


  return await response.json();

}


/* =========================================
   DELETE HISTORY RECORD
========================================= */

export async function deleteHistoryRecord(

  historyId

) {

  const response =
    await apiRequest(

      `/history/${historyId}`,

      {

        method: "DELETE",

      }

    );


  return await response.json();

}


/* =========================================
   CLEAR ALL HISTORY
========================================= */

export async function clearHistory() {

  const response =
    await apiRequest(

      "/history",

      {

        method: "DELETE",

      }

    );


  return await response.json();

}