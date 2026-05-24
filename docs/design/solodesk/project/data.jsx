/* Sample data for SoloDesk prototype — projects, tasks, docs, time, invoices */

const STATUSES = [
  { id: 'backlog',  name: 'Backlog',     glyph: 'SBacklog',  isDone: false },
  { id: 'todo',     name: 'To Do',       glyph: 'STodo',     isDone: false },
  { id: 'progress', name: 'In Progress', glyph: 'SProgress', isDone: false },
  { id: 'blocked',  name: 'Blocked',     glyph: 'SBlocked',  isDone: false },
  { id: 'review',   name: 'In Review',   glyph: 'SReview',   isDone: false },
  { id: 'done',     name: 'Done',        glyph: 'SDone',     isDone: true  },
];

const PRIORITIES = [
  { id: 'urgent', name: 'Urgent', glyph: 'PUrgent' },
  { id: 'high',   name: 'High',   glyph: 'PHigh' },
  { id: 'medium', name: 'Medium', glyph: 'PMed' },
  { id: 'low',    name: 'Low',    glyph: 'PLow' },
];

const CLIENTS = [
  { id: 'c1', name: 'Northwind Labs',   company: 'Northwind Labs Inc.',   contact: 'Mara Chen',     status: 'active',    rate: 145 },
  { id: 'c2', name: 'Atlas Studio',     company: 'Atlas Studio LLC',      contact: 'Jordan Wells',  status: 'active',    rate: 120 },
  { id: 'c3', name: 'Foundry Brewing',  company: 'Foundry Brewing Co.',   contact: 'Sam Park',      status: 'paused',    rate: 110 },
  { id: 'c4', name: 'Ridge & Co.',      company: 'Ridge Capital',         contact: 'Iris Quan',     status: 'lead',      rate: null },
];

const PROJECTS = [
  {
    id: 'p1',
    clientId: 'c1',
    glyph: 'NW',
    name: 'Northwind · Marketing Site',
    description: 'Redesign of the public site, focus on developer DX storytelling and pricing clarity.',
    status: 'active',
    rate: 145,
    budget: 24000,
    currency: 'USD',
    startDate: '2026-04-12',
    dueDate: '2026-06-30',
    progress: 0.42,
  },
  {
    id: 'p2',
    clientId: 'c2',
    glyph: 'AS',
    name: 'Atlas · Mobile App v2',
    description: 'Rebuild of the trip-planning iOS app with a new sync model and offline support.',
    status: 'active',
    rate: 120,
    budget: 36000,
    currency: 'USD',
    startDate: '2026-03-02',
    dueDate: '2026-08-15',
    progress: 0.61,
  },
  {
    id: 'p3',
    clientId: null,
    glyph: 'PF',
    name: 'Personal · Portfolio 2026',
    description: 'Personal site refresh with case studies and a small writing section.',
    status: 'active',
    rate: null,
    budget: null,
    currency: 'USD',
    startDate: '2026-05-01',
    dueDate: null,
    progress: 0.18,
  },
  {
    id: 'p4',
    clientId: 'c3',
    glyph: 'FB',
    name: 'Foundry · Tap Menu Kiosk',
    description: 'Touchscreen tap menu with seasonal rotation and tasting notes.',
    status: 'paused',
    rate: 110,
    budget: 9000,
    currency: 'USD',
    startDate: '2026-02-14',
    dueDate: '2026-05-30',
    progress: 0.78,
  },
];

const PROJECT_GROUPS = [
  { id: 'g-active',  name: 'Active',   ids: ['p1','p2','p3'] },
  { id: 'g-paused',  name: 'Paused',   ids: ['p4'] },
];

