export const kpiMetrics = {
  riskScore: 72,
  riskTrend: "+8%",
  riskTrendDirection: "up", // up means increased risk or change
  totalExposure: 248500,
  exposureSubtext: "Across 32 unresolved discrepancies",
  successfulMatches: 1248,
  matchRate: 94.2,
  exceptionsCount: 32,
  criticalExceptionsCount: 5
};

export const performanceTrend = [
  { month: 'Jan', rate: 92.4, matches: 1150, exceptions: 95 },
  { month: 'Feb', rate: 94.1, matches: 1190, exceptions: 75 },
  { month: 'Mar', rate: 91.8, matches: 1120, exceptions: 100 },
  { month: 'Apr', rate: 96.2, matches: 1280, exceptions: 50 },
  { month: 'May', rate: 95.5, matches: 1220, exceptions: 58 },
  { month: 'Jun', rate: 97.1, matches: 1310, exceptions: 39 },
];

export const riskDistribution = [
  { name: 'Critical', count: 5, value: 5, color: '#D9534F' },
  { name: 'High', count: 9, value: 9, color: '#E58A3A' },
  { name: 'Medium', count: 12, value: 12, color: '#D4A72C' },
  { name: 'Low', count: 6, value: 6, color: '#4C8F70' },
];

export const financialExposure = [
  { category: 'Duplicate Payments', exposure: 85000 },
  { category: 'Missing Ledger Entries', exposure: 52500 },
  { category: 'Amount Mismatch', exposure: 42000 },
  { category: 'Date Discrepancies', exposure: 38000 },
  { category: 'Unmatched References', exposure: 31000 },
];

export const actionQueueItems = [
  {
    id: 'ACT-101',
    priority: 'CRITICAL',
    issue: 'Duplicate payment detected',
    description: 'Vendor payment #BNK-8829 posted twice within 45 minutes.',
    amount: 85000,
    riskScore: 94,
    recommendedAction: 'Flag for immediate reversal and contact vendor accounts payable.',
    bankRef: 'BNK-8829-A',
    ledgerRef: 'LEDG-9921',
  },
  {
    id: 'ACT-102',
    priority: 'HIGH',
    issue: 'Missing ledger transaction',
    description: 'Inbound wire transfer recorded in bank statement missing from ERP ledger.',
    amount: 52500,
    riskScore: 82,
    recommendedAction: 'Verify clearing account balance and post missing ledger entry.',
    bankRef: 'BNK-9102-X',
    ledgerRef: 'UNASSIGNED',
  },
  {
    id: 'ACT-103',
    priority: 'HIGH',
    issue: 'Unreconciled foreign currency fee',
    description: 'Cross-border FX transaction surcharge not recognized in ledger rules.',
    amount: 34200,
    riskScore: 78,
    recommendedAction: 'Apply standard FX fee offset rule to reconcile variance.',
    bankRef: 'FX-8810-Z',
    ledgerRef: 'LEDG-4412',
  },
  {
    id: 'ACT-104',
    priority: 'MEDIUM',
    issue: 'Transaction amount mismatch',
    description: 'Bank cleared ₹18,200 but internal invoice specifies ₹18,000.',
    amount: 18200,
    riskScore: 58,
    recommendedAction: 'Check for ₹200 bank processing fee split.',
    bankRef: 'BNK-4001-P',
    ledgerRef: 'LEDG-1104',
  },
  {
    id: 'ACT-105',
    priority: 'LOW',
    issue: 'Date stamp discrepancy',
    description: 'Transaction date recorded 2 days prior in ledger due to weekend posting.',
    amount: 12500,
    riskScore: 28,
    recommendedAction: 'Auto-approve date tolerance rule for T+2 window.',
    bankRef: 'BNK-1004-D',
    ledgerRef: 'LEDG-7002',
  }
];

