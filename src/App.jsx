import { useState, useEffect, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

// ─────────────────────────────────────────────────────────────────
// 🔥 FIREBASE CONFIG — Replace with YOUR config
// ─────────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let firebaseApp, firebaseAuth, firebaseDb, authMod, storeMod;
async function loadFirebase() {
  if (firebaseApp) return;
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
  authMod  = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
  storeMod = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  firebaseApp  = initializeApp(FIREBASE_CONFIG);
  firebaseAuth = authMod.getAuth(firebaseApp);
  firebaseDb   = storeMod.getFirestore(firebaseApp);
}

// ─────────────────────────────────────────────────────────────────
// DESIGN TOKENS + CONSTANTS
// ─────────────────────────────────────────────────────────────────
const CATS   = ["Food","Travel","Shopping","Entertainment","Health","Education","Bills","Other"];
const COLORS = { Food:"#F4845F", Travel:"#5B8DEF", Shopping:"#E879A0", Entertainment:"#A78BFA", Health:"#34D399", Education:"#38BDF8", Bills:"#FBBF24", Other:"#94A3B8" };
const ICONS  = { Food:"🍜", Travel:"✈️", Shopping:"🛍️", Entertainment:"🎬", Health:"💊", Education:"📚", Bills:"⚡", Other:"📦" };

const DEMO = [
  {id:"d1",  amount:580,  category:"Food",          date:"2026-02-28", description:"Dinner at Spice Route"},
  {id:"d2",  amount:1850, category:"Travel",         date:"2026-02-27", description:"Ola cab to airport"},
  {id:"d3",  amount:4200, category:"Shopping",       date:"2026-02-26", description:"Winter jacket"},
  {id:"d4",  amount:960,  category:"Entertainment",  date:"2026-02-25", description:"Concert tickets"},
  {id:"d5",  amount:340,  category:"Food",           date:"2026-02-24", description:"Café brunch"},
  {id:"d6",  amount:650,  category:"Health",         date:"2026-02-23", description:"Pharmacy & vitamins"},
  {id:"d7",  amount:2200, category:"Bills",          date:"2026-02-22", description:"Electricity & water"},
  {id:"d8",  amount:290,  category:"Food",           date:"2026-02-21", description:"Morning coffee"},
  {id:"d9",  amount:1800, category:"Education",      date:"2026-02-20", description:"Coursera subscription"},
  {id:"d10", amount:720,  category:"Travel",         date:"2026-02-19", description:"Metro & auto rides"},
  {id:"d11", amount:1100, category:"Food",           date:"2026-02-18", description:"Weekly groceries"},
  {id:"d12", amount:5500, category:"Shopping",       date:"2026-02-17", description:"Noise TWS earbuds"},
  {id:"d13", amount:450,  category:"Entertainment",  date:"2026-02-16", description:"Netflix + Spotify"},
  {id:"d14", amount:880,  category:"Food",           date:"2026-02-15", description:"Team lunch"},
  {id:"d15", amount:3100, category:"Travel",         date:"2026-02-14", description:"Weekend trip fuel"},
];

const fmt = n => "₹" + Number(n).toLocaleString("en-IN");
const isReal = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

// ─────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=Playfair+Display:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #080B14;
    --bg2:         #0D1120;
    --bg3:         #111827;
    --border:      rgba(255,255,255,0.06);
    --border2:     rgba(255,255,255,0.10);
    --text:        #F1F5F9;
    --text2:       #94A3B8;
    --text3:       #475569;
    --gold:        #D4A853;
    --gold2:       #F0C56A;
    --gold-glow:   rgba(212,168,83,0.15);
    --blue:        #5B8DEF;
    --red:         #F87171;
    --green:       #34D399;
    --radius:      16px;
    --radius-sm:   10px;
    --radius-lg:   24px;
    --shadow:      0 4px 24px rgba(0,0,0,0.4);
    --shadow-lg:   0 8px 48px rgba(0,0,0,0.6);
    --font:        'DM Sans', sans-serif;
    --font-display:'Playfair Display', serif;
    --font-mono:   'JetBrains Mono', monospace;
    --transition:  all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  html, body, #root { height: 100%; }

  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

  select option { background: #111827; color: #F1F5F9; }

  /* ── Animations ── */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes shimmer  { 0%,100% { opacity:.4; } 50% { opacity:.8; } }
  @keyframes pulse    { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.05); } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
  @keyframes toastIn  { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes glow     { 0%,100% { box-shadow: 0 0 20px var(--gold-glow); } 50% { box-shadow: 0 0 40px rgba(212,168,83,0.3); } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes barGrow  { from { transform: scaleY(0); } to { transform: scaleY(1); } }

  .animate-fadeup    { animation: fadeUp 0.5s ease forwards; }
  .animate-fadein    { animation: fadeIn 0.4s ease forwards; }
  .animate-slidein   { animation: slideIn 0.35s ease forwards; }
  .animate-glow      { animation: glow 3s ease-in-out infinite; }

  /* ── Cards ── */
  .glass {
    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .glass:hover { border-color: var(--border2); }

  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: var(--transition);
  }
  .card-hover:hover {
    border-color: var(--border2);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  /* ── Stat Cards ── */
  .stat-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: var(--transition);
    cursor: default;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 60%, rgba(212,168,83,0.03) 100%);
    pointer-events: none;
  }
  .stat-card:hover {
    border-color: rgba(212,168,83,0.25);
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }

  /* ── Inputs ── */
  .input {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    width: 100%;
    outline: none;
    transition: var(--transition);
  }
  .input:focus   { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow); }
  .input::placeholder { color: var(--text3); }

  /* ── Buttons ── */
  .btn-primary {
    background: linear-gradient(135deg, var(--gold) 0%, #B8902E 100%);
    color: #0D0A00;
    border: none;
    border-radius: var(--radius-sm);
    padding: 12px 24px;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .btn-primary:hover  { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(212,168,83,0.35); filter: brightness(1.1); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    background: transparent;
    color: var(--text2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 14px;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
  }
  .btn-ghost:hover { border-color: var(--border2); color: var(--text); background: rgba(255,255,255,0.04); }

  .btn-icon {
    background: transparent;
    color: var(--text3);
    border: 1px solid var(--border);
    border-radius: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    cursor: pointer;
    transition: var(--transition);
    flex-shrink: 0;
  }
  .btn-icon:hover     { border-color: var(--border2); color: var(--text); background: rgba(255,255,255,0.06); }
  .btn-icon.danger:hover { border-color: rgba(248,113,113,0.4); color: var(--red); background: rgba(248,113,113,0.08); }

  /* ── Nav Item ── */
  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text3);
    cursor: pointer;
    transition: var(--transition);
    border: 1px solid transparent;
    position: relative;
  }
  .nav-item:hover { color: var(--text2); background: rgba(255,255,255,0.04); }
  .nav-item.active {
    color: var(--text);
    background: rgba(212,168,83,0.08);
    border-color: rgba(212,168,83,0.2);
  }
  .nav-item.active .nav-icon-wrap { color: var(--gold); }
  .nav-item .nav-badge {
    margin-left: auto;
    background: var(--gold);
    color: #0D0A00;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 20px;
    min-width: 18px;
    text-align: center;
  }

  /* ── Tags / Badges ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  .badge-gold  { background: rgba(212,168,83,0.12); color: var(--gold2); border: 1px solid rgba(212,168,83,0.2); }
  .badge-green { background: rgba(52,211,153,0.1); color: var(--green); border: 1px solid rgba(52,211,153,0.2); }
  .badge-red   { background: rgba(248,113,113,0.1); color: var(--red); border: 1px solid rgba(248,113,113,0.2); }
  .badge-blue  { background: rgba(91,141,239,0.1); color: var(--blue); border: 1px solid rgba(91,141,239,0.2); }
  .badge-level { background: rgba(167,139,250,0.1); color: #A78BFA; border: 1px solid rgba(167,139,250,0.2); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }

  /* ── Progress Bar ── */
  .progress { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1); }

  /* ── Table rows ── */
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
    transition: var(--transition);
  }
  .row:last-child { border-bottom: none; padding-bottom: 0; }
  .row:hover { background: transparent; }

  /* ── Responsive amount + category hide ── */
  .amount-display { min-width: 80px; text-align: right; font-family: var(--font-mono); font-size: 14px; font-weight: 600; }
  .cat-badge-hide {}
  @media(max-width:768px) {
    .cat-badge-hide { display: none !important; }
    .amount-display { min-width: 60px !important; font-size: 13px !important; }
    .row { gap: 8px !important; padding: 10px 0 !important; }
    .filter-row { flex-wrap: wrap !important; gap: 8px !important; }
    .filter-row select, .filter-row input { width: 100% !important; min-width: unset !important; }
    .insight-grid { grid-template-columns: 1fr !important; }
    .budget-cols  { grid-template-columns: 1fr !important; }
    .chart-height { height: 200px !important; }
  }

  /* ── Responsive helpers ── */
  .desktop-only-btn {}
  @media(max-width:768px){ .desktop-only-btn { display:none !important; } }

  /* ── Section title ── */
  .section-title {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  /* ── Divider ── */
  .divider { height: 1px; background: var(--border); width: 100%; }

  /* ── Tooltip ── */
  .recharts-tooltip-wrapper { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5)); }

  /* ── Layout Grids ── */
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  @media(max-width:1100px){ .grid-4{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:900px){  .grid-2{ grid-template-columns:1fr; } .grid-3{ grid-template-columns:1fr 1fr; } }

  /* ══════════════════════════════════════
     RESPONSIVE — MOBILE FIRST
  ══════════════════════════════════════ */

  /* Desktop: show sidebar, hide mobile elements */
  .sidebar-desktop   { display: flex; }
  .mobile-topbar     { display: none; }
  .mobile-bottom-nav { display: none; }
  .desktop-only-topbar { display: flex; }

  /* ── Mobile breakpoint 768px ── */
  @media(max-width:768px){
    /* Layout */
    .sidebar-desktop      { display: none !important; }
    .mobile-topbar        { display: flex !important; }
    .mobile-bottom-nav    { display: flex !important; }
    .desktop-only-topbar  { display: none !important; }
    .desktop-only-btn     { display: none !important; }
    .main-scroll          { padding-bottom: 76px !important; height: calc(100vh - 56px) !important; }
    .main-content-area    { padding: 16px 14px 0 !important; }

    /* Grids collapse */
    .grid-4  { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
    .grid-2  { grid-template-columns: 1fr !important; gap: 14px !important; }
    .grid-3  { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }

    /* Cards */
    .card        { border-radius: 14px !important; }
    .stat-card   { padding: 14px 14px 16px !important; border-radius: 14px !important; }

    /* Typography */
    .section-title { font-size: 19px !important; }

    /* Rows — tighter on mobile */
    .row { gap: 10px !important; padding: 11px 0 !important; }

    /* Category badge: hide on small screens to give space */
    .cat-badge-hide { display: none !important; }

    /* Amount column narrower */
    .amount-display { min-width: 64px !important; font-size: 13px !important; }

    /* Filter row stacks vertically */
    .filter-row { flex-direction: column !important; gap: 8px !important; }
    .filter-row select { width: 100% !important; min-width: unset !important; }

    /* Toast moves above bottom nav */
    .toast { bottom: 76px !important; right: 14px !important; left: 14px !important; max-width: 100% !important; }

    /* Insight cards tighter */
    .insight-card { padding: 14px 14px !important; gap: 12px !important; }

    /* Quick chips smaller */
    .quick-chip { font-size: 11px !important; padding: 6px 10px !important; }
  }

  /* Very small phones */
  @media(max-width:380px){
    .grid-4 { grid-template-columns: 1fr 1fr !important; }
    .stat-card { padding: 12px !important; }
    .main-content-area { padding: 12px 10px 0 !important; }
  }

  /* ── Mobile Top Bar ── */
  .mobile-topbar {
    position: sticky;
    top: 0;
    z-index: 150;
    background: rgba(8,11,20,0.96);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    padding: 0 16px;
    height: 56px;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  /* ── Mobile Bottom Nav ── */
  .mobile-bottom-nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 64px;
    background: rgba(13,17,32,0.98);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-top: 1px solid rgba(255,255,255,0.07);
    justify-content: space-around;
    align-items: center;
    z-index: 200;
    padding: 0 6px;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  /* ── Mobile Nav Item ── */
  .mob-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex: 1;
    height: 56px;
    cursor: pointer;
    border-radius: 12px;
    transition: var(--transition);
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }
  .mob-nav-item:active { transform: scale(0.92); }
  @media(max-width:768px){ .mobile-page-heading { display:block !important; } }
  .mob-nav-item.active { background: rgba(212,168,83,0.1); }
  .mob-nav-item.active .mob-icon-wrap {
    background: rgba(212,168,83,0.15);
    border: 1px solid rgba(212,168,83,0.25);
  }
  .mob-icon-wrap {
    width: 34px; height: 34px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px;
    background: transparent;
    border: 1px solid transparent;
    transition: var(--transition);
  }
  .mob-nav-item .mob-label {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.2px;
    text-transform: uppercase;
    transition: color 0.2s;
  }

  /* ── Mobile stat card compact ── */
  .mob-stat-val {
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.1;
  }
  .mob-stat-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text3);
  }

  /* ── Toast ── */
  .toast {
    position: fixed;
    bottom: 28px;
    right: 28px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    border-radius: var(--radius-sm);
    font-size: 13.5px;
    font-weight: 500;
    z-index: 9999;
    animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    backdrop-filter: blur(20px);
    max-width: 320px;
  }
  .toast-success { background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3); color: var(--green); }
  .toast-error   { background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.3); color: var(--red); }

  /* ── Insight card ── */
  .insight-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
  }
  .insight-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
  }
  .insight-card:hover { border-color: var(--border2); transform: translateX(2px); }

  /* ── Auth specific ── */
  .auth-tab { flex:1; padding:10px; border:none; border-radius:8px; font-family:var(--font); font-size:14px; font-weight:600; cursor:pointer; transition:var(--transition); }
  @media(max-width:768px){
    .auth-tab { font-size:13px; padding:9px; }
  }

  /* ── Floating label hint ── */
  .label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    display: block;
    margin-bottom: 8px;
  }

  /* ── Sidebar separator ── */
  .sidebar-sep { height: 1px; background: var(--border); margin: 8px 0; }

  /* ── Category pill ── */
  .cat-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    flex-shrink: 0;
  }

  /* ── Amount display ── */
  .amount-display {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -0.3px;
  }

  /* ── Quick add chips ── */
  @media(max-width:768px){
    .quick-chip { font-size:11px !important; padding:5px 10px !important; }
  }
  .quick-chip {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 14px;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    color: var(--text2);
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .quick-chip:hover { border-color: rgba(212,168,83,0.3); color: var(--gold2); background: rgba(212,168,83,0.05); transform: translateY(-1px); }

  /* ── Alert banners ── */
  .alert { border-radius: var(--radius-sm); padding: 14px 18px; display: flex; align-items: flex-start; gap: 12px; }
  .alert-red    { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); }
  .alert-amber  { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); }
  .alert-green  { background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); }
  .alert-blue   { background: rgba(91,141,239,0.08); border: 1px solid rgba(91,141,239,0.2); }

  /* ── Empty state ── */
  .empty-state { text-align: center; padding: 60px 20px; color: var(--text3); }
  .empty-state .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
  .empty-state p { font-size: 14px; }

  /* ── Spinner ── */
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.1); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
`;

// ─────────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", fontFamily:"DM Sans,sans-serif" }}>
      {label && <div style={{ fontSize:11, color:"#64748B", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</div>}
      {payload.map((p,i) => (
        <div key={i} style={{ fontSize:14, fontWeight:600, color:"#F0C56A", fontFamily:"JetBrains Mono,monospace" }}>{fmt(p.value)}</div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", fontFamily:"DM Sans,sans-serif" }}>
      <div style={{ fontSize:12, color:"#94A3B8", marginBottom:4 }}>{d.name}</div>
      <div style={{ fontSize:14, fontWeight:600, color:COLORS[d.name]||"#fff", fontFamily:"JetBrains Mono,monospace" }}>{fmt(d.value)}</div>
      <div style={{ fontSize:11, color:"#64748B" }}>{(d.percent*100).toFixed(1)}%</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth, busy, err }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [name,  setName]  = useState("");

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font)", position:"relative", overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Background orbs */}
      <div style={{ position:"absolute", top:"10%", left:"15%", width:500, height:500, background:"radial-gradient(circle,rgba(212,168,83,0.06) 0%,transparent 65%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"10%", right:"15%", width:400, height:400, background:"radial-gradient(circle,rgba(91,141,239,0.05) 0%,transparent 65%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:800, height:800, background:"radial-gradient(circle,rgba(212,168,83,0.02) 0%,transparent 60%)", pointerEvents:"none" }} />

      {/* Grid overlay */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }} />

      <div style={{ width:"min(420px, 92vw)", position:"relative", zIndex:1, animation:"fadeUp 0.6s ease forwards" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <div style={{ width:56, height:56, background:"linear-gradient(135deg,var(--gold),#B8902E)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 16px", boxShadow:"0 8px 32px rgba(212,168,83,0.3)" }}>💰</div>
          <h1 style={{ fontFamily:"var(--font-display)", fontSize:32, fontWeight:600, color:"var(--text)", letterSpacing:"-0.5px", marginBottom:8 }}>SpendSmart</h1>
          <p style={{ color:"var(--text3)", fontSize:14 }}>Your intelligent finance companion</p>
        </div>

        <div className="card" style={{ padding:32 }}>
          {/* Tabs */}
          <div style={{ display:"flex", gap:4, marginBottom:28, background:"var(--bg3)", padding:4, borderRadius:10 }}>
            {["login","signup"].map(m => (
              <button key={m} className="auth-tab" onClick={() => setMode(m)}
                style={{ background:mode===m?"var(--bg2)":"transparent", color:mode===m?"var(--text)":"var(--text3)", border:mode===m?"1px solid var(--border2)":"1px solid transparent" }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode === "signup" && (
              <div style={{ animation:"fadeUp 0.3s ease forwards" }}>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onAuth({mode,email,password:pass,name})} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Minimum 6 characters" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onAuth({mode,email,password:pass,name})} />
            </div>

            {err && (
              <div className="alert alert-red" style={{ borderRadius:8, padding:"10px 14px" }}>
                <span style={{ fontSize:13, color:"var(--red)" }}>⚠ {err}</span>
              </div>
            )}

            <button className="btn-primary" style={{ width:"100%", justifyContent:"center", marginTop:4, padding:"13px" }}
              onClick={() => onAuth({mode,email,password:pass,name})} disabled={busy}>
              {busy ? <span className="spinner"/> : mode==="login" ? "Sign In →" : "Create Account →"}
            </button>

            <div style={{ position:"relative", textAlign:"center", padding:"4px 0" }}>
              <div className="divider" />
              <span style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:"var(--bg2)", padding:"0 12px", fontSize:12, color:"var(--text3)" }}>or</span>
            </div>

            <button className="btn-ghost" style={{ width:"100%", justifyContent:"center", padding:"12px", display:"flex", alignItems:"center", gap:10 }}
              onClick={() => onAuth({mode:"google"})} disabled={busy}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
        <p style={{ textAlign:"center", marginTop:20, color:"var(--text3)", fontSize:12 }}>🔒 Secured with Firebase Authentication</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SIDEBAR NAV ICON COMPONENTS
// ─────────────────────────────────────────────────────────────────
const NavIcon = ({ id }) => {
  const icons = {
    dashboard: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
    add:       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>,
    expenses:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
    charts:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
    insights:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
    budget:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  };
  return <span className="nav-icon-wrap" style={{ color:"currentColor", display:"flex", alignItems:"center" }}>{icons[id]}</span>;
};

// ─────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────
export default function App() {
  const [fbReady, setFbReady]   = useState(false);
  const [user,    setUser]      = useState(null);
  const [authBusy,setAuthBusy]  = useState(false);
  const [authErr, setAuthErr]   = useState("");
  const [demoMode,setDemoMode]  = useState(!isReal);

  const [expenses,    setExpenses]    = useState(demoMode ? DEMO : []);
  const [budget,      setBudget]      = useState(25000);
  const [budgetInput, setBudgetInput] = useState("25000");
  const [dbBusy,      setDbBusy]      = useState(false);

  const [tab,       setTab]       = useState("dashboard");
  const [form,      setForm]      = useState({ amount:"", category:"Food", date:new Date().toISOString().split("T")[0], description:"" });
  const [editId,    setEditId]    = useState(null);
  const [toast,     setToast]     = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [sortBy,    setSortBy]    = useState("date");
  const [showHelp,  setShowHelp]  = useState(false);
  const [animKey,   setAnimKey]   = useState(0);
  const contentRef = useRef(null);

  const pop = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  // Tab change animation
  const changeTab = (t) => { setTab(t); setAnimKey(k=>k+1); if(contentRef.current) contentRef.current.scrollTop=0; };

  useEffect(() => {
    if (!isReal) return;
    loadFirebase().then(() => {
      setFbReady(true);
      authMod.onAuthStateChanged(firebaseAuth, u => { setUser(u); if (!u) setExpenses([]); });
    }).catch(() => setDemoMode(true));
  }, []);

  useEffect(() => {
    if (!user || !firebaseDb || demoMode) return;
    setDbBusy(true);
    const ref = storeMod.collection(firebaseDb,"users",user.uid,"expenses");
    const q   = storeMod.query(ref, storeMod.orderBy("date","desc"));
    const unsub = storeMod.onSnapshot(q, snap => {
      setExpenses(snap.docs.map(d=>({id:d.id,...d.data()})));
      setDbBusy(false);
    }, ()=>setDbBusy(false));
    storeMod.getDoc(storeMod.doc(firebaseDb,"users",user.uid)).then(d => {
      if (d.exists() && d.data().budget) { const b=d.data().budget; setBudget(b); setBudgetInput(String(b)); }
    });
    return ()=>unsub();
  }, [user, demoMode]);

  const handleAuth = async ({mode,email,password,name}) => {
    setAuthErr(""); setAuthBusy(true);
    try {
      await loadFirebase();
      if (mode==="google") await authMod.signInWithPopup(firebaseAuth, new authMod.GoogleAuthProvider());
      else if (mode==="signup") { const c=await authMod.createUserWithEmailAndPassword(firebaseAuth,email,password); if(name)await authMod.updateProfile(c.user,{displayName:name}); }
      else await authMod.signInWithEmailAndPassword(firebaseAuth,email,password);
    } catch(e) {
      const M={"auth/email-already-in-use":"Email already registered.","auth/wrong-password":"Incorrect password.","auth/user-not-found":"No account found.","auth/weak-password":"Password needs 6+ chars.","auth/invalid-email":"Invalid email.","auth/popup-closed-by-user":"Sign-in cancelled."};
      setAuthErr(M[e.code]||e.message);
    } finally { setAuthBusy(false); }
  };

  const handleLogout = async () => { await authMod.signOut(firebaseAuth); setExpenses([]); pop("Signed out successfully","error"); };

  const handleSave = async () => {
    if (!form.amount || isNaN(form.amount) || Number(form.amount)<=0) { pop("Please enter a valid amount","error"); return; }
    const entry = { amount:Number(form.amount), category:form.category, date:form.date, description:form.description, createdAt:new Date().toISOString() };
    if (demoMode) {
      setExpenses(prev => editId ? prev.map(e=>e.id===editId?{...entry,id:editId}:e) : [{...entry,id:"d"+Date.now()},...prev]);
      pop(editId?"Expense updated":"Expense added successfully");
    } else {
      try {
        if (editId) { await storeMod.updateDoc(storeMod.doc(firebaseDb,"users",user.uid,"expenses",editId),entry); pop("Updated & synced to Firebase ☁️"); }
        else { await storeMod.addDoc(storeMod.collection(firebaseDb,"users",user.uid,"expenses"),entry); pop("Saved to Firebase ☁️"); }
      } catch(e) { pop("Firebase error: "+e.message,"error"); return; }
    }
    setEditId(null);
    setForm({amount:"",category:"Food",date:new Date().toISOString().split("T")[0],description:""});
    changeTab("expenses");
  };

  const handleDelete = async id => {
    if (demoMode) setExpenses(prev=>prev.filter(e=>e.id!==id));
    else { try { await storeMod.deleteDoc(storeMod.doc(firebaseDb,"users",user.uid,"expenses",id)); } catch(e){ pop("Delete failed","error"); return; } }
    pop("Expense removed","error");
  };

  const handleEdit = e => { setForm({amount:String(e.amount),category:e.category,date:e.date,description:e.description}); setEditId(e.id); changeTab("add"); };

  const handleQuick = async (desc,amount,category) => {
    const entry={amount,category,description:desc,date:new Date().toISOString().split("T")[0],createdAt:new Date().toISOString()};
    if (demoMode) setExpenses(prev=>[{...entry,id:"d"+Date.now()},...prev]);
    else { try{await storeMod.addDoc(storeMod.collection(firebaseDb,"users",user.uid,"expenses"),entry);}catch(e){pop("Failed","error");return;} }
    pop(`${desc} added`);
  };

  const saveBudget = async val => {
    setBudget(val);
    if (!demoMode&&user) { try{await storeMod.setDoc(storeMod.doc(firebaseDb,"users",user.uid),{budget:val},{merge:true}); pop("Budget saved to Firebase ☁️");}catch(e){pop("Save failed","error");} }
    else pop("Budget updated");
  };

  // Computed
  const total    = useMemo(()=>expenses.reduce((s,e)=>s+Number(e.amount),0),[expenses]);
  const avgDay   = useMemo(()=>{ const d=new Set(expenses.map(e=>e.date)).size||1; return Math.round(total/d); },[expenses,total]);
  const catTots  = useMemo(()=>{ const m={}; expenses.forEach(e=>{m[e.category]=(m[e.category]||0)+Number(e.amount);}); return m; },[expenses]);
  const topCat   = useMemo(()=>{ const e=Object.entries(catTots); return e.length?e.sort((a,b)=>b[1]-a[1])[0][0]:"—"; },[catTots]);
  const pieData  = useMemo(()=>Object.entries(catTots).map(([name,value])=>({name,value})),[catTots]);
  const barData  = useMemo(()=>{ const m={}; expenses.forEach(e=>{const d=e.date.slice(5); m[d]=(m[d]||0)+Number(e.amount);}); return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0])).slice(-14).map(([date,amount])=>({date,amount})); },[expenses]);
  const budgetPct   = Math.min(100,budget?Math.round(total/budget*100):0);
  const budgetColor = budgetPct>85?"var(--red)":budgetPct>60?"var(--gold)":"var(--green)";

  const insights = useMemo(()=>{
    if(!expenses.length) return [{icon:"👋",text:"Add your first expense to unlock personalised insights.",color:"var(--blue)"}];
    const ins=[];
    const foodPct=total?(catTots["Food"]||0)/total*100:0;
    if(foodPct>35) ins.push({icon:"🍜",text:`Food & dining represents ${Math.round(foodPct)}% of your spending. Meal prepping could save you ~${fmt(Math.round((catTots["Food"]||0)*0.3))} this month.`,color:COLORS["Food"]});
    const bp=budget?total/budget*100:0;
    if(bp>85) ins.push({icon:"🚨",text:`You have only ${fmt(Math.max(0,budget-total))} left this month (${Math.round(bp)}% used). Consider reducing discretionary spend.`,color:"var(--red)"});
    else if(bp>60) ins.push({icon:"⚠️",text:`${Math.round(bp)}% of your monthly budget is spent. Track the remaining days carefully.`,color:"var(--gold)"});
    const shopPct=total?(catTots["Shopping"]||0)/total*100:0;
    if(shopPct>25) ins.push({icon:"🛍️",text:`Shopping is ${Math.round(shopPct)}% of expenses. Review recent purchases for items you could avoid.`,color:COLORS["Shopping"]});
    const travPct=total?(catTots["Travel"]||0)/total*100:0;
    if(travPct>20) ins.push({icon:"✈️",text:`Travel costs are ${Math.round(travPct)}% of your budget. Consider public transport or carpooling alternatives.`,color:COLORS["Travel"]});
    if(expenses.length>=5) ins.push({icon:"🏆",text:`Excellent tracking habit! You've logged ${expenses.length} transactions. Awareness is the foundation of financial freedom.`,color:"var(--green)"});
    if(topCat!=="—") ins.push({icon:ICONS[topCat]||"📦",text:`${topCat} is your biggest spending category at ${fmt(catTots[topCat]||0)} this month.`,color:COLORS[topCat]||"var(--text2)"});
    return ins;
  },[expenses,catTots,total,budget,topCat]);

  const filtered = useMemo(()=>{
    let list=filterCat==="All"?[...expenses]:expenses.filter(e=>e.category===filterCat);
    return list.sort((a,b)=>sortBy==="amount"?b.amount-a.amount:b.date.localeCompare(a.date));
  },[expenses,filterCat,sortBy]);

  const NAV = [
    {id:"dashboard",label:"Overview"},
    {id:"add",      label:"Add Expense"},
    {id:"expenses", label:"Transactions", badge: expenses.length > 0 ? expenses.length : null},
    {id:"charts",   label:"Analytics"},
    {id:"insights", label:"Insights",    badge: insights.length > 0 ? insights.length : null},
    {id:"budget",   label:"Budget"},
  ];

  if (isReal && fbReady && !user) return <AuthScreen onAuth={handleAuth} busy={authBusy} err={authErr}/>;
  if (isReal && !fbReady && !demoMode) return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{width:48,height:48,background:"linear-gradient(135deg,var(--gold),#B8902E)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>💰</div>
      <div className="spinner" style={{width:24,height:24}}/>
      <p style={{color:"var(--text3)",fontSize:13}}>Connecting to Firebase…</p>
    </div>
  );

  const userName = user?.displayName?.split(" ")[0] || (demoMode?"Guest":user?.email?.split("@")[0]);
  const now = new Date(); const monthName = now.toLocaleString("default",{month:"long"});
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const chartH = isMobile ? 180 : 220;

  return (
    <div style={{height:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"var(--font)",display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
      <style>{GLOBAL_CSS}</style>

      {/* ═══════════ SIDEBAR ═══════════ */}
      {/* ═══════════ MOBILE TOP BAR ═══════════ */}
      {/* ═══════════ MOBILE TOP BAR ═══════════ */}
      <div className="mobile-topbar">
        {/* Left: Logo + name */}
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,var(--gold),#B8902E)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,boxShadow:"0 2px 8px rgba(212,168,83,0.3)"}}>💰</div>
          <div>
            <div style={{fontFamily:"var(--font-display)",fontSize:15,fontWeight:700,color:"var(--text)",letterSpacing:"-0.2px",lineHeight:1.1}}>SpendSmart</div>
            <div style={{fontSize:9,color:"var(--text3)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{monthName} {now.getFullYear()}</div>
          </div>
        </div>

        {/* Right: status + actions */}
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          {/* Budget warning pill */}
          {budgetPct>85 && (
            <div onClick={()=>changeTab("budget")} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:20,padding:"4px 9px",cursor:"pointer"}}>
              <span style={{fontSize:11}}>⚠️</span>
              <span style={{fontSize:10,fontWeight:700,color:"var(--red)"}}>{budgetPct}%</span>
            </div>
          )}
          {/* Live/Demo badge */}
          <div style={{background:demoMode?"rgba(251,191,36,0.1)":"rgba(52,211,153,0.1)",border:`1px solid ${demoMode?"rgba(251,191,36,0.2)":"rgba(52,211,153,0.2)"}`,borderRadius:20,padding:"4px 9px"}}>
            <span style={{fontSize:9,fontWeight:700,color:demoMode?"var(--gold)":"var(--green)",textTransform:"uppercase",letterSpacing:"0.5px"}}>{demoMode?"Demo":"● Live"}</span>
          </div>
          {/* Add FAB button */}
          <button onClick={()=>changeTab("add")} style={{width:34,height:34,background:"linear-gradient(135deg,var(--gold),#B8902E)",border:"none",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,boxShadow:"0 2px 8px rgba(212,168,83,0.3)",fontSize:18,fontWeight:700,color:"#0D0A00"}}>+</button>
        </div>
      </div>


      {/* Inner row: sidebar + main content */}
      <div style={{display:"flex",flexDirection:"row",flex:1,overflow:"hidden",minHeight:0}}>
      <aside className="sidebar-desktop" style={{width:232,background:"var(--bg2)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",flexShrink:0,height:"100vh",overflow:"hidden"}}>
        {/* Logo */}
        <div style={{padding:"24px 20px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24}}>
            <div style={{width:34,height:34,background:"linear-gradient(135deg,var(--gold),#B8902E)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,boxShadow:"0 4px 12px rgba(212,168,83,0.3)"}}>💰</div>
            <div>
              <div style={{fontFamily:"var(--font-display)",fontSize:16,fontWeight:600,letterSpacing:"-0.3px",color:"var(--text)"}}>SpendSmart</div>
              <div style={{fontSize:10,color:"var(--text3)",letterSpacing:"0.3px",textTransform:"uppercase"}}>Finance</div>
            </div>
            <span className="badge" style={{marginLeft:"auto",padding:"2px 7px",fontSize:9,background:demoMode?"rgba(251,191,36,0.1)":"rgba(52,211,153,0.1)",color:demoMode?"var(--gold)":"var(--green)",border:`1px solid ${demoMode?"rgba(251,191,36,0.2)":"rgba(52,211,153,0.2)"}`,borderRadius:20,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",whiteSpace:"nowrap"}}>
              {demoMode?"Demo":"● Live"}
            </span>
          </div>

          {/* Month display */}
          <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",marginBottom:8}}>
            <div style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>Current Period</div>
            <div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{monthName} {now.getFullYear()}</div>
          </div>
        </div>

        <div className="sidebar-sep" style={{marginTop:0}}/>

        {/* Nav */}
        <nav style={{padding:"12px 12px",flex:1,display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          <div style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.7px",padding:"4px 12px 8px",fontWeight:600}}>Navigation</div>
          {NAV.map(n=>(
            <div key={n.id} className={`nav-item${tab===n.id?" active":""}`} onClick={()=>changeTab(n.id)}>
              <NavIcon id={n.id}/>
              <span>{n.label}</span>
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-sep"/>

        {/* Budget widget */}
        <div style={{padding:"14px 16px"}}>
          <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:14,cursor:"pointer"}} onClick={()=>changeTab("budget")}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:11,color:"var(--text3)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>Monthly Budget</span>
              <span style={{fontSize:11,color:budgetColor,fontWeight:700,fontFamily:"var(--font-mono)"}}>{budgetPct}%</span>
            </div>
            <div style={{fontSize:15,fontWeight:700,color:budgetColor,fontFamily:"var(--font-mono)",marginBottom:2}}>{fmt(total)}</div>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:10}}>of {fmt(budget)}</div>
            <div className="progress">
              <div className="progress-fill" style={{width:`${budgetPct}%`,background:budgetColor}}/>
            </div>
          </div>
        </div>

        {/* User */}
        {user && (
          <div style={{padding:"0 16px 20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10}}>
              <div style={{width:30,height:30,background:"linear-gradient(135deg,var(--gold),#B8902E)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#0D0A00",flexShrink:0}}>
                {userName?.[0]?.toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userName}</div>
                <div style={{fontSize:10,color:"var(--text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
              </div>
              <button onClick={handleLogout} title="Sign out" style={{background:"transparent",border:"none",color:"var(--text3)",cursor:"pointer",padding:4,borderRadius:6,fontSize:14,transition:"color 0.2s"}}
                onMouseOver={e=>e.target.style.color="var(--red)"} onMouseOut={e=>e.target.style.color="var(--text3)"}>↩</button>
            </div>
          </div>
        )}
      </aside>


      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main ref={contentRef} className="main-scroll" style={{flex:1,overflowY:"auto",height:"100%",background:"var(--bg)",minWidth:0}}>
        {/* Top bar */}
        <div className="topbar-inner desktop-only-topbar" style={{position:"sticky",top:0,zIndex:100,background:"rgba(8,11,20,0.85)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--border)",padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <h2 style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:600,color:"var(--text)",letterSpacing:"-0.3px"}}>
              {tab==="dashboard"?"Financial Overview":tab==="add"?editId?"Edit Transaction":"Add Transaction":tab==="expenses"?"Transactions":tab==="charts"?"Analytics":tab==="insights"?"Smart Insights":"Budget Manager"}
            </h2>
            <p style={{fontSize:12,color:"var(--text3)",marginTop:1}}>{monthName} {now.getFullYear()} · {expenses.length} transactions · {fmt(total)} total</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {dbBusy && <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--text3)"}}><div className="spinner" style={{width:14,height:14}}/> Syncing…</div>}
            {budgetPct>85 && (
              <div className="badge badge-red" style={{animation:"pulse 2s infinite",cursor:"pointer"}} onClick={()=>changeTab("budget")}>⚠ Budget {budgetPct}%</div>
            )}
            {demoMode && <div className="badge badge-gold">⚡ Demo Mode</div>}
            {!demoMode && user && <div className="badge badge-green">🔥 Firebase Live</div>}
            <button className="btn-primary desktop-only-btn" onClick={()=>changeTab("add")} style={{padding:"8px 16px",fontSize:13}}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Add Expense
            </button>
          </div>
        </div>

        <div style={{padding:"clamp(14px, 3vw, 28px) clamp(14px, 3vw, 32px)"}} key={animKey} className="animate-fadeup main-content-area" data-tab={tab}>

          {/* ─── Mobile page heading ─── */}
          <div style={{display:"none"}} className="mobile-page-heading">
            <div style={{marginBottom:16,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>
              <h2 style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:700,color:"var(--text)",letterSpacing:"-0.3px",margin:0}}>
                {tab==="dashboard"?"Financial Overview":tab==="add"?editId?"Edit Transaction":"Add Expense":tab==="expenses"?"My Transactions":tab==="charts"?"Analytics":tab==="insights"?"Smart Insights":"Budget Manager"}
              </h2>
              <p style={{fontSize:11,color:"var(--text3)",marginTop:3}}>{expenses.length} transactions · {fmt(total)} total</p>
            </div>
          </div>

          {/* ─── Demo banner ─── */}
          {demoMode && tab==="dashboard" && (
            <div className="alert alert-blue" style={{marginBottom:24,borderRadius:12}}>
              <span style={{fontSize:18,marginTop:1}}>🔥</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--blue)",marginBottom:3}}>Running in Demo Mode</div>
                <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.6}}>
                  Data resets on refresh. Replace <code style={{color:"var(--gold)",fontSize:11,background:"rgba(0,0,0,0.3)",padding:"1px 5px",borderRadius:4}}>FIREBASE_CONFIG</code> at the top of the file to enable persistent cloud storage, auth, and real-time sync.
                </div>
              </div>
              <button className="btn-ghost" style={{fontSize:11,padding:"6px 12px",whiteSpace:"nowrap"}} onClick={()=>setShowHelp(h=>!h)}>
                {showHelp?"Hide":"Setup Guide"}
              </button>
            </div>
          )}
          {showHelp && demoMode && tab==="dashboard" && (
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:20,marginBottom:24,fontSize:13,color:"var(--text2)",lineHeight:2,animation:"fadeUp 0.3s ease forwards"}}>
              <div style={{fontWeight:600,color:"var(--text)",marginBottom:8}}>Firebase Setup (5 minutes, free tier):</div>
              <div>1. Go to <span style={{color:"var(--blue)"}}>console.firebase.google.com</span> → Create project → Add Web app</div>
              <div>2. Enable <strong>Authentication</strong> → Email/Password + Google providers</div>
              <div>3. Enable <strong>Firestore Database</strong> → Start in test mode</div>
              <div>4. Copy your config object → paste into <code style={{color:"var(--gold)"}}>FIREBASE_CONFIG</code></div>
              <div>5. Set Firestore rules: <code style={{color:"var(--green)"}}>allow read, write: if request.auth != null;</code></div>
            </div>
          )}

          {/* Budget critical alert */}
          {budgetPct > 85 && (
            <div className="alert alert-red" style={{marginBottom:24,borderRadius:12}}>
              <span style={{fontSize:20}}>🚨</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"var(--red)"}}>Critical Budget Alert — {budgetPct}% Spent</div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Only {fmt(Math.max(0,budget-total))} remaining. Reduce discretionary spending immediately.</div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              DASHBOARD
          ══════════════════════════════════════════════ */}
          {tab==="dashboard" && (<>
            {/* Stats */}
            <div className="grid-4" style={{marginBottom:24}}>
              {[
                {label:"Total Spent",      val:fmt(total),      icon:"💸",  accent:"var(--gold)",   sub:`${expenses.length} transactions`},
                {label:"Daily Average",    val:fmt(avgDay),     icon:"📅",  accent:"var(--blue)",   sub:"Per active day"},
                {label:"Top Category",     val:topCat,          icon:topCat!=="—"?ICONS[topCat]:"—", accent:topCat!=="—"?COLORS[topCat]:"var(--text3)", sub:topCat!=="—"?fmt(catTots[topCat]||0):"No data"},
                {label:"Budget Remaining", val:fmt(Math.max(0,budget-total)), icon:"💳", accent:budgetColor, sub:`${100-budgetPct}% left`},
              ].map((s,i)=>(
                <div key={i} className="stat-card" style={{animationDelay:`${i*80}ms`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <span style={{fontSize:9,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.6px",lineHeight:1.3}}>{s.label}</span>
                    <div style={{width:30,height:30,background:`${s.accent}15`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                      {s.icon}
                    </div>
                  </div>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:"clamp(16px,4vw,23px)",fontWeight:700,color:s.accent,letterSpacing:"-0.5px",marginBottom:4,lineHeight:1}}>{s.val}</div>
                  <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{s.sub}</div>
                  {/* Accent bar */}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${s.accent}50,transparent)`,borderRadius:"0 0 14px 14px"}}/>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid-2" style={{marginBottom:24}}>
              {/* Area chart */}
              <div className="card" style={{padding:"clamp(14px,3vw,22px) clamp(14px,3vw,20px)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:2}}>Spending Trend</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>Daily expense history</div>
                  </div>
                  <span className="badge badge-level">Analytics</span>
                </div>
                {barData.length===0
                  ? <div className="empty-state"><div className="empty-icon">📈</div><p>Add expenses to see trends</p></div>
                  : <ResponsiveContainer width="100%" height={chartH}>
                      <AreaChart data={barData}>
                        <defs>
                          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4A853" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#D4A853" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="date" tick={{fill:"#475569",fontSize:9}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fill:"#475569",fontSize:9}} axisLine={false} tickLine={false} width={50}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Area type="monotone" dataKey="amount" stroke="#D4A853" strokeWidth={2} fill="url(#goldGrad)" dot={false} activeDot={{r:4,fill:"#D4A853",stroke:"var(--bg)",strokeWidth:2}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                }
              </div>

              {/* Pie chart */}
              <div className="card" style={{padding:"clamp(14px,3vw,22px) clamp(14px,3vw,20px)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:2}}>By Category</div>
                    <div style={{fontSize:11,color:"var(--text3)"}}>Spending distribution</div>
                  </div>
                  <span className="badge badge-level">Breakdown</span>
                </div>
                {pieData.length===0
                  ? <div className="empty-state"><div className="empty-icon">🥧</div><p>No data yet</p></div>
                  : <>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={2} dataKey="value" strokeWidth={0}>
                            {pieData.map((e,i)=><Cell key={i} fill={COLORS[e.name]||"#888"}/>)}
                          </Pie>
                          <Tooltip content={<PieTooltip/>}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"6px 12px",marginTop:8}}>
                        {pieData.map(d=>(
                          <div key={d.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--text3)"}}>
                            <span style={{width:7,height:7,borderRadius:"50%",background:COLORS[d.name],display:"inline-block",flexShrink:0}}/>
                            {d.name}
                          </div>
                        ))}
                      </div>
                    </>
                }
              </div>
            </div>

            {/* Recent transactions */}
            <div className="card" style={{padding:"22px 24px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:2}}>Recent Transactions</div>
                  <div style={{fontSize:11,color:"var(--text3)"}}>Latest {Math.min(6,expenses.length)} of {expenses.length}</div>
                </div>
                {expenses.length>6 && <button className="btn-ghost" style={{fontSize:12}} onClick={()=>changeTab("expenses")}>View all →</button>}
              </div>
              {expenses.length===0
                ? <div className="empty-state"><div className="empty-icon">💳</div><p>No transactions yet. Add your first expense!</p></div>
                : expenses.slice(0,6).map((e,i)=>(
                    <div key={e.id} className="row" style={{animationDelay:`${i*50}ms`}}>
                      <div style={{width:38,height:38,background:`${COLORS[e.category]}15`,border:`1px solid ${COLORS[e.category]}25`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{ICONS[e.category]}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13.5,fontWeight:500,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.description||e.category}</div>
                        <div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>{e.date}</div>
                      </div>
                      <div className="cat-badge-hide" style={{background:`${COLORS[e.category]}15`,color:COLORS[e.category],padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:500,flexShrink:0}}>{e.category}</div>
                      <div className="amount-display" style={{color:"var(--text)",minWidth:80,textAlign:"right"}}>{fmt(e.amount)}</div>
                    </div>
                  ))
              }
            </div>
          </>)}

          {/* ══════════════════════════════════════════════
              ADD EXPENSE
          ══════════════════════════════════════════════ */}
          {tab==="add" && (
            <div style={{maxWidth:520,width:"100%"}}>
              <div style={{marginBottom:24}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <span className="badge badge-green">Level 1</span>
                  <span className="badge badge-level">Core Feature</span>
                </div>
                <p style={{fontSize:13,color:"var(--text3)"}}>
                  {editId?"Update the details below.":demoMode?"Fill in the details — changes save locally.":"Data saves instantly to your Firestore database."}
                </p>
              </div>

              <div className="card" style={{padding:28,display:"flex",flexDirection:"column",gap:20}}>
                <div>
                  <label className="label">Amount (₹) *</label>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--gold)",fontFamily:"var(--font-mono)",fontSize:15,fontWeight:600}}>₹</span>
                    <input className="input" type="number" placeholder="0.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} style={{paddingLeft:30,fontSize:18,fontFamily:"var(--font-mono)",fontWeight:600}} onKeyDown={e=>e.key==="Enter"&&handleSave()}/>
                  </div>
                </div>

                <div className="grid-2" style={{gap:14,gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))"}}>
                  <div>
                    <label className="label">Category</label>
                    <select className="input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                      {CATS.map(c=><option key={c} value={c}>{ICONS[c]} {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input className="input" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
                  </div>
                </div>

                <div>
                  <label className="label">Description <span style={{color:"var(--text3)",fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional)</span></label>
                  <input className="input" type="text" placeholder="What was this expense for?" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleSave()}/>
                </div>

                {/* Category preview */}
                {form.category && (
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10}}>
                    <div style={{width:36,height:36,background:`${COLORS[form.category]}15`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{ICONS[form.category]}</div>
                    <div>
                      <div style={{fontSize:12,color:"var(--text3)"}}>Preview</div>
                      <div style={{fontSize:14,fontWeight:500,color:"var(--text)"}}>{form.description||form.category} · <span style={{fontFamily:"var(--font-mono)",color:"var(--gold)"}}>{form.amount?fmt(form.amount):"₹0"}</span></div>
                    </div>
                  </div>
                )}

                <div style={{display:"flex",gap:10,paddingTop:4}}>
                  <button className="btn-primary" onClick={handleSave} style={{flex:1,justifyContent:"center"}}>
                    {editId?"Update Transaction":"Save Expense"} {!demoMode&&"☁️"}
                  </button>
                  {editId && <button className="btn-ghost" onClick={()=>{setEditId(null);setForm({amount:"",category:"Food",date:new Date().toISOString().split("T")[0],description:""});}}>Cancel</button>}
                </div>
              </div>

              {/* Quick add */}
              <div style={{marginTop:20}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:12}}>Quick Add</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {[["Coffee","☕",80,"Food"],["Auto","🚌",60,"Travel"],["Lunch","🍱",250,"Food"],["Movie","🎬",450,"Entertainment"],["Medicine","💊",180,"Health"],["Book","📚",400,"Education"],["Dinner","🍽️",600,"Food"],["Gym","🏋️",1200,"Health"]].map(([d,ic,a,c])=>(
                    <button key={d} className="quick-chip" onClick={()=>handleQuick(d,a,c)}>{ic} {d} <span style={{color:"var(--text3)",fontSize:11}}>· {fmt(a)}</span></button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TRANSACTIONS
          ══════════════════════════════════════════════ */}
          {tab==="expenses" && (<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <div style={{display:"flex",gap:8,marginBottom:6}}>
                  <span className="badge badge-green">Level 1</span>
                  {!demoMode && <span className="badge badge-blue">🔥 Real-time</span>}
                </div>
                <p style={{fontSize:12,color:"var(--text3)"}}>{filtered.length} records · {fmt(filtered.reduce((s,e)=>s+Number(e.amount),0))} total</p>
              </div>
              <div className="filter-row" style={{display:"flex",gap:10}}>
                <select className="input" style={{width:160,fontSize:13}} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
                  <option value="All">All categories</option>
                  {CATS.map(c=><option key={c} value={c}>{ICONS[c]} {c}</option>)}
                </select>
                <select className="input" style={{width:130,fontSize:13}} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                  <option value="date">Newest first</option>
                  <option value="amount">Highest first</option>
                </select>
              </div>
            </div>

            <div className="card" style={{padding:"4px clamp(14px,3vw,24px) 8px"}}>
              {filtered.length===0
                ? <div className="empty-state"><div className="empty-icon">{expenses.length===0?"💳":"🔍"}</div><p>{expenses.length===0?"No transactions yet. Add your first expense.":"No transactions in this category."}</p></div>
                : filtered.map((e,i)=>(
                    <div key={e.id} className="row">
                      <div style={{width:40,height:40,background:`${COLORS[e.category]}12`,border:`1px solid ${COLORS[e.category]}20`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ICONS[e.category]}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13.5,fontWeight:500,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.description||e.category}</div>
                        <div style={{fontSize:11,color:"var(--text3)",marginTop:1,fontFamily:"var(--font-mono)"}}>{e.date}</div>
                      </div>
                      <div className="cat-badge-hide" style={{background:`${COLORS[e.category]}12`,color:COLORS[e.category],padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:500,flexShrink:0}}>{e.category}</div>
                      <div className="amount-display" style={{color:"var(--text)",minWidth:88,textAlign:"right",fontSize:14}}>{fmt(e.amount)}</div>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn-icon" onClick={()=>handleEdit(e)} title="Edit">✎</button>
                        <button className="btn-icon danger" onClick={()=>handleDelete(e.id)} title="Delete">✕</button>
                      </div>
                    </div>
                  ))
              }
            </div>
          </>)}

          {/* ══════════════════════════════════════════════
              ANALYTICS
          ══════════════════════════════════════════════ */}
          {tab==="charts" && (<>
            <div style={{marginBottom:20,display:"flex",gap:8,alignItems:"center"}}>
              <span className="badge badge-level">Level 2</span>
              <span style={{fontSize:12,color:"var(--text3)"}}>Professional data visualisation</span>
            </div>

            <div className="grid-2" style={{marginBottom:24}}>
              <div className="card" style={{padding:"clamp(14px,3vw,22px) clamp(14px,3vw,20px)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:4}}>Category Distribution</div>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:20}}>Where your money goes</div>
                {pieData.length===0?<div className="empty-state"><div className="empty-icon">🥧</div><p>No data</p></div>:(
                  <ResponsiveContainer width="100%" height={chartH}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={88} dataKey="value" paddingAngle={2} strokeWidth={0}>
                        {pieData.map((e,i)=><Cell key={i} fill={COLORS[e.name]||"#888"}/>)}
                      </Pie>
                      <Tooltip content={<PieTooltip/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card" style={{padding:"clamp(14px,3vw,22px) clamp(14px,3vw,20px)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:4}}>Daily Spend</div>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:20}}>Last 14 days pattern</div>
                {barData.length===0?<div className="empty-state"><div className="empty-icon">📊</div><p>No data</p></div>:(
                  <ResponsiveContainer width="100%" height={chartH}>
                    <BarChart data={barData} barSize={14}>
                      <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="date" tick={{fill:"#475569",fontSize:9}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"#475569",fontSize:9}} axisLine={false} tickLine={false} width={48}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="amount" radius={[4,4,0,0]}>
                        {barData.map((_,i)=><Cell key={i} fill={i===barData.length-1?"#D4A853":"#5B8DEF"} fillOpacity={0.8+i*0.01}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category bars */}
            <div className="card" style={{padding:"22px 24px"}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:4}}>Category Breakdown</div>
              <div style={{fontSize:11,color:"var(--text3)",marginBottom:22}}>Relative spend per category</div>
              {Object.entries(catTots).length===0?<div className="empty-state"><p>No data yet</p></div>:(
                Object.entries(catTots).sort((a,b)=>b[1]-a[1]).map(([cat,amt],i)=>(
                  <div key={cat} style={{marginBottom:18}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{width:28,height:28,background:`${COLORS[cat]}15`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{ICONS[cat]}</span>
                        <span style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{cat}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:11,color:"var(--text3)"}}>{Math.round(amt/total*100)}%</span>
                        <span style={{fontFamily:"var(--font-mono)",fontSize:13,fontWeight:500,color:COLORS[cat]}}>{fmt(amt)}</span>
                      </div>
                    </div>
                    <div className="progress">
                      <div className="progress-fill" style={{width:`${amt/total*100}%`,background:COLORS[cat]}}/>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>)}

          {/* ══════════════════════════════════════════════
              INSIGHTS
          ══════════════════════════════════════════════ */}
          {tab==="insights" && (<>
            <div style={{marginBottom:24,display:"flex",gap:8,alignItems:"center"}}>
              <span className="badge badge-level">Level 3</span>
              <span style={{fontSize:12,color:"var(--text3)"}}>JS-powered financial intelligence — no AI API needed</span>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
              {insights.map((ins,i)=>(
                <div key={i} className="insight-card" style={{animationDelay:`${i*70}ms`}}>
                  <div className="insight-card::before" style={{}}/>
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:ins.color,borderRadius:"3px 0 0 3px"}}/>
                  <div style={{width:42,height:42,background:`rgba(0,0,0,0.2)`,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{ins.icon}</div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,color:"var(--text)",lineHeight:1.6}}>{ins.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Health scores */}
            <div className="card" style={{padding:"clamp(16px,3vw,22px) clamp(16px,3vw,24px)",marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:4}}>Financial Health Score</div>
              <div style={{fontSize:11,color:"var(--text3)",marginBottom:22}}>Based on your spending patterns</div>
              {[
                {label:"Budget Adherence",  tip:"Staying within your set budget",     score:Math.max(0,100-budgetPct),                       hex:budgetPct>85?"#F87171":budgetPct>60?"#D4A853":"#34D399"},
                {label:"Category Balance",  tip:"Diverse spending across categories", score:Math.min(100,Object.keys(catTots).length*14),     hex:"#5B8DEF"},
                {label:"Tracking Habit",    tip:"Consistency in logging expenses",    score:Math.min(100,expenses.length*8),                  hex:"#34D399"},
              ].map(({label,tip,score,hex})=>(
                <div key={label} style={{marginBottom:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{label}</div>
                      <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{tip}</div>
                    </div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:20,fontWeight:600,color:hex,lineHeight:1}}>{score}<span style={{fontSize:11,color:"var(--text3)",fontWeight:400}}>/100</span></div>
                  </div>
                  <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{width:`${score}%`,height:"100%",borderRadius:4,background:`linear-gradient(90deg,${hex}99,${hex})`,transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)"}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="card" style={{padding:"20px 24px",background:"rgba(91,141,239,0.04)",borderColor:"rgba(91,141,239,0.12)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--blue)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:10}}>⚡ How Smart Insights Work</div>
              <p style={{fontSize:13,color:"var(--text2)",lineHeight:1.75}}>
                Pure JavaScript logic analyses your Firestore data in real time. Rules like <code style={{color:"var(--gold)",fontSize:12,background:"rgba(0,0,0,0.3)",padding:"1px 6px",borderRadius:4}}>if (foodPct &gt; 35%) flag()</code> produce actionable financial nudges without any AI API. This is what sets professional portfolios apart — solving real problems with clean logic.
              </p>
            </div>
          </>)}

          {/* ══════════════════════════════════════════════
              BUDGET
          ══════════════════════════════════════════════ */}
          {tab==="budget" && (
            <div style={{maxWidth:540,width:"100%"}}>
              <div style={{marginBottom:24,display:"flex",gap:8,alignItems:"center"}}>
                <span className="badge badge-level">Level 3</span>
                <span style={{fontSize:12,color:"var(--text3)"}}>Smart budget alerts & category tracking</span>
              </div>

              {/* Set budget */}
              <div className="card" style={{padding:"22px 24px",marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:2}}>Monthly Budget {!demoMode&&<span style={{color:"var(--text3)",fontSize:11,fontWeight:400}}>· syncs to Firebase</span>}</div>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:18}}>Set your spending limit for this month</div>
                <div style={{display:"flex",gap:10}}>
                  <div style={{position:"relative",flex:1}}>
                    <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--gold)",fontFamily:"var(--font-mono)",fontWeight:600}}>₹</span>
                    <input className="input" type="number" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} placeholder="e.g. 25000" style={{paddingLeft:28,fontFamily:"var(--font-mono)",fontWeight:500}} onKeyDown={e=>e.key==="Enter"&&saveBudget(Number(budgetInput))}/>
                  </div>
                  <button className="btn-primary" onClick={()=>saveBudget(Number(budgetInput))}>Save Budget</button>
                </div>
              </div>

              {/* Overview */}
              <div className="card" style={{padding:"24px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:24}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>Spent</div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:32,fontWeight:600,color:budgetColor,letterSpacing:"-1px"}}>{fmt(total)}</div>
                  </div>
                  <div style={{width:1,background:"var(--border)"}}/>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>Remaining</div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:32,fontWeight:600,color:"var(--green)",letterSpacing:"-1px"}}>{fmt(Math.max(0,budget-total))}</div>
                  </div>
                </div>
                <div className="progress" style={{height:12,marginBottom:10}}>
                  <div className="progress-fill" style={{width:`${budgetPct}%`,background:`linear-gradient(90deg,var(--blue),${budgetColor})`,boxShadow:`0 0 12px ${budgetColor}40`}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text3)"}}>
                  <span>₹0</span>
                  <span style={{color:budgetColor,fontWeight:600}}>{budgetPct}% used</span>
                  <span>{fmt(budget)}</span>
                </div>
              </div>

              {/* Alert states */}
              {budgetPct>85 && (
                <div className="alert alert-red" style={{marginBottom:16,borderRadius:12}}>
                  <span style={{fontSize:22,marginTop:1}}>🚨</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--red)",marginBottom:3}}>Budget Nearly Exhausted — {budgetPct}% Used</div>
                    <div style={{fontSize:12,color:"var(--text3)"}}>Only {fmt(Math.max(0,budget-total))} remains. Avoid non-essential spending.</div>
                  </div>
                </div>
              )}
              {budgetPct>60&&budgetPct<=85 && (
                <div className="alert alert-amber" style={{marginBottom:16,borderRadius:12}}>
                  <span style={{fontSize:22,marginTop:1}}>⚠️</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--gold)",marginBottom:3}}>Spending Milestone Reached</div>
                    <div style={{fontSize:12,color:"var(--text3)"}}>Past 60% — keep a closer eye on the remaining days.</div>
                  </div>
                </div>
              )}
              {budgetPct<=60 && (
                <div className="alert alert-green" style={{marginBottom:16,borderRadius:12}}>
                  <span style={{fontSize:22,marginTop:1}}>✅</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--green)",marginBottom:3}}>Budget Looking Healthy</div>
                    <div style={{fontSize:12,color:"var(--text3)"}}>Great discipline! You have {fmt(Math.max(0,budget-total))} remaining.</div>
                  </div>
                </div>
              )}

              {/* Category usage */}
              <div className="card" style={{padding:"22px 24px"}}>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:4}}>Category Budget Usage</div>
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:20}}>Estimated vs. equal split across categories</div>
                {Object.keys(catTots).length===0?<div className="empty-state"><p>No expenses to analyse</p></div>:(
                  Object.entries(catTots).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>{
                    const pct=Math.round(amt/(budget/8)*100);
                    const col=pct>120?"var(--red)":pct>90?"var(--gold)":"var(--green)";
                    return (
                      <div key={cat} style={{marginBottom:16}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{width:26,height:26,background:`${COLORS[cat]}15`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{ICONS[cat]}</span>
                            <span style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{cat}</span>
                          </div>
                          <span style={{fontFamily:"var(--font-mono)",fontSize:13,color:col,fontWeight:500}}>{fmt(amt)}</span>
                        </div>
                        <div className="progress" style={{height:6}}>
                          <div className="progress-fill" style={{width:`${Math.min(100,pct)}%`,background:col}}/>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      </main>
      </div>{/* end inner row */}
      {/* ═══════════ MOBILE BOTTOM NAV ═══════════ */}
      <div className="mobile-bottom-nav">
        {[
          {id:"dashboard", icon:"🏠", label:"Home"},
          {id:"expenses",  icon:"💸", label:"Expenses"},
          {id:"add",       icon:"➕", label:"Add",    special:true},
          {id:"charts",    icon:"📊", label:"Charts"},
          {id:"insights",  icon:"💡", label:"Insights"},
        ].map(n => (
          <div key={n.id}
            className={`mob-nav-item${tab===n.id?" active":""}`}
            onClick={()=>changeTab(n.id)}
          >
            {n.special ? (
              /* Centre FAB-style Add button */
              <div style={{
                width:46,height:46,
                background:"linear-gradient(135deg,var(--gold),#B8902E)",
                borderRadius:14,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:22,fontWeight:700,color:"#0D0A00",
                boxShadow:"0 4px 16px rgba(212,168,83,0.45)",
                marginTop:-14,
                border:"3px solid var(--bg2)",
              }}>+</div>
            ) : (
              <div className="mob-icon-wrap">
                <span style={{fontSize:17}}>{n.icon}</span>
              </div>
            )}
            <span className="mob-label" style={{
              color: tab===n.id ? "var(--gold)" : "var(--text3)",
              marginTop: n.special ? 2 : 0,
            }}>{n.label}</span>
          </div>
        ))}
      </div>


      {/* ═══════════ TOAST ═══════════ */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type==="success"?"✓":"✕"}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