const TASKS = [
  // p1 Northwind
  { id: 't1',  projectId: 'p1', title: 'Pricing page redesign — bring back annual toggle',  statusId: 'progress', priority: 'high',   dueDate: '2026-05-24', estimate: 240, billable: true,  archived: false, assignee: 'me' },
  { id: 't2',  projectId: 'p1', title: 'Hero motion: 3 directions for review',              statusId: 'review',   priority: 'medium', dueDate: '2026-05-22', estimate: 180, billable: true,  archived: false },
  { id: 't3',  projectId: 'p1', title: 'Add MDX changelog route',                           statusId: 'todo',     priority: 'medium', dueDate: '2026-05-28', estimate: 120, billable: true,  archived: false },
  { id: 't4',  projectId: 'p1', title: 'Migrate legal pages',                               statusId: 'todo',     priority: 'low',    dueDate: '2026-06-04', estimate: 90,  billable: true,  archived: false },
  { id: 't5',  projectId: 'p1', title: 'Cross-browser QA pass',                             statusId: 'backlog',  priority: 'medium', dueDate: null,         estimate: 180, billable: true,  archived: false },
  { id: 't6',  projectId: 'p1', title: 'Open-graph image regenerator',                      statusId: 'backlog',  priority: 'low',    dueDate: null,         estimate: 120, billable: false, archived: false },
  { id: 't7',  projectId: 'p1', title: 'Waitlist endpoint hooked up',                       statusId: 'done',     priority: 'medium', dueDate: '2026-05-18', estimate: 60,  billable: true,  archived: false },
  { id: 't8',  projectId: 'p1', title: 'Awaiting copy from Mara (about page)',              statusId: 'blocked',  priority: 'high',   dueDate: '2026-05-20', estimate: 60,  billable: true,  archived: false },
  { id: 't9',  projectId: 'p1', title: 'Type scale: tighten lockup at 1280',                statusId: 'done',     priority: 'low',    dueDate: '2026-05-15', estimate: 60,  billable: true,  archived: false },

  // p2 Atlas
  { id: 't10', projectId: 'p2', title: 'Sync conflict resolution UI',                       statusId: 'progress', priority: 'urgent', dueDate: '2026-05-23', estimate: 360, billable: true },
  { id: 't11', projectId: 'p2', title: 'Trip list empty-state illustrations',               statusId: 'review',   priority: 'medium', dueDate: '2026-05-26', estimate: 120, billable: true },
  { id: 't12', projectId: 'p2', title: 'Onboarding step 3 — permissions copy',              statusId: 'todo',     priority: 'high',   dueDate: '2026-05-29', estimate: 90,  billable: true },
  { id: 't13', projectId: 'p2', title: 'Offline tile cache — quota strategy',               statusId: 'backlog',  priority: 'high',   dueDate: null,         estimate: 480, billable: true },
  { id: 't14', projectId: 'p2', title: 'Settings · units toggle',                           statusId: 'done',     priority: 'low',    dueDate: '2026-05-12', estimate: 60,  billable: true },

  // p3 Personal portfolio
  { id: 't15', projectId: 'p3', title: 'Pick a font pair (testing Geist + GT Super)',       statusId: 'progress', priority: 'medium', dueDate: '2026-05-25', estimate: 60,  billable: false },
  { id: 't16', projectId: 'p3', title: 'Case study: Northwind site',                        statusId: 'todo',     priority: 'medium', dueDate: '2026-06-08', estimate: 180, billable: false },
  { id: 't17', projectId: 'p3', title: 'Set up MDX writing pipeline',                       statusId: 'backlog',  priority: 'low',    dueDate: null,         estimate: 120, billable: false },

  // p4 Foundry
  { id: 't18', projectId: 'p4', title: 'Tasting notes copy from Sam',                       statusId: 'blocked',  priority: 'medium', dueDate: null,         estimate: 60,  billable: true },
  { id: 't19', projectId: 'p4', title: 'Kiosk wake-from-sleep flash',                       statusId: 'todo',     priority: 'high',   dueDate: '2026-05-30', estimate: 90,  billable: true },
  { id: 't20', projectId: 'p4', title: 'Seasonal rotation editor',                          statusId: 'done',     priority: 'medium', dueDate: '2026-05-04', estimate: 240, billable: true },
];

