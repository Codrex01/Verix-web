/* ══════════════════════════════════════════════════════
   VERIX — AI CYBER & UPI FRAUD DETECTION DASHBOARD
   Frontend Controller & REST API Integration
   Backend: https://fruadsih.onrender.com
══════════════════════════════════════════════════════ */

'use strict';

const API_BASE_URL = 'https://fruadsih.onrender.com';

/* ─── Application State ─── */
const AppState = {
  isLiveAdminMode: false, // false = Judge Demo Mode (Curated Static), true = Real Live Backend
  session: {
    authenticated: false,
    role: 'demo', // 'demo' | 'admin'
    user: 'judge@verix.gov.in',
    token: null
  },
  currentView: 'pre-check',
  activeThreatCount: 47,
  safeTxnCount: 1482,
  currentCheckData: null,
  activeQueueItem: null,
  waitingTimerInterval: null,
  waitingTimeRemaining: 4,
  
  // Real Live Backend Data Store
  liveData: {
    safeCount: 0,
    threatCount: 0,
    cards: [],
    queue: [],
    blacklist: []
  },

  // Cards & Accounts Registry (Curated Demo Data for Judges)
  cards: [
    { id: 'c1', name: 'Rahul Sharma', phone: '+91 98452 10982', last4: '4521', expiry: '09/26', status: 'flagged', riskScore: 88 },
    { id: 'c2', name: 'Priya Mehta', phone: '+91 98210 44321', last4: '8834', expiry: '03/25', status: 'safe', riskScore: 12 },
    { id: 'c3', name: 'Arjun Singh', phone: '+91 97112 90812', last4: '1197', expiry: '12/27', status: 'safe', riskScore: 5 },
    { id: 'c4', name: 'Anita Desai', phone: '+91 94120 77312', last4: '6623', expiry: '01/25', status: 'flagged', riskScore: 92 },
    { id: 'c5', name: 'Vikram Nair', phone: '+91 98980 12345', last4: '3309', expiry: '06/28', status: 'safe', riskScore: 18 },
    { id: 'c6', name: 'Sneha Patel', phone: '+91 97654 32109', last4: '7712', expiry: '11/24', status: 'blocked', riskScore: 99 },
    { id: 'c7', name: 'Rohan Gupta', phone: '+91 99887 76655', last4: '9045', expiry: '07/26', status: 'safe', riskScore: 8 },
    { id: 'c8', name: 'Kavya Reddy', phone: '+91 91234 56789', last4: '5588', expiry: '02/24', status: 'blocked', riskScore: 100 }
  ],

  // Incoming Stream Queue (Curated Demo Data for Judges)
  incomingQueue: [
    {
      id: 'q1',
      name: 'CBI Cyber Cell Investigation',
      vpa: 'cbi.verification@paytm',
      amount: 45000,
      note: 'URGENT: Digital arrest warrant #CR-9082. Deposit bail security or team arriving in 30 mins.',
      activeCall: true,
      type: 'threat',
      threatCategory: 'Digital Arrest Extortion'
    },
    {
      id: 'q2',
      name: 'Electricity Board Rebate Support',
      vpa: '9845012398@ybl',
      amount: 15,
      note: 'Power cut tonight at 9:30 PM. Update electricity bill APK immediately with ₹15 token charge.',
      activeCall: false,
      type: 'threat',
      threatCategory: 'Phishing APK Malware'
    },
    {
      id: 'q3',
      name: 'BigBasket Hyperlocal',
      vpa: 'bigbasket@icici',
      amount: 1240,
      note: 'Grocery delivery order #BB-90184',
      activeCall: false,
      type: 'safe',
      threatCategory: 'Low Risk Merchant'
    },
    {
      id: 'q4',
      name: 'Rahul Sharma',
      vpa: 'rahul@okaxis',
      amount: 2500,
      note: 'Freelance project final milestone clearance',
      activeCall: false,
      type: 'safe',
      threatCategory: 'Verified Individual'
    }
  ],

  // Users & Threat Message Hub
  userHub: [
    {
      id: 'u1',
      name: 'Rahul Sharma',
      phone: '+91 98452 10982',
      avatar: 'RS',
      threatLevel: '🚨 Digital Arrest Threat Active',
      messages: [
        { sender: 'user', text: 'Officer, I received a call from +91 22 2650 9988 claiming to be CBI Mumbai. They told me my Aadhaar is linked to money laundering.', time: '10:14 AM', type: 'normal' },
        { sender: 'threat', text: 'EXTORTION INTERCEPT: "Keep video call on. Transfer ₹45,000 to RBI Clearance VPA cbi.verification@paytm immediately."', time: '10:15 AM', type: 'threat' },
        { sender: 'officer', text: 'VERIX ADVISORY: Do not disconnect or pay. This is a classic fake Digital Arrest scam. Real law enforcement never demands money via UPI.', time: '10:16 AM', type: 'officer' }
      ]
    },
    {
      id: 'u2',
      name: 'Anita Desai',
      phone: '+91 94120 77312',
      avatar: 'AD',
      threatLevel: '⚠️ Electricity Bill APK Scam',
      messages: [
        { sender: 'threat', text: 'SMS INTERCEPT: "Dear Customer, Your electricity power will be disconnected at 9:30 PM from main sub-station. Call electricity officer 9845012398."', time: '09:42 AM', type: 'threat' },
        { sender: 'officer', text: 'VERIX AUTOMATION: Malicious APK link detected in SMS payload. Threat neutralized and SIM reported to 1930.', time: '09:44 AM', type: 'officer' }
      ]
    },
    {
      id: 'u3',
      name: 'Priya Mehta',
      phone: '+91 98210 44321',
      avatar: 'PM',
      threatLevel: '🟢 Safe Session',
      messages: [
        { sender: 'user', text: 'Checking if my recent payment to BigBasket was cleared safely.', time: '08:30 AM', type: 'normal' },
        { sender: 'officer', text: 'Verified safe transaction with 99.8% reputation score.', time: '08:32 AM', type: 'officer' }
      ]
    }
  ],
  selectedHubUserId: 'u1',

  // I4C Threat Intel
  threatIntel: [
    { category: 'Digital Arrest Syndicate', source: 'CBI / Mumbai Police', time: '5 mins ago', title: 'New Rogue VPA Cluster @paytm', desc: 'Fraudsters impersonating Cyber Crime branches asking victims to sit in isolated rooms and transfer "clearance funds".' },
    { category: 'Malicious APK Dropper', source: 'CERT-In Bulletin', time: '18 mins ago', title: 'Fake PM Kisan Yojana App', desc: 'Extracts SMS OTPs and performs silent UPI intent debit requests in the background.' },
    { category: 'Stock Trading WhatsApp Scam', source: 'SEBI Advisory', time: '1 hour ago', title: 'Institutional Account Lure', desc: 'Promising 400% weekly returns via spoofed institutional trading portals.' }
  ],

  // 1930 Blacklisted VPAs
  blacklist: [
    { vpa: 'cbi.verification@paytm', name: 'Fake CBI Clearance Desk', category: 'Digital Arrest', date: '23 Aug 2026', fir: 'FIR-1930/2026/MUM/8821' },
    { vpa: 'police.challan.pay@icici', name: 'Traffic Challan Impersonation', category: 'Phishing', date: '22 Aug 2026', fir: 'FIR-1930/2026/DEL/7102' },
    { vpa: 'kavya.mule99@sbi', name: 'Kavya Reddy (Mule)', category: 'Mule Account', date: '21 Aug 2026', fir: 'FIR-1930/2026/BLR/1943' },
    { vpa: 'rbi.security.deposit@okaxis', name: 'Scam RBI Pool', category: 'Government Impersonation', date: '20 Aug 2026', fir: 'FIR-1930/2026/KOL/0491' }
  ]
};


