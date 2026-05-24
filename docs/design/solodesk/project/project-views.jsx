/* Project views: Overview, Board, Tasks, Time, Invoices */
const { useState, useMemo } = React;

function Topbar({ crumbs, actions }) {
  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep"><Glyph.ChevRight size={12} /></span>}
            <span className={"c" + (c.active ? " active" : "")}>
              {c.glyph ? <span style={{
                width:16, height:16, borderRadius:4, background:c.dark?'#0e0e10':'transparent', color:c.dark?'#fff':'inherit',
                display:'inline-grid', placeItems:'center', fontSize:9, fontWeight:700
              }}>{c.glyph}</span> : null}
              {c.icon || null}
              <span>{c.label}</span>
            </span>
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-spacer" />
      {actions}
    </div>
  );
}

function PageHead({ project, tabs, currentTab, onTab }) {
  const client = project.clientId ? DATA.CLIENTS.find(c => c.id === project.clientId) : null;
  return (
    <>
      <div className="page-head">
        <div className="page-emoji">{project.glyph}</div>
        <div style={{flex:1, minWidth:0}}>
          <h1 className="page-title">{project.name}</h1>
          <div className="page-subtitle">
            <span className="pill"><Glyph.Crosshair /> {project.status === 'active' ? 'Active' : 'Paused'}</span>
            {client && <span>· {client.name}</span>}
            {project.dueDate && <span>· Due <span className="mono">{fmtDate(project.dueDate)}</span></span>}
            <span>· <span className="mono">{Math.round(project.progress*100)}%</span> complete</span>
            <span>· <span className="mono">{fmtMoney(project.budget, project.currency)}</span> budget</span>
          </div>
        </div>
      </div>

      {tabs && (
        <div className="page-tabs">
          {tabs.map(t => (
            <div key={t.id} className="page-tab" data-active={currentTab === t.id} onClick={()=>onTab(t.id)}>
              {t.icon}
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Overview ---------- */
function ProjectOverview({ project, tasks, onOpenTask, onView }) {
  const open = tasks.filter(t => t.statusId !== 'done').length;
  const done = tasks.filter(t => t.statusId === 'done').length;
  const overdue = tasks.filter(t => t.dueDate && isOverdue(t.dueDate) && t.statusId !== 'done').length;
  const billable = tasks.filter(t => t.billable).reduce((s,t) => s + (t.estimate||0), 0);
  const client = project.clientId ? DATA.CLIENTS.find(c => c.id === project.clientId) : null;

  return (
    <div className="page">
      <PageHead project={project} />

      <div className="kpis">
        <div className="kpi"><div className="kpi-label"><Glyph.List /> Open tasks</div><div className="kpi-value">{open}</div><div className="kpi-delta">{done} done</div></div>
        <div className="kpi"><div className="kpi-label"><Glyph.Flag /> Overdue</div><div className="kpi-value">{overdue}</div><div className="kpi-delta">across {tasks.filter(t=>t.dueDate).length} dated tasks</div></div>
        <div className="kpi"><div className="kpi-label"><Glyph.Clock /> Logged this week</div><div className="kpi-value">14.2<span style={{fontSize:18}}>h</span></div><div className="kpi-delta"><span className="num">9.7h</span> billable</div></div>
        <div className="kpi"><div className="kpi-label"><Glyph.Receipt /> Unbilled</div><div className="kpi-value">{fmtMoney(1408, project.currency)}</div><div className="kpi-delta">2 draft lines</div></div>
      </div>

      <div className="split">
        <div>
          <div className="section-title">
            Up next
            <div className="right">
              <button className="topbar-act" onClick={()=>onView('tasks')}>See all <Glyph.ChevRight /></button>
            </div>
          </div>
          <div className="tbl">
            <div className="tbl-head" style={{gridTemplateColumns: '24px 1fr 110px 100px 84px'}}>
              <div></div>
              <div>Task</div>
              <div>Status</div>
              <div>Priority</div>
              <div style={{textAlign:'right'}}>Due</div>
            </div>
            {tasks.filter(t => t.statusId !== 'done').slice(0,6).map(t => <TaskRow key={t.id} t={t} onOpen={onOpenTask} cols="24px 1fr 110px 100px 84px" />)}
          </div>

          <div className="section-title" style={{marginTop:32}}>Recent docs<div className="right"><button className="topbar-act" onClick={()=>onView('docs')}>All docs <Glyph.ChevRight /></button></div></div>
          <div className="tbl">
            <div className="tbl-head" style={{gridTemplateColumns: '20px 1fr 120px'}}>
              <div></div>
              <div>Title</div>
              <div style={{textAlign:'right'}}>Updated</div>
            </div>
            {DATA.DOCS.filter(d => d.projectId === project.id).map(d => (
              <div key={d.id} className="tbl-row" style={{gridTemplateColumns:'20px 1fr 120px'}}>
                <Glyph.File />
                <div className="ttl">{d.title}</div>
                <div className="muted num" style={{textAlign:'right'}}>{fmtDate(d.updatedAt)}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-title">About</div>
          <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', padding:14, background:'#fff'}}>
            <p style={{margin:0, fontSize:13.5, color:'var(--fg)', lineHeight:1.6}}>{project.description}</p>
          </div>

          <div className="section-title" style={{marginTop:20}}>Properties</div>
          <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', padding:6, background:'#fff'}}>
            <PropRow label="Client" value={client ? client.name : '—'} />
            <PropRow label="Rate" value={<span className="mono">{fmtMoney(project.rate, project.currency)}/h</span>} />
            <PropRow label="Budget" value={<span className="mono">{fmtMoney(project.budget, project.currency)}</span>} />
            <PropRow label="Start" value={<span className="mono">{fmtDate(project.startDate)}</span>} />
            <PropRow label="Due" value={<span className="mono">{fmtDate(project.dueDate)}</span>} />
            <PropRow label="Currency" value={<span className="mono">{project.currency}</span>} />
          </div>

          <div className="section-title" style={{marginTop:20}}>Progress</div>
          <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', padding:14, background:'#fff'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
              <span style={{fontSize:13, color:'var(--fg-muted)'}}>Completion</span>
              <span className="mono" style={{fontWeight:600}}>{Math.round(project.progress*100)}%</span>
            </div>
            <div style={{height:6, background:'#eee', borderRadius:3, overflow:'hidden'}}>
              <div style={{height:'100%', width:(project.progress*100)+'%', background:'#0e0e10'}} />
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:10, color:'var(--fg-muted)', fontSize:12}}>
              <span><span className="mono" style={{color:'var(--fg)'}}>{done}</span> done</span>
              <span><span className="mono" style={{color:'var(--fg)'}}>{open}</span> open</span>
              <span><span className="mono" style={{color:'var(--fg)'}}>{tasks.length}</span> total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropRow({ label, value }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:6}}>
      <span style={{fontSize:12, color:'var(--fg-muted)'}}>{label}</span>
      <span style={{fontSize:13}}>{value}</span>
    </div>
  );
}

/* ---------- Tasks list ---------- */
function TaskRow({ t, onOpen, cols, checked: checkedProp, onCheck }) {
  const [checkedLocal, setCheckedLocal] = useState(t.statusId === 'done');
  const checked = checkedProp != null ? checkedProp : checkedLocal;
  const status = DATA.STATUSES.find(s => s.id === t.statusId);
  const priority = DATA.PRIORITIES.find(p => p.id === t.priority);
  const SG = status ? Glyph[status.glyph] : Glyph.STodo;
  const PG = priority ? Glyph[priority.glyph] : null;
  const overdue = t.dueDate && isOverdue(t.dueDate) && t.statusId !== 'done';

  return (
    <div className="tbl-row" style={{gridTemplateColumns: cols || '24px 1fr 110px 100px 84px'}} onClick={()=>onOpen?.(t)}>
      <button
        className="task-check"
        data-checked={checked}
        onClick={(e)=>{ e.stopPropagation(); onCheck ? onCheck(!checked) : setCheckedLocal(!checked); }}
        aria-label="Toggle complete"
      >
        <Glyph.Check />
      </button>
      <div className="ttl" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--fg-muted)' : undefined}}>
        {t.title}
      </div>
      <div>
        <span className="row-status">
          <SG size={12} />
          <span>{status?.name}</span>
        </span>
      </div>
      <div>
        {PG ? (
          <span className="row-priority">
            <PG size={12} />
            <span>{priority.name}</span>
          </span>
        ) : <span style={{color:'var(--fg-faint)'}}>—</span>}
      </div>
      <div className={"num " + (overdue ? "" : "muted")} style={{textAlign:'right', color: overdue ? '#0e0e10' : undefined, fontWeight: overdue ? 600 : 400}}>
        {fmtDate(t.dueDate)}
      </div>
    </div>
  );
}

function TasksList({ project, tasks, statusFilter, onOpenTask, archivedFilter }) {
  const visible = useMemo(() => {
    let arr = tasks;
    if (archivedFilter) arr = arr.filter(t => t.archived);
    else arr = arr.filter(t => !t.archived);
    if (statusFilter) arr = arr.filter(t => t.statusId === statusFilter);
    return arr;
  }, [tasks, statusFilter, archivedFilter]);

  // Group by status when no filter applied
  const grouped = useMemo(() => {
    if (statusFilter) return [{ status: DATA.STATUSES.find(s=>s.id===statusFilter), items: visible }];
    return DATA.STATUSES.map(s => ({ status: s, items: visible.filter(t => t.statusId === s.id) })).filter(g => g.items.length);
  }, [visible, statusFilter]);

  const headLabel = archivedFilter ? 'Archived tasks' : statusFilter ? DATA.STATUSES.find(s=>s.id===statusFilter).name : 'All tasks';

  return (
    <div className="page wide">
      <PageHead project={project} />

      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <h2 style={{margin:0, fontSize:18, fontWeight:600, letterSpacing:'-0.01em'}}>{headLabel}</h2>
          <span className="mono" style={{color:'var(--fg-muted)'}}>{visible.length}</span>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button className="topbar-act"><Glyph.Filter /> Filter</button>
          <button className="topbar-act"><Glyph.Sort /> Sort</button>
          <button className="topbar-act"><Glyph.Eye /> Group</button>
          <button className="btn"><Glyph.Plus /> New task</button>
        </div>
      </div>

      <div className="tbl">
        <div className="tbl-head" style={{gridTemplateColumns: '24px 1fr 130px 110px 84px 84px'}}>
          <div></div>
          <div>Task</div>
          <div>Status</div>
          <div>Priority</div>
          <div style={{textAlign:'right'}}>Estimate</div>
          <div style={{textAlign:'right'}}>Due</div>
        </div>
        {grouped.map(g => (
          <React.Fragment key={g.status.id}>
            {!statusFilter && (
              <div className="tbl-row" style={{gridTemplateColumns: '24px 1fr 130px 110px 84px 84px', background:'#fafaf8', height:30}}>
                <div></div>
                <div style={{display:'flex', alignItems:'center', gap:8, color:'var(--fg-muted)', fontSize:12, fontWeight:500}}>
                  {React.createElement(Glyph[g.status.glyph], { size:12 })}
                  <span>{g.status.name}</span>
                  <span className="mono" style={{color:'var(--fg-faint)'}}>{g.items.length}</span>
                </div>
                <div /><div /><div /><div />
              </div>
            )}
            {g.items.map(t => (
              <ExtTaskRow key={t.id} t={t} onOpen={onOpenTask} />
            ))}
          </React.Fragment>
        ))}
        <div className="tbl-row" style={{gridTemplateColumns: '24px 1fr 130px 110px 84px 84px', color:'var(--fg-muted)', cursor:'pointer'}}>
          <Glyph.Plus />
          <div>New task</div>
          <div /><div /><div /><div />
        </div>
      </div>
    </div>
  );
}

function ExtTaskRow({ t, onOpen }) {
  const [checked, setChecked] = useState(t.statusId === 'done');
  const status = DATA.STATUSES.find(s => s.id === t.statusId);
  const priority = DATA.PRIORITIES.find(p => p.id === t.priority);
  const SG = Glyph[status.glyph];
  const PG = priority ? Glyph[priority.glyph] : null;
  const overdue = t.dueDate && isOverdue(t.dueDate) && t.statusId !== 'done';
  return (
    <div className="tbl-row" style={{gridTemplateColumns: '24px 1fr 130px 110px 84px 84px'}} onClick={()=>onOpen?.(t)}>
      <button
        className="task-check"
        data-checked={checked}
        onClick={(e)=>{ e.stopPropagation(); setChecked(!checked); }}
      ><Glyph.Check /></button>
      <div className="ttl" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--fg-muted)' : undefined}}>{t.title}</div>
      <div><span className="row-status"><SG size={12}/><span>{status.name}</span></span></div>
      <div>{PG ? <span className="row-priority"><PG size={12}/><span>{priority.name}</span></span> : <span style={{color:'var(--fg-faint)'}}>—</span>}</div>
      <div className="num muted" style={{textAlign:'right'}}>{t.estimate ? fmtMin(t.estimate) : '—'}</div>
      <div className={"num " + (overdue?'':'muted')} style={{textAlign:'right', color:overdue?'#0e0e10':undefined, fontWeight:overdue?600:400}}>{fmtDate(t.dueDate)}</div>
    </div>
  );
}

/* ---------- Board ---------- */
function Board({ project, tasks }) {
  const cols = DATA.STATUSES;
  const byStatus = useMemo(() => {
    const m = {};
    cols.forEach(c => m[c.id] = []);
    tasks.filter(t => !t.archived).forEach(t => { if (m[t.statusId]) m[t.statusId].push(t); });
    return m;
  }, [tasks, cols]);

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <div style={{padding:'20px 24px 4px'}}>
        <PageHead project={project} />
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <h2 style={{margin:0, fontSize:18, fontWeight:600, letterSpacing:'-0.01em'}}>Board</h2>
          </div>
          <div style={{display:'flex', gap:6}}>
            <button className="topbar-act"><Glyph.Filter /> Filter</button>
            <button className="topbar-act"><Glyph.Eye /> Group by status</button>
          </div>
        </div>
      </div>
      <div className="board">
        {cols.map(c => {
          const G = Glyph[c.glyph];
          const items = byStatus[c.id];
          return (
            <div className="col" key={c.id}>
              <div className="col-head">
                <div className="name">
                  <G size={14} />
                  <span>{c.name}</span>
                  <span className="count mono">{items.length}</span>
                </div>
                <div className="actions">
                  <button aria-label="Add card"><Glyph.Plus /></button>
                  <button aria-label="More"><Glyph.More /></button>
                </div>
              </div>
              <div className="col-body">
                {items.map(t => <BoardCard key={t.id} t={t} />)}
                <div className="add-card"><Glyph.Plus /> Add card</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BoardCard({ t }) {
  const priority = DATA.PRIORITIES.find(p => p.id === t.priority);
  const PG = priority ? Glyph[priority.glyph] : null;
  const overdue = t.dueDate && isOverdue(t.dueDate) && t.statusId !== 'done';
  return (
    <div className="card">
      <div className="ttl">{t.title}</div>
      <div className="meta">
        {PG && <span style={{display:'inline-flex', alignItems:'center', gap:4}}><PG size={12} /> {priority.name}</span>}
        {t.estimate ? <span className="mono">· {fmtMin(t.estimate)}</span> : null}
        <div className="right">
          {t.dueDate && <span className={"due " + (overdue?'overdue':'')}>{fmtDate(t.dueDate)}</span>}
        </div>
      </div>
      <button className="check task-check" data-checked="false"><Glyph.Check /></button>
    </div>
  );
}

/* ---------- Time ---------- */
function TimeView({ project, tasks }) {
  // Build a 7-day grid for the current week. Sample entries.
  const days = ['Mon May 19','Tue May 20','Wed May 21','Thu May 22','Fri May 23','Sat May 24','Sun May 25'];
  const rows = [
    { task: 't1', label: 'Pricing page redesign', vals: [60, 90, 120, 0, 0, 0, 0] },
    { task: 't10', label: 'Sync conflict resolution UI', vals: [120, 90, 60, 0, 0, 0, 0] },
    { task: 't2', label: 'Hero motion: 3 directions', vals: [45, 0, 90, 0, 0, 0, 0] },
    { task: '—', label: 'Project discussion w/ Mara', vals: [0, 30, 0, 0, 0, 0, 0] },
  ];
  const totals = days.map((_, i) => rows.reduce((s,r) => s + r.vals[i], 0));
  const grand = totals.reduce((a,b)=>a+b,0);

  return (
    <div className="page wide">
      <PageHead project={project} />

      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <h2 style={{margin:0, fontSize:18, fontWeight:600, letterSpacing:'-0.01em'}}>Time</h2>
          <span className="mono" style={{color:'var(--fg-muted)'}}>Week of May 19</span>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button className="topbar-act"><Glyph.ChevLeft /></button>
          <button className="topbar-act">Today</button>
          <button className="topbar-act"><Glyph.ChevRight /></button>
          <button className="btn"><Glyph.Plus /> Log time</button>
        </div>
      </div>

      <div className="kpis" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="kpi"><div className="kpi-label"><Glyph.Clock /> This week</div><div className="kpi-value">{fmtMin(grand)}</div><div className="kpi-delta"><span className="num">{fmtMin(grand - 60)}</span> billable</div></div>
        <div className="kpi"><div className="kpi-label"><Glyph.Receipt /> Unbilled</div><div className="kpi-value">{fmtMoney((grand-60)/60 * project.rate, project.currency)}</div><div className="kpi-delta">at <span className="num">{fmtMoney(project.rate)}/h</span></div></div>
        <div className="kpi"><div className="kpi-label"><Glyph.Flag /> Budget used</div><div className="kpi-value">38<span style={{fontSize:18}}>%</span></div><div className="kpi-delta">of <span className="num">{fmtMoney(project.budget)}</span></div></div>
      </div>

      <div className="time-week" style={{marginTop:8}}>
        <div className="th">Task</div>
        {days.map(d => <div className="th" key={d}>{d}</div>)}
        <div className="th" style={{justifyContent:'flex-end'}}>Total</div>
        {rows.map((r,i) => (
          <React.Fragment key={i}>
            <div className="td"><span style={{display:'inline-flex', alignItems:'center', gap:8}}>{r.task !== '—' && <Glyph.STodo size={12} />} {r.label}</span></div>
            {r.vals.map((v,j) => <div className={"td day " + (v===0?'empty':'')} key={j}>{v?fmtMin(v):'·'}</div>)}
            <div className="td total">{fmtMin(r.vals.reduce((a,b)=>a+b,0))}</div>
          </React.Fragment>
        ))}
        <div className="td" style={{background:'#fafaf8', fontWeight:600, fontSize:12}}>Total</div>
        {totals.map((v,j) => <div className="td day" key={j} style={{background:'#fafaf8', fontWeight:600}}>{v?fmtMin(v):'·'}</div>)}
        <div className="td total" style={{background:'#fafaf8'}}>{fmtMin(grand)}</div>
      </div>
    </div>
  );
}

/* ---------- Invoices (project-level list + a single invoice example) ---------- */
function InvoicesView({ project }) {
  const client = project.clientId ? DATA.CLIENTS.find(c=>c.id===project.clientId) : null;
  const [open, setOpen] = useState('INV-0014');

  return (
    <div className="page wide">
      <PageHead project={project} />

      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
        <h2 style={{margin:0, fontSize:18, fontWeight:600, letterSpacing:'-0.01em'}}>Invoices</h2>
        <button className="btn"><Glyph.Plus /> New invoice</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap:16}}>
        <div className="tbl">
          <div className="tbl-head" style={{gridTemplateColumns:'1fr 80px'}}>
            <div>Number</div>
            <div style={{textAlign:'right'}}>Amount</div>
          </div>
          {[
            { n: 'INV-0014', s: 'draft', amt: 4205 },
            { n: 'INV-0011', s: 'sent',  amt: 2300 },
            { n: 'INV-0008', s: 'paid',  amt: 6720 },
            { n: 'INV-0005', s: 'paid',  amt: 4900 },
          ].map(inv => (
            <div key={inv.n} className="tbl-row" style={{gridTemplateColumns:'1fr 80px', cursor:'pointer', background: open===inv.n ? '#fafaf8' : undefined}} onClick={()=>setOpen(inv.n)}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <span className="mono" style={{fontWeight:600}}>{inv.n}</span>
                <span className="inv-status" data-s={inv.s}>{inv.s}</span>
              </div>
              <div className="num" style={{textAlign:'right', fontWeight:500}}>{fmtMoney(inv.amt)}</div>
            </div>
          ))}
        </div>

        <Invoice project={project} client={client} number={open} />
      </div>
    </div>
  );
}

function Invoice({ project, client, number }) {
  const isDraft = number === 'INV-0014';
  const lines = [
    { d: 'Pricing page redesign — implementation', q: 6, rate: project.rate || 120, t: 6*(project.rate||120) },
    { d: 'Hero motion exploration', q: 4, rate: project.rate || 120, t: 4*(project.rate||120) },
    { d: 'Project meeting · May 20', q: 0.5, rate: project.rate || 120, t: 0.5*(project.rate||120) },
  ];
  const subtotal = lines.reduce((s,l)=>s+l.t,0);
  const taxRate = 0.085;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="invoice">
      <div className="inv-head">
        <div>
          <div className="inv-num">{number}</div>
          <div className="inv-meta">
            Issued {fmtDate('2026-05-19')}<br/>
            Due {fmtDate('2026-06-02')}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <span className="inv-status" data-s={isDraft?'draft':'sent'}>{isDraft?'Draft':'Sent'}</span>
          <div className="inv-meta" style={{marginTop:8}}>SoloDesk · Ramy<br/>Workspace</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24}}>
        <div>
          <div style={{fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>Bill to</div>
          <div style={{fontWeight:600}}>{client?.company || 'Standalone'}</div>
          <div className="inv-meta">{client?.contact}</div>
        </div>
        <div>
          <div style={{fontSize:11, color:'var(--fg-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4}}>Project</div>
          <div style={{fontWeight:600}}>{project.name}</div>
          <div className="inv-meta">Rate <span className="mono">{fmtMoney(project.rate)}/h</span></div>
        </div>
      </div>

      <table className="inv-lines">
        <thead>
          <tr><th>Description</th><th style={{width:60, textAlign:'right'}}>Qty</th><th style={{width:90, textAlign:'right'}}>Rate</th><th style={{width:100, textAlign:'right'}}>Amount</th></tr>
        </thead>
        <tbody>
          {lines.map((l,i) => (
            <tr key={i}>
              <td>{l.d}</td>
              <td className="num">{l.q}</td>
              <td className="num">{fmtMoney(l.rate)}</td>
              <td className="num">{fmtMoney(l.t)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="inv-totals">
        <tbody>
          <tr><td>Subtotal</td><td className="num">{fmtMoney(subtotal)}</td></tr>
          <tr><td>Tax · 8.5%</td><td className="num">{fmtMoney(tax)}</td></tr>
          <tr className="grand"><td>Total due</td><td className="num">{fmtMoney(total)}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

window.ProjectViews = { Topbar, ProjectOverview, TasksList, Board, TimeView, InvoicesView, TaskRow, PageHead };