const DOCS = [
  { id: 'd1',  projectId: 'p1', title: 'Northwind — Site brief',          updatedAt: '2026-05-19', emoji: '📄' },
  { id: 'd2',  projectId: 'p1', title: 'Pricing — copy decisions',        updatedAt: '2026-05-18', emoji: '📄' },
  { id: 'd3',  projectId: 'p1', title: 'Meeting · Kickoff 04-12',         updatedAt: '2026-04-12', emoji: '📄' },
  { id: 'd4',  projectId: 'p2', title: 'Atlas v2 — Sync model',           updatedAt: '2026-05-17', emoji: '📄' },
  { id: 'd5',  projectId: 'p2', title: 'Atlas v2 — Release checklist',    updatedAt: '2026-05-14', emoji: '📄' },
  { id: 'd6',  projectId: null, title: 'Standalone · Operating notes',    updatedAt: '2026-05-10', emoji: '📄', isStandalone: true },
  { id: 'd7',  projectId: null, title: 'Standalone · Pricing playbook',   updatedAt: '2026-04-28', emoji: '📄', isStandalone: true },
];

// Doc body — long structured doc to demo editor styling
const DOC_BODY = [
  { id: 'b1',  type: 'h1',     text: 'Site brief — Northwind Labs' },
  { id: 'b2',  type: 'p',      text: 'A focused redesign of northwind.dev. Emphasis on the developer story, runnable code samples in the hero, and pricing transparency.' },
  { id: 'b3',  type: 'callout',text: 'Owner: Mara Chen. Sign-off: end of June. Budget: $24k.' },
  { id: 'b4',  type: 'h2',     text: 'Goals' },
  { id: 'b5',  type: 'ul',     items: ['Lift trial → paid conversion by 25%.', 'Clear, single-glance pricing.', 'Showcase the API in motion, not in copy.'] },
  { id: 'b6',  type: 'h2',     text: 'Non-goals' },
  { id: 'b7',  type: 'ul',     items: ['Logged-in product surface.', 'Internationalization beyond English/Spanish.'] },
  { id: 'b8',  type: 'h2',     text: 'Open questions' },
  { id: 'b9',  type: 'task',   items: [{text:'Confirm pricing tier names with Mara', done:true},{text:'Decide on changelog cadence', done:false},{text:'Source three customer quotes', done:false}] },
  { id: 'b10', type: 'h3',     text: 'Code sample to ship in hero' },
  { id: 'b11', type: 'code',   text: 'import { Northwind } from "@northwind/sdk";\n\nconst nw = new Northwind({ key: process.env.NW_KEY });\n\nawait nw.events.track({\n  name: "checkout.completed",\n  amount: 4900,\n  currency: "usd",\n});' },
  { id: 'b12', type: 'h3',     text: 'Reference' },
  { id: 'b13', type: 'quote',  text: '“Make the marketing site feel like the product. Less brochure, more terminal.” — Mara, kickoff' },
];

window.DATA = {
  STATUSES, PRIORITIES, CLIENTS, PROJECTS, PROJECT_GROUPS, TASKS, DOCS, DOC_BODY,
};

// Helpers
window.fmtMin = function (m) {
  if (!m) return '0h';
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${h}h ${r}m`;
  if (h) return `${h}h`;
  return `${r}m`;
};
window.fmtDate = function (iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
window.fmtMoney = function (n, c = 'USD') {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style:'currency', currency:c, maximumFractionDigits:0 }).format(n);
};
window.isOverdue = function (iso) {
  if (!iso) return false;
  const today = new Date('2026-05-21T00:00');
  return new Date(iso + 'T00:00') < today;
};
window.today = new Date('2026-05-21T00:00');