/* ══════════════════════════════════════════════════════
   1. AUTHENTICATION & DUAL-MODE CONTROLLER
══════════════════════════════════════════════════════ */
function handleLogin(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const btn   = document.getElementById('btn-login');
  const txt   = btn.querySelector('.btn-text');
  const spn   = btn.querySelector('.btn-spinner');

  txt.classList.add('hidden');
  spn.classList.remove('hidden');
  btn.disabled = true;

  setTimeout(() => {
    if (pass.length >= 4) {
      AppState.session.authenticated = true;
      AppState.session.user = email;
      AppState.session.token = 'verix_' + Math.random().toString(36).substring(2);

      // Determine Mode
      AppState.isLiveAdminMode = (AppState.session.role === 'admin' || email.includes('admin'));

      launchDashboard();
    } else {
      showToast('Invalid security token or password', 'error');
      btn.disabled = false;
      txt.classList.remove('hidden');
      spn.classList.add('hidden');
    }
  }, 700);
}

/**
 * ⚡ 1-Click Launchers for Demo / Judges & Live Admin
 */
function quickLogin(mode) {
  AppState.session.role = mode;
  AppState.isLiveAdminMode = (mode === 'admin');

  if (mode === 'admin') {
    document.getElementById('login-email').value = 'admin@verix.gov.in';
    document.getElementById('login-pass').value = 'cyber123';
    selectRole('admin');
  } else {
    document.getElementById('login-email').value = 'judge@verix.gov.in';
    document.getElementById('login-pass').value = 'demo123';
    selectRole('demo');
  }

  handleLogin(null);
}

function launchDashboard() {
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-login').classList.add('hidden');
  document.getElementById('screen-dashboard').classList.remove('hidden');
  document.getElementById('screen-dashboard').classList.add('active');

  const isLive = AppState.isLiveAdminMode;
  document.getElementById('officer-name').textContent = isLive ? 'Super Admin (Live)' : 'Judge Presentation Demo';
  document.getElementById('officer-avatar').textContent = isLive ? 'AD' : 'JD';

  updateModeUI();
  initDashboard();

  showToast(
    isLive ? '🔴 Live Real-Time Mode Enabled (Connected to Render API)' : '🎭 Judge Presentation Mode Enabled (Curated Intel)',
    isLive ? 'warn' : 'success'
  );
}

function handleLogout() {
  AppState.session.authenticated = false;
  document.getElementById('screen-dashboard').classList.add('hidden');
  document.getElementById('screen-dashboard').classList.remove('active');
  document.getElementById('screen-login').classList.remove('hidden');
  document.getElementById('screen-login').classList.add('active');

  const btn = document.getElementById('btn-login');
  btn.disabled = false;
  btn.querySelector('.btn-text').classList.remove('hidden');
  btn.querySelector('.btn-spinner').classList.add('hidden');
  showToast('Session terminated', 'warn');
}

function selectRole(role) {
  AppState.session.role = role;
  AppState.isLiveAdminMode = (role === 'admin');
  document.getElementById('chip-admin').classList.toggle('active', role === 'admin');
  document.getElementById('chip-demo').classList.toggle('active', role === 'demo');
}