export const mockReconciliations = [
  { id: 'TX-1001', bankRef: 'BNK-8829-A', ledgerRef: 'LEDG-9921', amount: 85000, date: '2026-08-28', status: 'Unmatched', confidence: 35, priority: 'CRITICAL' },
  { id: 'TX-1002', bankRef: 'BNK-9102-X', ledgerRef: 'UNASSIGNED', amount: 52500, date: '2026-08-27', status: 'Review Required', confidence: 48, priority: 'HIGH' },
  { id: 'TX-1003', bankRef: 'BNK-4001-P', ledgerRef: 'LEDG-1104', amount: 18200, date: '2026-08-26', status: 'Partial Match', confidence: 78, priority: 'MEDIUM' },
  { id: 'TX-1004', bankRef: 'BNK-7710-C', ledgerRef: 'LEDG-8812', amount: 245000, date: '2026-08-25', status: 'Matched', confidence: 100, priority: 'LOW' },
  { id: 'TX-1005', bankRef: 'BNK-3341-M', ledgerRef: 'LEDG-3341', amount: 120000, date: '2026-08-25', status: 'Matched', confidence: 100, priority: 'LOW' },
  { id: 'TX-1006', bankRef: 'BNK-5512-R', ledgerRef: 'LEDG-5510', amount: 48000, date: '2026-08-24', status: 'Matched', confidence: 99, priority: 'LOW' },
  { id: 'TX-1007', bankRef: 'BNK-9901-L', ledgerRef: 'LEDG-9900', amount: 14500, date: '2026-08-24', status: 'Partial Match', confidence: 82, priority: 'MEDIUM' },
  { id: 'TX-1008', bankRef: 'BNK-1004-D', ledgerRef: 'LEDG-7002', amount: 12500, date: '2026-08-23', status: 'Review Required', confidence: 65, priority: 'LOW' },
  { id: 'TX-1009', bankRef: 'BNK-6002-K', ledgerRef: 'LEDG-6002', amount: 310000, date: '2026-08-22', status: 'Matched', confidence: 100, priority: 'LOW' },
  { id: 'TX-1010', bankRef: 'BNK-8810-Z', ledgerRef: 'LEDG-4412', amount: 34200, date: '2026-08-22', status: 'Unmatched', confidence: 40, priority: 'HIGH' },
];

export const mockInvestigations = [
  {
    id: 'CASE-#001',
    title: 'Duplicate Payment Pattern Detected',
    priority: 'CRITICAL',
    riskScore: 94,
    exposure: 85000,
    status: 'Investigation Active',
    summary: 'The transaction appears to have been processed twice within a short 45-minute time window across separate payment gateways.',
    causes: [
      'Duplicate bank posting during API timeout retry',
      'Manual ledger duplication by regional finance manager',
      'Payment gateway webhook triggered redundant callback'
    ],
    actions: [
      'Verify raw bank transaction reference payloads.',
      'Review automated payment processing logs in ERP.',
      'Flag duplicate transaction #BNK-8829-A for immediate refund.',
      'Escalate to VP of Finance for approval.'
    ]
  },
  {
    id: 'CASE-#002',
    title: 'Unrecorded Inbound Wire Transfer',
    priority: 'HIGH',
    riskScore: 82,
    exposure: 52500,
    status: 'Pending Review',
    summary: 'Direct wire transfer received in corporate bank account without matching invoice or customer account allocation.',
    causes: [
      'Customer omitted reference code during SWIFT transfer',
      'Unassigned suspense account clearing queue delay',
      'Inter-company cash transfer timing gap'
    ],
    actions: [
      'Cross-reference bank sender IBAN with active client directory.',
      'Request customer payment confirmation advice.',
      'Post temporary credit to unassigned receipts account.'
    ]
  },
  {
    id: 'CASE-#003',
    title: 'Foreign Exchange Rate Variance',
    priority: 'HIGH',
    riskScore: 78,
    exposure: 34200,
    status: 'Under Investigation',
    summary: 'Discrepancy in converted USD to INR transaction settlement due to mid-day spot rate fluctuation.',
    causes: [
      'Bank applied spot exchange rate at 14:00 GMT instead of contract rate',
      'Missing hedging offset in treasury ledger'
    ],
    actions: [
      'Audit spot rate quote at exact execution timestamp.',
      'Adjust FX gain/loss journal entry accordingly.'
    ]
  }
];

