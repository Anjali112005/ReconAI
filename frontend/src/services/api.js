// ============================================================
// RECONAI API CONFIGURATION
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";


// ============================================================
// DEBUG API URL
// ============================================================

console.log(
  "ReconAI API Base URL:",
  API_BASE_URL
);


// ============================================================
// GET JWT TOKEN
// ============================================================

function getAuthToken() {

  return localStorage.getItem(
    "reconai_token"
  );

}


// ============================================================
// GENERIC API HELPER
// ============================================================

async function apiRequest(
  endpoint,
  options = {}
) {

  try {

    const token =
      getAuthToken();


    // ========================================================
    // CREATE HEADERS
    // ========================================================

    const headers = {
      ...(options.headers || {}),
    };


    // ========================================================
    // ADD JSON HEADER ONLY WHEN BODY EXISTS
    //
    // Do NOT add JSON content type for FormData.
    // ========================================================

    if (
      options.body &&
      !(options.body instanceof FormData)
    ) {

      headers["Content-Type"] =
        "application/json";

    }


    // ========================================================
    // ATTACH JWT
    // ========================================================

    if (token) {

      headers["Authorization"] =
        `Bearer ${token}`;

    }


    // ========================================================
    // SEND REQUEST
    // ========================================================

    const response =
      await fetch(

        `${API_BASE_URL}${endpoint}`,

        {
          ...options,

          headers,

        }

      );


    // ========================================================
    // HANDLE UNAUTHORIZED
    // ========================================================

    if (
      response.status === 401
    ) {

      localStorage.removeItem(
        "reconai_token"
      );


      throw new Error(
        "Your session has expired. Please login again."
      );

    }


    // ========================================================
    // HANDLE API ERRORS
    // ========================================================

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


    // ========================================================
    // RETURN RESPONSE
    // ========================================================

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


// ============================================================
// HEALTH CHECK
// ============================================================

export async function checkBackendHealth() {

  const response =
    await apiRequest("/");


  return await response.json();

}


// ============================================================
// RECONCILIATION
// ============================================================

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


// ============================================================
// AI FINANCE COPILOT
// ============================================================

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


// ============================================================
// PDF REPORT
// ============================================================

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


// ============================================================
// GET ALL HISTORY
// ============================================================

export async function getHistory() {

  const response =
    await apiRequest(
      "/history"
    );


  return await response.json();

}


// ============================================================
// GET SINGLE HISTORY RECORD
// ============================================================

export async function getHistoryById(
  historyId
) {

  const response =
    await apiRequest(

      `/history/${historyId}`

    );


  return await response.json();

}


// ============================================================
// DELETE HISTORY RECORD
// ============================================================

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


// ============================================================
// CLEAR ALL HISTORY
// ============================================================

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