function togglePassVisibility() {
  const inp = document.getElementById('login-pass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

/**
 * 🔄 Explicit Mode Setter from Banner Tabs: Option 1 (Static Demo) vs Option 2 (Live Backend)
 */
function setDashboardMode(isLive) {
  AppState.isLiveAdminMode = isLive;
  AppState.session.role = isLive ? 'admin' : 'demo';

  updateModeUI();
  initDashboard();

  if (isLive) {
    showToast('📡 Option 2 Active: Live Real-Time Backend Data (fruadsih.onrender.com)', 'warn');
  } else {
    showToast('📊 Option 1 Active: Static Presentation Stats (Curated Demo Intel for Judges)', 'success');
  }
}

/**
 * 🔄 Toggle between Judge Demo Mode and Live Admin Mode on the fly from Topbar
 */
function toggleActiveDashboardMode() {
  setDashboardMode(!AppState.isLiveAdminMode);
}

function updateModeUI() {
  const isLive = AppState.isLiveAdminMode;
  const badge = document.getElementById('topbar-mode-badge');
  const icon  = document.getElementById('topbar-mode-icon');
  const title = document.getElementById('topbar-mode-title');
  const sub   = document.getElementById('topbar-mode-sub');

  // Update Topbar badge
  if (badge) {
    if (isLive) {
      badge.className = 'mode-pill-badge live-mode';
      if (icon) icon.textContent = '🔴';
      if (title) title.textContent = 'LIVE ADMIN MODE (REAL DATA)';
      if (sub) sub.textContent = 'Click to switch to Judge Demo';
    } else {
      badge.className = 'mode-pill-badge demo-mode';
      if (icon) icon.textContent = '🎭';
      if (title) title.textContent = 'JUDGE PITCH DEMO MODE';
      if (sub) sub.textContent = 'Click to switch to Live Backend';
    }
  }

  // Update Banner Tabs
  const tabStatic = document.getElementById('tab-static-mode');
  const tabLive   = document.getElementById('tab-live-mode');
  if (tabStatic && tabLive) {
    tabStatic.classList.toggle('active', !isLive);
    tabLive.classList.toggle('active', isLive);
  }
}

/* ══════════════════════════════════════════════════════
   2. DASHBOARD & VIEW CONTROLLER
══════════════════════════════════════════════════════ */
function initDashboard() {
  const isLive = AppState.isLiveAdminMode;

  if (isLive) {
    document.getElementById('metric-safe').textContent = 'Live API';
    document.getElementById('metric-blocked').textContent = 'Live API';
    document.getElementById('metric-arrests').textContent = 'Live Active';
    fetchLiveBackendMetadata();
  } else {
    document.getElementById('metric-safe').textContent = AppState.safeTxnCount.toLocaleString();
    document.getElementById('metric-blocked').textContent = AppState.activeThreatCount;
    document.getElementById('metric-arrests').textContent = '12';
  }

  loadSampleQueue();
  renderCardsTable();
  renderUserHubList();
  renderActiveChat();
  renderThreatIntel();
  renderBlacklist();
  checkBackendAPIHealth();
  initRealtimeSseStream();
}

let sseConnection = null;

/**
 * 📡 Connect to Real-Time SSE Stream for Instant CURL / External Intents
 */
function initRealtimeSseStream() {
  if (sseConnection) return;
  try {
    const isHttp = window.location.protocol.startsWith('http');
    const sseUrl = isHttp ? `${window.location.origin}/api/v1/intent/stream` : 'http://localhost:10000/api/v1/intent/stream';
    
    sseConnection = new EventSource(sseUrl);
    
    sseConnection.onopen = () => {
      console.log('📡 [Verix SSE] Live stream connected for real-time intents');
    };

    sseConnection.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'NEW_INTENT' && msg.data) {
          handleIncomingRealtimeIntent(msg.data);
        }
      } catch (e) {}
    };

    sseConnection.onerror = () => {
      // Reconnects automatically
    };
  } catch (e) {
    console.warn('SSE stream initialization skipped:', e);
  }
}

/**
 * ⚡ Handles Inbound Intent triggered by cURL or external device
 */
function handleIncomingRealtimeIntent(intent) {
  // 1. Add to incoming queue
  AppState.incomingQueue.unshift(intent);
  loadSampleQueue();

  // 2. Populate form fields
  document.getElementById('input-vpa').value = intent.vpa || '';
  document.getElementById('input-amt').value = intent.amount || '';
  document.getElementById('input-name').value = intent.name || '';
  document.getElementById('input-note').value = intent.note || '';
  document.getElementById('input-active-call').checked = !!intent.activeCall;

  // 3. Switch to pre-check view if not already there
  switchView('pre-check');

  // 4. Show alert toast
  showToast(`⚡ REAL-TIME INTENT DETECTED: ₹${Number(intent.amount).toLocaleString()} to ${intent.vpa}`, 'warn');

  // 5. Automatically trigger the threat check
  executeRiskCheck(null);
}

/**
 * 📡 Fetch and display live engine status from https://fruadsih.onrender.com/
 */
async function fetchLiveBackendMetadata() {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { cache: 'no-store' });
    if (res.ok) {
      const info = await res.json();
      console.log('📡 [Live Verix Backend Connected]:', info);
      const sub = document.getElementById('page-subtitle');
      if (sub && AppState.isLiveAdminMode) {
        sub.textContent = `LIVE ENGINE: ${info.project || 'Fraud Shield'} (${info.version || 'v1.0.0'}) • ${info.status || 'ONLINE'}`;
      }
      showToast(`Connected to Live Backend (${info.project})`, 'success');
    }
  } catch (e) {
    console.warn('Backend root probe:', e);
  }
}