export const mockReports = [
  {
    id: 'REP-2026-08',
    title: 'ReconAI Executive Reconciliation Report',
    period: 'August 2026',
    format: 'PDF',
    size: '2.4 MB',
    date: '2026-08-30',
    status: 'Ready',
    summary: 'Full executive summary including Risk Index (72/100), ₹2,48,500 total exposure, 94.2% match rate, and top 5 critical action items.'
  },
  {
    id: 'REP-2026-07',
    title: 'Monthly Financial Discrepancy Summary',
    period: 'July 2026',
    format: 'PDF',
    size: '1.8 MB',
    date: '2026-07-31',
    status: 'Archived',
    summary: 'Historical monthly breakdown of 1,420 transactions with 96.2% automated match rate.'
  },
  {
    id: 'REP-2026-06',
    title: 'Quarterly Audit & Compliance Report',
    period: 'Q2 2026',
    format: 'PDF',
    size: '4.1 MB',
    date: '2026-06-30',
    status: 'Archived',
    summary: 'Comprehensive audit trails, bank statement verification logs, and internal control risk matrix.'
  }
];

export const mockHistoryRuns = [
  {
    id: 'RUN-9082',
    dateTime: '2026-08-30 11:30 AM',
    bankCount: 1280,
    ledgerCount: 1265,
    matchCount: 1248,
    exceptionCount: 32,
    riskScore: 72,
    exposure: 248500,
    status: 'Completed'
  },
  {
    id: 'RUN-9075',
    dateTime: '2026-08-25 04:15 PM',
    bankCount: 1150,
    ledgerCount: 1142,
    matchCount: 1130,
    exceptionCount: 20,
    riskScore: 45,
    exposure: 112000,
    status: 'Completed'
  },
  {
    id: 'RUN-9040',
    dateTime: '2026-08-18 09:00 AM',
    bankCount: 1420,
    ledgerCount: 1410,
    matchCount: 1395,
    exceptionCount: 25,
    riskScore: 58,
    exposure: 175000,
    status: 'Completed'
  },
  {
    id: 'RUN-8991',
    dateTime: '2026-08-10 02:45 PM',
    bankCount: 980,
    ledgerCount: 975,
    matchCount: 960,
    exceptionCount: 15,
    riskScore: 32,
    exposure: 64000,
    status: 'Completed'
  }
];

export const copilotPrompts = [
  "What is my biggest financial risk?",
  "What should I investigate first?",
  "How much money is at risk?",
  "Show all critical exceptions.",
  "What is my reconciliation rate?",
  "Give me a CFO-level summary."
];

export const copilotMockResponses = {
  "What is my biggest financial risk?": 
    "Your highest financial risk is **Case #001: Duplicate Payment** (Ref: `BNK-8829-A`). A duplicate vendor payment of **₹85,000** was posted twice within 45 minutes across separate gateways. This single issue accounts for **34.2%** of your total ₹2,48,500 exposure and carries a **Risk Score of 94/100**.",

  "What should I investigate first?":
    "You should prioritize the **5 CRITICAL exceptions** in your AI Action Queue:\n1. **₹85,000 Duplicate Payment** (`BNK-8829-A`) - Immediate reversal required.\n2. **₹52,500 Unrecorded Inbound Wire** (`BNK-9102-X`) - Customer reference missing.\n3. **₹34,200 FX Currency Variance** (`FX-8810-Z`) - Spot rate discrepancy.",

  "How much money is at risk?":
    "Your current total financial exposure is **₹2,48,500** across 32 unresolved discrepancies:\n• **Critical Risk:** ₹85,000 (1 item)\n• **High Risk:** ₹86,700 (2 items)\n• **Medium & Low Risk:** ₹76,800 (29 items)",

  "Show all critical exceptions.":
    "Here are your top Critical Exceptions:\n🔴 **₹85,000** | Duplicate Payment (`BNK-8829-A`) | Risk: 94/100\n🟠 **₹52,500** | Missing Ledger Entry (`BNK-9102-X`) | Risk: 82/100\n🟠 **₹34,200** | FX Variance (`FX-8810-Z`) | Risk: 78/100",

  "What is my reconciliation rate?":
    "Your automated reconciliation rate stands at **94.2%** for August 2026. Out of **1,280 bank transactions**, **1,248** were successfully matched with zero variances.",

  "Give me a CFO-level summary.":
    "**Executive Briefing for CFO:**\n• **Reconciliation Match Rate:** 94.2% (1,248 / 1,280 matched)\n• **Financial Risk Index:** 72 / 100 (Moderate Risk)\n• **Total Risk Exposure:** ₹2,48,500\n• **Priority Focus:** 5 critical discrepancies require ₹1,71,700 in capital recovery. Reversal workflow triggered."
};
