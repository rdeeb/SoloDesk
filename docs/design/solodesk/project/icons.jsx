/* global React */
// Icon library — minimal lucide-style strokes, sized by parent
const Icon = ({ children, size = 16, strokeWidth = 1.75, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

const IHome = (p) => (<Icon {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></Icon>);
const IActivity = (p) => (<Icon {...p}><path d="M3 12h3l3-8 4 16 3-8h5" /></Icon>);
const ICrosshair = (p) => (<Icon {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></Icon>);
const IBriefcase = (p) => (<Icon {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M3 13h18" /></Icon>);
const ISettings = (p) => (<Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></Icon>);
const IInbox = (p) => (<Icon {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></Icon>);
const IUsers = (p) => (<Icon {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></Icon>);

const IPlus = (p) => (<Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>);
const ISearch = (p) => (<Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Icon>);
const IMore = (p) => (<Icon {...p}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></Icon>);
const IChevDown = (p) => (<Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>);
const IChevRight = (p) => (<Icon {...p}><path d="M9 6l6 6-6 6" /></Icon>);
const IChevLeft = (p) => (<Icon {...p}><path d="M15 6l-6 6 6 6" /></Icon>);
const IClose = (p) => (<Icon {...p}><path d="M18 6L6 18M6 6l18 12" /></Icon>);
const ICheck = (p) => (<Icon {...p}><path d="M5 13l4 4L19 7" strokeWidth="2.5" /></Icon>);

const IList = (p) => (<Icon {...p}><circle cx="5" cy="6" r="1.5" fill="currentColor" /><path d="M10 6h10" /><circle cx="5" cy="12" r="1.5" fill="currentColor" /><path d="M10 12h10" /><circle cx="5" cy="18" r="1.5" fill="currentColor" /><path d="M10 18h7" /></Icon>);
const IBoard = (p) => (<Icon {...p}><rect x="3" y="4" width="6" height="16" rx="1.5" /><rect x="11" y="4" width="6" height="10" rx="1.5" /><rect x="19" y="4" width="2" height="13" rx="1" /></Icon>);
const IFile = (p) => (<Icon {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></Icon>);
const IClock = (p) => (<Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>);
const IReceipt = (p) => (<Icon {...p}><path d="M5 3v18l3-2 3 2 3-2 3 2 2-2V3" /><path d="M9 8h6M9 12h6M9 16h4" /></Icon>);
const ITrash = (p) => (<Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1.5 14a2 2 0 01-2 2H8.5a2 2 0 01-2-2L5 6" /></Icon>);
const ICalendar = (p) => (<Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></Icon>);
const IArchive = (p) => (<Icon {...p}><rect x="2" y="4" width="20" height="5" rx="1" /><path d="M4 9v9a2 2 0 002 2h12a2 2 0 002-2V9" /><path d="M10 13h4" /></Icon>);
const IFlag = (p) => (<Icon {...p}><path d="M4 21v-7m0-8a4 4 0 014-4c3 0 4 2 6 2s4-1 4-1v9s-2 1-4 1-3-2-6-2a4 4 0 00-4 2" /></Icon>);
const IFilter = (p) => (<Icon {...p}><path d="M3 5h18M6 12h12M10 19h4" /></Icon>);
const ISort = (p) => (<Icon {...p}><path d="M7 4v16M3 8l4-4 4 4" /><path d="M17 20V4M13 16l4 4 4-4" /></Icon>);
const ITag = (p) => (<Icon {...p}><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" /></Icon>);
const ILink = (p) => (<Icon {...p}><path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" /><path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" /></Icon>);
const IEye = (p) => (<Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Icon>);
const IShare = (p) => (<Icon {...p}><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><path d="M16 6l-4-4-4 4M12 2v14" /></Icon>);
const IGrip = (p) => (<Icon {...p}><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></Icon>);
const IDot = (p) => (<Icon {...p}><circle cx="12" cy="12" r="3" fill="currentColor" /></Icon>);

// Status glyphs (project-icon shapes; B&W)
const SBacklog = (p) => (<Icon {...p}><circle cx="12" cy="12" r="8" strokeDasharray="2 2.5" /></Icon>);
const STodo = (p) => (<Icon {...p}><circle cx="12" cy="12" r="8" /></Icon>);
const SProgress = (p) => (<Icon {...p}><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 010 16" fill="currentColor" stroke="none" /></Icon>);
const SBlocked = (p) => (<Icon {...p}><circle cx="12" cy="12" r="8" /><path d="M8 12h8" strokeWidth="2.5" /></Icon>);
const SReview = (p) => (<Icon {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></Icon>);
const SDone = (p) => (<Icon {...p}><circle cx="12" cy="12" r="8" fill="currentColor" /><path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" /></Icon>);
const SCanceled = (p) => (<Icon {...p}><circle cx="12" cy="12" r="8" /><path d="M9 9l6 6M15 9l-6 6" /></Icon>);

// Priority glyphs (bar style)
const PUrgent = (p) => (<Icon {...p}><rect x="3" y="14" width="3" height="6" rx="0.5" fill="currentColor" /><rect x="9" y="10" width="3" height="10" rx="0.5" fill="currentColor" /><rect x="15" y="6" width="3" height="14" rx="0.5" fill="currentColor" /><circle cx="20" cy="5" r="1.5" fill="currentColor" stroke="none" /></Icon>);
const PHigh = (p) => (<Icon {...p}><rect x="3" y="14" width="3" height="6" rx="0.5" fill="currentColor" /><rect x="9" y="10" width="3" height="10" rx="0.5" fill="currentColor" /><rect x="15" y="6" width="3" height="14" rx="0.5" fill="currentColor" /></Icon>);
const PMed = (p) => (<Icon {...p}><rect x="3" y="14" width="3" height="6" rx="0.5" fill="currentColor" /><rect x="9" y="10" width="3" height="10" rx="0.5" fill="currentColor" /><rect x="15" y="6" width="3" height="14" rx="0.5" opacity="0.3" fill="currentColor" /></Icon>);
const PLow = (p) => (<Icon {...p}><rect x="3" y="14" width="3" height="6" rx="0.5" fill="currentColor" /><rect x="9" y="10" width="3" height="10" rx="0.5" opacity="0.3" fill="currentColor" /><rect x="15" y="6" width="3" height="14" rx="0.5" opacity="0.3" fill="currentColor" /></Icon>);

// Doc / block glyphs
const GH1 = () => <span className="mono" style={{fontWeight:600}}>H1</span>;
const GH2 = () => <span className="mono" style={{fontWeight:600}}>H2</span>;
const GH3 = () => <span className="mono" style={{fontWeight:600}}>H3</span>;
const GText = () => <span className="mono" style={{fontWeight:500}}>P</span>;
const GBullet = (p) => (<Icon {...p}><circle cx="6" cy="6" r="1.5" fill="currentColor" /><path d="M11 6h9" /><circle cx="6" cy="12" r="1.5" fill="currentColor" /><path d="M11 12h9" /><circle cx="6" cy="18" r="1.5" fill="currentColor" /><path d="M11 18h9" /></Icon>);
const GNumber = () => <span className="mono" style={{fontSize:11,fontWeight:600,letterSpacing:'-0.04em'}}>1.</span>;
const GQuote = (p) => (<Icon {...p}><path d="M7 8v4c0 2-1 3-3 3M14 8v4c0 2-1 3-3 3" /></Icon>);
const GDivider = (p) => (<Icon {...p}><path d="M3 12h18" strokeWidth="2.5" /></Icon>);
const GCode = (p) => (<Icon {...p}><path d="M8 8l-4 4 4 4M16 8l4 4-4 4" /></Icon>);
const GTask = (p) => (<Icon {...p}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12l3 3 5-6" /></Icon>);

const Glyph = {
  Home: IHome, Activity: IActivity, Crosshair: ICrosshair, Briefcase: IBriefcase, Settings: ISettings,
  Inbox: IInbox, Users: IUsers, Plus: IPlus, Search: ISearch, More: IMore, ChevDown: IChevDown,
  ChevRight: IChevRight, ChevLeft: IChevLeft, Close: IClose, Check: ICheck, List: IList, Board: IBoard,
  File: IFile, Clock: IClock, Receipt: IReceipt, Trash: ITrash, Calendar: ICalendar, Archive: IArchive,
  Flag: IFlag, Filter: IFilter, Sort: ISort, Tag: ITag, Link: ILink, Eye: IEye, Share: IShare, Grip: IGrip, Dot: IDot,
  SBacklog, STodo, SProgress, SBlocked, SReview, SDone, SCanceled,
  PUrgent, PHigh, PMed, PLow,
  GH1, GH2, GH3, GText, GBullet, GNumber, GQuote, GDivider, GCode, GTask
};

window.Glyph = Glyph;