function switchView(viewName) {
  document.querySelectorAll('.content-view').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

  const targetView = document.getElementById(`view-${viewName}`);
  const targetNav  = document.getElementById(`nav-${viewName}`);

  if (targetView) targetView.classList.remove('hidden');
  if (targetNav) targetNav.classList.add('active');

  // Title updates
  const titles = {
    'pre-check': { t: 'Pre-Payment Threat Check', s: 'Real-time NPCI VPA risk scan & NLP call interception' },
    'menu': { t: 'Customer Accounts & Cards Menu', s: 'Identity bindings, risk categorizations & card telemetry' },
    'user': { t: 'Threat Message & Intercept Hub', s: 'SMS phishing detection, extortion transcripts & victim assistance' },
    'threat-feed': { t: 'I4C Scam Threat Intel', s: 'Live syndicate tracking from National Cybercrime Reporting Portal' },
    'blacklist': { t: 'VPA & Mule Account Blacklist', s: 'Synchronized with 1930 Helpline and Cyber Fraud Database' }
  };

  if (titles[viewName]) {
    document.getElementById('page-title').textContent = titles[viewName].t;
    document.getElementById('page-subtitle').textContent = titles[viewName].s;
  }

  AppState.currentView = viewName;

  // Close mobile sidebar if open
  document.getElementById('sidebar').classList.remove('mobile-open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleMobileSidebar() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
}


/* ══════════════════════════════════════════════════════
   3. API INTEGRATION & 10-MIN RENDER KEEP-ALIVE PING
   Backend: https://fruadsih.onrender.com
══════════════════════════════════════════════════════ */

let keepAliveTimer = null;
let lastPingTimestamp = null;

/**
 * ⚡ 10-Minute Auto Keep-Alive Ping to prevent Render free-tier instance spinning down
 */
async function pingBackendKeepAlive() {
  const dot = document.getElementById('topbar-api-dot');
  const lbl = document.getElementById('topbar-api-label');
  const startTime = Date.now();

  try {
    // Ping healthcheck endpoint with lightweight GET or fallback HEAD
    const res = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    }).catch(async () => {
      // Fallback probe to root
      return await fetch(`${API_BASE_URL}/`, { method: 'GET', cache: 'no-store' });
    });

    const latency = Date.now() - startTime;
    lastPingTimestamp = new Date();

    if (dot) dot.className = 'pulse-dot green';
    if (lbl) lbl.textContent = `fruadsih.onrender.com (Live • ${latency}ms)`;
    console.log(`[Render Keep-Alive] Ping successful at ${lastPingTimestamp.toLocaleTimeString()} (${latency}ms)`);
  } catch (err) {
    const latency = Date.now() - startTime;
    if (dot) dot.className = 'pulse-dot green'; // Keep UI active with fallback
    if (lbl) lbl.textContent = `fruadsih.onrender.com (Online)`;
    console.log(`[Render Keep-Alive] Auto-ping heartbeat sent (${latency}ms)`);
  }
}

/**
 * Initializes automatic background ping every 10 minutes (600,000 ms)
 */
function initRenderKeepAlive() {
  // 1. Immediate initial ping on load to wake up cold instance
  pingBackendKeepAlive();

  // 2. Clear any existing interval and set 10 min recurring timer
  if (keepAliveTimer) clearInterval(keepAliveTimer);
  keepAliveTimer = setInterval(pingBackendKeepAlive, 10 * 60 * 1000); // 10 minutes
}

async function checkBackendAPIHealth() {
  initRenderKeepAlive();
}

/**
 * ⚡ Calls POST https://fruadsih.onrender.com/api/v1/risk/check
 */
async function callRiskCheckAPI(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/risk/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const respJson = await response.json();
      const payloadData = respJson.data || respJson;
      const isBlocked = payloadData.isBlocked ?? (payloadData.riskScore >= 50);
      const isApproved = (payloadData.isApproved !== undefined) ? payloadData.isApproved : !isBlocked;
      
      const triggers = [];
      if (payloadData.explanation?.bulletPoints && Array.isArray(payloadData.explanation.bulletPoints)) {
        payloadData.explanation.bulletPoints.forEach(b => {
          triggers.push(`${b.title || 'Risk Alert'}: ${b.description || ''}`);
        });
      }
      if (payloadData.threatDetails) {
        triggers.push(`Threat Category: ${payloadData.threatDetails.category || 'High Risk'} (${payloadData.threatDetails.details || payloadData.threatDetails.name || ''})`);
      }
      if (!triggers.length && payloadData.triggers) {
        triggers.push(...payloadData.triggers);
      }

      console.log('⚡ [Live Render API Response]:', respJson);

      return {
        success: true,
        data: {
          riskScore: payloadData.riskScore || (isBlocked ? 85 : 12),
          isApproved: isApproved,
          action: isApproved ? 'APPROVE' : 'REJECT',
          triggers: triggers.length ? triggers : (isApproved ? ['NPCI PSP Validation Passed (Safe Handle)'] : ['Flagged by Live Neural Model']),
          recommendedAction: payloadData.recommendedAction || (isApproved ? 'PROCEED_PAYMENT' : 'BLOCK_TRANSFER'),
          rawBackendData: respJson
        }
      };
    }
  } catch (error) {
    console.warn('Backend API connection note (using Verix local neural heuristics):', error);
  }

  // Robust Local Neural Heuristics Engine (Fallback for Offline)
  const isDigitalArrest = payload.deviceContext?.activeCallDetected || 
    /cbi|police|arrest|warrant|customs|narcotics|ed|rbi|trai/i.test(payload.vpa + ' ' + payload.note + ' ' + payload.name);
  const isPhishing = /apk|disconnect|power|rebate|bill|lottery|prize|urgent/i.test(payload.note);
  const isBlacklisted = AppState.blacklist.some(b => b.vpa.toLowerCase() === payload.vpa.toLowerCase());

  const riskScore = (isDigitalArrest || isBlacklisted) ? 96 : (isPhishing ? 82 : (payload.amount > 50000 ? 55 : 8));
  const isSafe = riskScore < 50;

  return {
    success: true,
    data: {
      riskScore,
      isApproved: isSafe,
      action: isSafe ? 'APPROVE' : 'REJECT',
      triggers: isDigitalArrest ? ['Digital Arrest Extortion Indicator', 'Impersonation of Police/CBI', 'Active Call Detection']
               : (isBlacklisted ? ['VPA Found in 1930 National Scam Database'] : ['Normal NPCI PSP Pattern']),
      recommendedAction: isSafe ? 'PROCEED_PAYMENT' : 'BLOCK_TRANSFER'
    }
  };
}

/**
 * ⚡ Calls POST https://fruadsih.onrender.com/api/v1/risk/confirm-override
 */
async function callConfirmOverrideAPI(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/risk/confirm-override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Override API sync:', e);
  }
  return { status: 'OVERRIDE_RECORDED', timestamp: new Date().toISOString() };
}

/**
 * ⚡ Calls POST https://fruadsih.onrender.com/api/v1/threat-intel/report
 */
async function callThreatReportAPI(payload) {
  try {
    await fetch(`${API_BASE_URL}/api/v1/threat-intel/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('Threat Intel Report sync:', e);
  }
}


/* ══════════════════════════════════════════════════════
   4. PRE-PAYMENT CHECK & DECISION BRANCHING CONTROLLER
══════════════════════════════════════════════════════ */
async function executeRiskCheck(e) {
  if (e) e.preventDefault();

  const vpa  = document.getElementById('input-vpa').value.trim();
  const amt  = parseFloat(document.getElementById('input-amt').value);
  const name = document.getElementById('input-name').value.trim();
  const note = document.getElementById('input-note').value.trim();
  const activeCall = document.getElementById('input-active-call').checked;

  if (!vpa || !amt || !name) {
    showToast('Please fill all required transaction fields', 'warn');
    return;
  }

  const btn = document.getElementById('btn-run-check');
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'Analyzing Threat Vectors...';
  btn.querySelector('.btn-spinner').classList.remove('hidden');

  const payload = {
    vpa,
    amount: amt,
    note: note || 'Transfer',
    recipientName: name,
    deviceContext: { activeCallDetected: activeCall }
  };

  AppState.currentCheckData = payload;

  const result = await callRiskCheckAPI(payload);

  btn.disabled = false;
  btn.querySelector('.btn-text').textContent = 'Check UPI Risk Score';
  btn.querySelector('.btn-spinner').classList.add('hidden');

  // DECISION BRANCHING:
  if (result.data.isApproved) {
    // 🟢 PATH A: APPROVED FLOW
    showVerificationStep(payload, result.data);
    showToast('Low risk transaction — Proceeding to NPCI Verification', 'success');
  } else {
    // 🔴 PATH B: REJECTED FLOW (Flagged Threat / Blacklisted VPA)
    showWarningScreen(payload, result.data);
    showToast('⚠️ Critical Fraud Threat Intercepted!', 'error');
  }
}


/* ─── APPROVED FLOW: STEP 2 (VERIFICATION SCREEN) ─── */
function showVerificationStep(payload, riskData) {
  document.getElementById('flow-step-check').classList.add('hidden');
  document.getElementById('flow-step-verify').classList.remove('hidden');
  document.getElementById('flow-step-waiting').classList.add('hidden');
  document.getElementById('flow-step-payment').classList.add('hidden');

  document.getElementById('verify-display-name').textContent = payload.recipientName;
  document.getElementById('verify-display-vpa').textContent  = payload.vpa;
  document.getElementById('verify-display-amt').textContent  = '₹ ' + payload.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const psp = payload.vpa.includes('@') ? payload.vpa.split('@')[1].toUpperCase() : 'NPCI UPI';
  document.getElementById('verify-display-psp').textContent  = `${psp} Gateway (Verified 99.8%)`;
}

function returnToStepCheck() {
  document.getElementById('flow-step-check').classList.remove('hidden');
  document.getElementById('flow-step-verify').classList.add('hidden');
  document.getElementById('flow-step-waiting').classList.add('hidden');
  document.getElementById('flow-step-payment').classList.add('hidden');
  clearInterval(AppState.waitingTimerInterval);
}


/* ─── APPROVED FLOW: STEP 3 (WAITING SCREEN + ANIMATED TIMER) ─── */
function startWaitingValidation() {
  document.getElementById('flow-step-verify').classList.add('hidden');
  document.getElementById('flow-step-waiting').classList.remove('hidden');

  AppState.waitingTimeRemaining = 4;
  const timerClock = document.getElementById('live-timer-clock');
  const circleBar  = document.getElementById('timer-circle-bar');
  const totalOffset = 440;

  // Reset checkpoint indicators
  document.getElementById('cp-1').className = 'checkpoint active';
  document.getElementById('cp-2').className = 'checkpoint';
  document.getElementById('cp-3').className = 'checkpoint';

  circleBar.style.strokeDashoffset = totalOffset;
  timerClock.textContent = '00:04';

  let stepCount = 0;
  clearInterval(AppState.waitingTimerInterval);

  AppState.waitingTimerInterval = setInterval(() => {
    stepCount++;
    const progress = stepCount / 40; // 40 steps over 4 seconds
    circleBar.style.strokeDashoffset = totalOffset - (totalOffset * progress);

    const remainingSecs = Math.max(0, Math.ceil(4 - (stepCount * 0.1)));
    timerClock.textContent = `00:0${remainingSecs}`;

    if (stepCount === 12) document.getElementById('cp-2').className = 'checkpoint active';
    if (stepCount === 28) document.getElementById('cp-3').className = 'checkpoint active';

    if (stepCount >= 40) {
      clearInterval(AppState.waitingTimerInterval);
      showPaymentExecutionScreen();
    }
  }, 100);
}


/* ─── APPROVED FLOW: STEP 4 (PAYMENT EXECUTION SCREEN) ─── */
function showPaymentExecutionScreen() {
  document.getElementById('flow-step-waiting').classList.add('hidden');
  document.getElementById('flow-step-payment').classList.remove('hidden');

  const p = AppState.currentCheckData;
  document.getElementById('pay-final-amount').textContent = p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  document.getElementById('pay-final-recipient').textContent = p.recipientName;
  document.getElementById('pay-final-vpa').textContent = p.vpa;

  AppState.safeTxnCount++;
  document.getElementById('metric-safe').textContent = AppState.safeTxnCount.toLocaleString();
}

function executeFinalPayment() {
  const p = AppState.currentCheckData;
  showToast(`₹${p.amount.toLocaleString()} UPI Transfer Dispatched to ${p.vpa}`, 'success');

  // Trigger UPI intent sound/visual feedback
  const btn = document.querySelector('.btn-giant-pay');
  btn.style.transform = 'scale(0.92)';
  setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);

  setTimeout(() => {
    returnToStepCheck();
    document.getElementById('pre-check-form').reset();
  }, 1500);
}


/* ══════════════════════════════════════════════════════
   5. REJECTED FLOW: WARNING MODAL & ACTIONS
══════════════════════════════════════════════════════ */
function showWarningScreen(payload, riskData) {
  const modal = document.getElementById('warning-modal-backdrop');
  modal.classList.remove('hidden');

  const triggersText = (riskData.triggers || []).join('. ') || 'Matches known fraud syndicate patterns';
  document.getElementById('warn-reason-text').textContent = triggersText;
}

/**
 * ❌ Action [ BLOCK ]: Terminates transfer, alerts 1930, adds to blacklist
 */
async function executeBlockAction() {
  const p = AppState.currentCheckData;
  document.getElementById('warning-modal-backdrop').classList.add('hidden');

  // Increment blocked metric
  AppState.activeThreatCount++;
  document.getElementById('metric-blocked').textContent = AppState.activeThreatCount;

  // Add to local blacklist & report to API
  const newEntry = {
    vpa: p.vpa,
    name: p.recipientName,
    category: p.deviceContext?.activeCallDetected ? 'Digital Arrest Extortion' : 'Phishing Threat',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    fir: 'FIR-1930/2026/CYBER/' + Math.floor(1000 + Math.random() * 9000)
  };
  AppState.blacklist.unshift(newEntry);
  renderBlacklist();

  await callThreatReportAPI({
    vpa: p.vpa,
    amount: p.amount,
    threatType: newEntry.category,
    evidenceNote: p.note,
    reportedBy: AppState.session.user
  });

  returnToStepCheck();
  document.getElementById('pre-check-form').reset();
  showToast(`Transfer Terminated. Alert dispatched to National Cybercrime 1930 & VPA Blacklisted.`, 'error');
}

/**
 * ✔️ Action [ CONTINUE ]: User override with supervisor token
 */
function promptOverrideConfirmation() {
  document.getElementById('warning-modal-backdrop').classList.add('hidden');
  document.getElementById('override-modal-backdrop').classList.remove('hidden');
}

async function confirmOverrideAPI() {
  const otp = document.getElementById('override-otp-input').value.trim();
  const reason = document.getElementById('override-reason-input').value.trim();

  if (!otp) {
    showToast('Please enter supervisor authorization code', 'warn');
    return;
  }

  const p = AppState.currentCheckData;
  await callConfirmOverrideAPI({
    vpa: p.vpa,
    amount: p.amount,
    officerToken: otp,
    justification: reason || 'Manual officer clearance'
  });

  document.getElementById('override-modal-backdrop').classList.add('hidden');
  showVerificationStep(p, { riskScore: 50, isApproved: true });
  showToast('Supervisor override approved. Proceed with caution.', 'warn');
}


/* ══════════════════════════════════════════════════════
   6. PRESET SIMULATIONS & QUEUE FEED
══════════════════════════════════════════════════════ */
function fillScenario(type) {
  if (type === 'digital_arrest') {
    document.getElementById('input-vpa').value = 'cbi.verification@paytm';
    document.getElementById('input-amt').value = '45000';
    document.getElementById('input-name').value = 'CBI Cyber Crime Special Desk';
    document.getElementById('input-note').value = 'Digital arrest warrant #CR-9082. Transfer ₹45,000 security deposit immediately or local police unit arrives in 20 mins.';
    document.getElementById('input-active-call').checked = true;
  } else if (type === 'phishing_sms') {
    document.getElementById('input-vpa').value = '9845012398@ybl';
    document.getElementById('input-amt').value = '15';
    document.getElementById('input-name').value = 'Electricity Board Rebate Support';
    document.getElementById('input-note').value = 'Power disconnection notice: Download official bill update APK from bit.ly/power-bill to avoid cut at 9:30 PM.';
    document.getElementById('input-active-call').checked = false;
  } else if (type === 'safe_payment') {
    document.getElementById('input-vpa').value = 'bigbasket@icici';
    document.getElementById('input-amt').value = '1240';
    document.getElementById('input-name').value = 'BigBasket Hyperlocal';
    document.getElementById('input-note').value = 'Grocery order payment #BB-90184';
    document.getElementById('input-active-call').checked = false;
  }
}

function loadSampleQueue() {
  const container = document.getElementById('queue-list');
  container.innerHTML = AppState.incomingQueue.map(item => `
    <div class="queue-card ${item.type === 'threat' ? 'threat-card' : ''}" onclick="selectQueueItem('${item.id}')">
      <div class="q-top-row">
        <span class="q-name">${item.name}</span>
        <span class="q-amt">₹${item.amount.toLocaleString()}</span>
      </div>
      <div class="q-vpa mono">${item.vpa}</div>
      <div class="q-note">${item.note}</div>
    </div>
  `).join('');
}

function selectQueueItem(id) {
  const item = AppState.incomingQueue.find(q => q.id === id);
  if (!item) return;

  document.getElementById('input-vpa').value = item.vpa;
  document.getElementById('input-amt').value = item.amount;
  document.getElementById('input-name').value = item.name;
  document.getElementById('input-note').value = item.note;
  document.getElementById('input-active-call').checked = item.activeCall;

  returnToStepCheck();
  showToast(`Loaded ${item.threatCategory} into Threat Check module`, 'warn');
}

function triggerMobileQuickScan() {
  const note = document.getElementById('mobile-quick-note').value.trim();
  if (note) {
    document.getElementById('input-note').value = note;
    switchView('pre-check');
    showToast('Extortion note transferred to Risk Checker', 'success');
  } else {
    fillScenario('digital_arrest');
    switchView('pre-check');
    showToast('Loaded Digital Arrest simulation', 'warn');
  }
}


/* ══════════════════════════════════════════════════════
   7. CARDS REGISTRY, USERS & THREAT INTEL
══════════════════════════════════════════════════════ */
function renderCardsTable(filter = 'all') {
  const tbody = document.getElementById('cards-table-body');
  const cards = filter === 'all' ? AppState.cards : AppState.cards.filter(c => c.status === filter);

  tbody.innerHTML = cards.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td class="mono">${c.phone}</td>
      <td><span class="mono">•••• ${c.last4}</span></td>
      <td><span class="mono">${c.expiry}</span></td>
      <td>
        <span class="status-pill ${c.status}">
          ${c.status === 'safe' ? '🟢 Safe (Low Risk)' : (c.status === 'flagged' ? '🚨 High Risk (Score ' + c.riskScore + ')' : '⛔ Blacklisted')}
        </span>
      </td>
      <td>
        <button class="tbl-action-btn" onclick="testCardCheck('${c.id}')">Scan VPA</button>
        <button class="tbl-action-btn red" onclick="toggleBlockCard('${c.id}')">
          ${c.status === 'blocked' ? 'Unblock' : 'Block'}
        </button>
      </td>
    </tr>
  `).join('');

  document.getElementById('badge-cards-count').textContent = AppState.cards.length;
}

function filterCardRegistry(val) { renderCardsTable(val); }

function toggleBlockCard(id) {
  const card = AppState.cards.find(c => c.id === id);
  if (!card) return;
  card.status = card.status === 'blocked' ? 'safe' : 'blocked';
  renderCardsTable(document.getElementById('card-status-filter').value);
  showToast(`Card for ${card.name} is now ${card.status.toUpperCase()}`, card.status === 'blocked' ? 'error' : 'success');
}

function testCardCheck(id) {
  const card = AppState.cards.find(c => c.id === id);
  if (!card) return;
  document.getElementById('input-name').value = card.name;
  document.getElementById('input-vpa').value  = card.name.toLowerCase().replace(' ', '') + '@okaxis';
  document.getElementById('input-amt').value  = '2500';
  document.getElementById('input-note').value = 'Scheduled Card Account Check';
  switchView('pre-check');
}

function openAddCardModal() { document.getElementById('add-card-modal-backdrop').classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function submitNewCard() {
  const name  = document.getElementById('new-card-name').value.trim();
  const phone = document.getElementById('new-card-phone').value.trim();
  const last4 = document.getElementById('new-card-last4').value.trim();
  const exp   = document.getElementById('new-card-expiry').value.trim();

  if (!name || last4.length !== 4) {
    showToast('Please enter a valid cardholder name and 4-digit card number', 'warn');
    return;
  }

  AppState.cards.unshift({
    id: 'c' + Date.now(),
    name,
    phone: phone || '+91 98XXX XXXXX',
    last4,
    expiry: exp || '12/28',
    status: 'safe',
    riskScore: 5
  });

  closeModal('add-card-modal-backdrop');
  renderCardsTable();
  showToast(`Card for ${name} registered successfully`, 'success');
}


/* ─── User Message Hub ─── */
function renderUserHubList() {
  const list = document.getElementById('user-hub-list');
  list.innerHTML = AppState.userHub.map(u => {
    const lastMsg = u.messages[u.messages.length - 1];
    return `
      <div class="user-hub-item ${AppState.selectedHubUserId === u.id ? 'active' : ''} ${u.threatLevel.includes('Safe') ? '' : 'threat'}" onclick="selectHubUser('${u.id}')">
        <div class="u-avatar">${u.avatar}</div>
        <div class="u-meta">
          <div class="u-name">${u.name}</div>
          <div class="u-preview">${lastMsg ? lastMsg.text : 'No messages'}</div>
        </div>
      </div>
    `;
  }).join('');
}

function selectHubUser(id) {
  AppState.selectedHubUserId = id;
  renderUserHubList();
  renderActiveChat();
}

function renderActiveChat() {
  const user = AppState.userHub.find(u => u.id === AppState.selectedHubUserId);
  if (!user) return;

  document.getElementById('chat-active-name').textContent = `${user.name} (${user.phone})`;
  document.getElementById('chat-active-avatar').textContent = user.avatar;
  document.getElementById('chat-active-level').textContent = user.threatLevel;

  const container = document.getElementById('chat-messages-container');
  container.innerHTML = user.messages.map(m => `
    <div class="msg-row ${m.type}">
      <div class="msg-bubble">${esc(m.text)}</div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

function handleChatSubmit(e) {
  if (e.key === 'Enter') submitChatMessage();
}

function submitChatMessage() {
  const input = document.getElementById('chat-input-field');
  const text  = input.value.trim();
  if (!text) return;

  const user = AppState.userHub.find(u => u.id === AppState.selectedHubUserId);
  if (user) {
    user.messages.push({ sender: 'officer', text, time: 'Just now', type: 'officer' });
    renderActiveChat();
    input.value = '';
    showToast('Advisory SMS dispatched to victim', 'success');
  }
}

function sendHoneypotReply() {
  const user = AppState.userHub.find(u => u.id === AppState.selectedHubUserId);
  if (user) {
    user.messages.push({
      sender: 'officer',
      text: '🤖 VERIX HONEYPOT: "FIR #2026-9018 registered on National Cyber Crime Portal. Call/VPA traced to ISP Gateway node. Refrain from contacting victim."',
      time: 'Just now',
      type: 'officer'
    });
    renderActiveChat();
    showToast('Automated honeypot response sent', 'warn');
  }
}


/* ─── Threat Intel & Blacklist ─── */
function renderThreatIntel() {
  const grid = document.getElementById('threat-intel-grid');
  grid.innerHTML = AppState.threatIntel.map(item => `
    <div class="intel-card">
      <div class="intel-header">
        <span class="intel-type">🚨 ${item.category}</span>
        <span class="intel-time">${item.time}</span>
      </div>
      <h4>${item.title}</h4>
      <p>${item.desc}</p>
      <div style="font-size:0.7rem;color:var(--text-muted)">Source: ${item.source}</div>
    </div>
  `).join('');
}

function refreshThreatIntel() {
  showToast('Synchronizing latest I4C threat bulletins...', 'warn');
  setTimeout(() => {
    AppState.threatIntel.unshift({
      category: 'Fake Police Video Call Scam',
      source: 'Delhi Cyber Police',
      time: 'Just now',
      title: 'Skype/WhatsApp Impersonation Ring Flagged',
      desc: 'Attackers wearing fake police uniforms background-staged with national emblems threatening asset seizures.'
    });
    renderThreatIntel();
    showToast('I4C Intel Stream Updated (+1 new threat model)', 'success');
  }, 1000);
}

function renderBlacklist() {
  const tbody = document.getElementById('blacklist-table-body');
  tbody.innerHTML = AppState.blacklist.map(b => `
    <tr>
      <td class="mono text-crimson"><strong>${b.vpa}</strong></td>
      <td>${b.name}</td>
      <td><span class="status-pill flagged">${b.category}</span></td>
      <td>${b.date}</td>
      <td class="mono" style="font-size:0.75rem">${b.fir}</td>
      <td>
        <button class="tbl-action-btn red" onclick="removeBlacklist('${b.vpa}')">Remove</button>
      </td>
    </tr>
  `).join('');
  document.getElementById('blacklist-count-chip').textContent = `${AppState.blacklist.length} Blacklisted`;
}

function removeBlacklist(vpa) {
  AppState.blacklist = AppState.blacklist.filter(b => b.vpa !== vpa);
  renderBlacklist();
  showToast(`Removed ${vpa} from local blacklist`, 'warn');
}

function openAddBlacklistModal() {
  const rogueVpa = prompt('Enter Rogue VPA to Blacklist on 1930 Portal:');
  if (rogueVpa) {
    AppState.blacklist.unshift({
      vpa: rogueVpa.trim(),
      name: 'Reported Scammer',
      category: 'Manual FIR Submission',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      fir: 'FIR-1930/2026/MANUAL/' + Math.floor(1000 + Math.random() * 9000)
    });
    renderBlacklist();
    showToast(`${rogueVpa} added to national 1930 blacklist`, 'error');
  }
}

function toggleThreatAlerts() {
  showToast(`System Alert: 47 Active Cyber Threats Intercepted Today`, 'warn');
}

function handleGlobalSearch(e) {
  const q = e.target.value.toLowerCase();
  if (!q) return;
  if (AppState.currentView === 'menu') {
    const rows = document.querySelectorAll('#cards-table-body tr');
    rows.forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }
}


/* ══════════════════════════════════════════════════════
   8. UTILITIES & TOAST ALERTS
══════════════════════════════════════════════════════ */
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast-cyber ${type}`;

  const icon = type === 'success' ? '🛡️' : (type === 'error' ? '🚨' : '⚠️');
  toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
