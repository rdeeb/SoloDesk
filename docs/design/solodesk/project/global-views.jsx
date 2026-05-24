/* Global views: Dashboard, Inbox, Activity, Clients list, Projects list, Settings, Trash */
const { useState: useStateG } = React;

/* ---- Dashboard ---- */
function Dashboard({ onOpenProject, onOpenTask }) {
  const allTasks = DATA.TASKS;
  const open = allTasks.filter(t => t.statusId !== 'done').length;
  const overdue = allTasks.filter(t => t.dueDate && isOverdue(t.dueDate) && t.statusId !== 'done').length;
  const totalBudget = DATA.PROJECTS.reduce((s,p) => s+(p.budget||0), 0);

  return (
    <div className="page wide">
      <div className="page-head">
        <div className="page-emoji outline">◆</div>
        <div>
          <h1 className="page-title">Good morning, Ramy</h1>
          <div className="page-subtitle">
            <span><span className="mono">Thursday, May 21</span> · {DATA.PROJECTS.filter(p=>p.status==='active').length} active projects · {open} open tasks</span>
          </div>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="kpi-label"><Glyph.Briefcase /> Active projects</div><div className="kpi-value">{DATA.PROJECTS.filter(p=>p.status==='active').length}</div><div className="kpi-delta">{DATA.PROJECTS.length} total</div></div>
        <div className="kpi"><div className="kpi-label"><Glyph.List /> Open tasks</div><div className="kpi-value">{open}</div><div className="kpi-delta"><span className="num">{overdue}</span> overdue</div></div>
        <div className="kpi"><div className="kpi-label"><Glyph.Clock /> Logged · this week</div><div className="kpi-value">28.5<span style={{fontSize:18}}>h</span></div><div className="kpi-delta"><span className="num">22.1h</span> billable</div></div>
        <div className="kpi"><div className="kpi-label"><Glyph.Receipt /> Unbilled</div><div className="kpi-value">{fmtMoney(3204)}</div><div className="kpi-delta">across <span className="num">3</span> projects</div></div>
      </div>

      <div className="split">
        <div>
          <div className="section-title">Today<div className="right"><span className="mono" style={{color:'var(--fg-muted)'}}>5 items</span></div></div>
          <div className="tbl">
            <div className="tbl-head" style={{gridTemplateColumns: '24px 1fr 140px 110px 84px'}}>
              <div></div>
              <div>Task</div>
              <div>Project</div>
              <div>Status</div>
              <div style={{textAlign:'right'}}>Due</div>
            </div>
            {DATA.TASKS.filter(t => t.statusId !== 'done').slice(0,6).map(t => {
              const p = DATA.PROJECTS.find(x => x.id === t.projectId);
              const status = DATA.STATUSES.find(s=>s.id===t.statusId);
              const SG = Glyph[status.glyph];
              const overdue = t.dueDate && isOverdue(t.dueDate);
              return (
                <div key={t.id} className="tbl-row" style={{gridTemplateColumns:'24px 1fr 140px 110px 84px', cursor:'pointer'}} onClick={()=>onOpenTask?.(t)}>
                  <button className="task-check"><Glyph.Check /></button>
                  <div className="ttl" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t.title}</div>
                  <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12}}>
                    <span style={{
                      width:14, height:14, borderRadius:3, background:'#0e0e10', color:'#fff',
                      display:'inline-grid', placeItems:'center', fontWeight:700, fontSize:8
                    }}>{p?.glyph}</span>
                    <span className="muted">{p?.name.split(' · ').slice(-1)[0]}</span>
                  </div>
                  <div><span className="row-status"><SG size={12}/><span>{status.name}</span></span></div>
                  <div className={"num " + (overdue?'':'muted')} style={{textAlign:'right', color:overdue?'#0e0e10':undefined, fontWeight:overdue?600:400}}>{fmtDate(t.dueDate)}</div>
                </div>
              );
            })}
          </div>

          <div className="section-title" style={{marginTop:28}}>Active projects</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            {DATA.PROJECTS.filter(p=>p.status==='active').map(p => {
              const tcount = DATA.TASKS.filter(t => t.projectId === p.id && t.statusId !== 'done').length;
              return (
                <div key={p.id} onClick={()=>onOpenProject(p.id)}
                  style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', padding:14, background:'#fff', cursor:'pointer'}}>
                  <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                    <div style={{width:32, height:32, borderRadius:7, background:'#0e0e10', color:'#fff', display:'grid', placeItems:'center', fontWeight:700, fontSize:13}}>{p.glyph}</div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontWeight:600, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.name.split(' · ').slice(-1)[0] || p.name}</div>
                      <div style={{fontSize:11.5, color:'var(--fg-muted)'}}>{p.clientId ? DATA.CLIENTS.find(c=>c.id===p.clientId).name : 'Personal'}</div>
                    </div>
                    <span className="mono" style={{fontSize:12, color:'var(--fg-muted)'}}>{tcount} open</span>
                  </div>
                  <div style={{height:5, background:'#eee', borderRadius:3, overflow:'hidden', marginBottom:8}}>
                    <div style={{height:'100%', width:(p.progress*100)+'%', background:'#0e0e10'}} />
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--fg-muted)'}}>
                    <span><span className="mono">{Math.round(p.progress*100)}%</span> complete</span>
                    <span>Due <span className="mono">{fmtDate(p.dueDate)}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="section-title">Recent activity</div>
          <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', background:'#fff', overflow:'hidden'}}>
            {[
              { ico:'Check', text:'Logged 1h 30m on Sync conflict resolution UI', when:'2h ago' },
              { ico:'File',  text:'Edited "Northwind — Site brief"', when:'4h ago' },
              { ico:'Receipt', text:'Created draft invoice INV-0014', when:'Yesterday' },
              { ico:'Plus',  text:'Added task "Cross-browser QA pass"', when:'Yesterday' },
              { ico:'Check', text:'Marked "Type scale: tighten lockup" done', when:'May 19' },
              { ico:'Briefcase', text:'Created project Personal · Portfolio 2026', when:'May 18' },
            ].map((it, i) => {
              const G = Glyph[it.ico];
              return (
                <div key={i} style={{display:'flex', gap:10, padding:'10px 12px', borderBottom: i===5? 'none':'1px solid var(--line)', alignItems:'flex-start'}}>
                  <span style={{width:24, height:24, borderRadius:'50%', background:'#fafaf8', border:'1px solid var(--line)', display:'grid', placeItems:'center', flexShrink:0, marginTop:1}}>
                    <G size={12} />
                  </span>
                  <div style={{flex:1, fontSize:13}}>
                    <div>{it.text}</div>
                    <div className="muted" style={{fontSize:11.5, marginTop:2}}>{it.when}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="section-title" style={{marginTop:24}}>Overdue</div>
          <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', background:'#fff'}}>
            {DATA.TASKS.filter(t => t.dueDate && isOverdue(t.dueDate) && t.statusId !== 'done').slice(0,4).map(t => (
              <div key={t.id} style={{display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderBottom:'1px solid var(--line)', cursor:'pointer'}} onClick={()=>onOpenTask?.(t)}>
                <Glyph.Flag size={12} />
                <span style={{flex:1, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t.title}</span>
                <span className="mono" style={{fontSize:12, fontWeight:600}}>{fmtDate(t.dueDate)}</span>
              </div>
            ))}
            <div style={{padding:'10px 12px', textAlign:'center', fontSize:12, color:'var(--fg-muted)', cursor:'pointer'}}>View all overdue</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Inbox ---- */
function Inbox() {
  const items = [
    { who:'Mara Chen', proj:'NW', text:'Sent copy for the about page draft', when:'10m ago', unread: true },
    { who:'You', proj:'NW', text:'Reminder: review hero motion directions before Friday', when:'2h ago', unread: true },
    { who:'Jordan Wells', proj:'AS', text:'Approved sync conflict spec — ready to start build', when:'Yesterday', unread: true },
    { who:'You', proj:'P1', text:'INV-0011 marked sent', when:'May 18', unread: false },
    { who:'Sam Park', proj:'FB', text:'Holding on tasting notes until next week', when:'May 15', unread: false },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-emoji outline">☉</div>
        <div>
          <h1 className="page-title">Inbox</h1>
          <div className="page-subtitle">Mentions, comments, and reminders · <span className="mono">3 unread</span></div>
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
        <div style={{display:'flex', gap:6}}>
          <button className="topbar-act" style={{background:'var(--bg-side-active)', color:'var(--fg)'}}>All</button>
          <button className="topbar-act">Mentions</button>
          <button className="topbar-act">Due today</button>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button className="topbar-act"><Glyph.Check /> Mark all read</button>
        </div>
      </div>
      <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', background:'#fff', overflow:'hidden'}}>
        {items.map((it, i) => (
          <div key={i} style={{display:'flex', gap:12, padding:'12px 14px', borderBottom: i===items.length-1?'none':'1px solid var(--line)', alignItems:'flex-start', cursor:'pointer', position:'relative'}}>
            {it.unread && <span style={{position:'absolute', left:4, top:'50%', transform:'translateY(-50%)', width:6, height:6, borderRadius:'50%', background:'#0e0e10'}} />}
            <div style={{width:28, height:28, borderRadius:'50%', background:'#0e0e10', color:'#fff', display:'grid', placeItems:'center', fontWeight:600, fontSize:11, flexShrink:0}}>{it.who.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:2}}>
                <span style={{fontWeight: it.unread?600:500, fontSize:13.5}}>{it.who}</span>
                <span style={{
                  width:16, height:16, borderRadius:3, background:'#fafaf8', border:'1px solid var(--line)',
                  display:'inline-grid', placeItems:'center', fontWeight:700, fontSize:8, color:'var(--fg)'
                }}>{it.proj}</span>
                <span className="mono" style={{fontSize:11, color:'var(--fg-muted)', marginLeft:'auto'}}>{it.when}</span>
              </div>
              <div style={{fontSize:13, color:'var(--fg)', lineHeight:1.5}}>{it.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Activity ---- */
function Activity() {
  const days = [
    { date: 'Today · May 21', items: [
      { ico:'Check', text:'Logged 1h 30m on Sync conflict resolution UI', proj:'AS' },
      { ico:'File',  text:'Edited "Northwind — Site brief"', proj:'NW' },
    ]},
    { date: 'Yesterday · May 20', items: [
      { ico:'Receipt', text:'Created draft invoice INV-0014', proj:'NW' },
      { ico:'Plus',  text:'Added task "Cross-browser QA pass"', proj:'NW' },
      { ico:'Clock',  text:'Logged 2h 15m on Pricing page redesign', proj:'NW' },
    ]},
    { date: 'Monday · May 19', items: [
      { ico:'Check', text:'Marked "Type scale: tighten lockup" done', proj:'NW' },
      { ico:'File',  text:'Created "Atlas v2 — Release checklist"', proj:'AS' },
      { ico:'Briefcase', text:'Created project Personal · Portfolio 2026', proj:'PF' },
    ]},
  ];
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-emoji outline">∿</div>
        <div>
          <h1 className="page-title">Activity</h1>
          <div className="page-subtitle">Everything you've done in this workspace</div>
        </div>
      </div>
      {days.map((d, i) => (
        <div key={i} style={{marginBottom:24}}>
          <div className="section-title">{d.date}</div>
          <div style={{borderLeft:'1px solid var(--line)', marginLeft:14, paddingLeft:18}}>
            {d.items.map((it,j) => {
              const G = Glyph[it.ico];
              return (
                <div key={j} style={{display:'flex', alignItems:'center', gap:12, padding:'8px 0', position:'relative'}}>
                  <span style={{position:'absolute', left:-25, width:10, height:10, borderRadius:'50%', background:'#fff', border:'1px solid var(--line-strong)'}} />
                  <G size={14} />
                  <span style={{flex:1, fontSize:13.5}}>{it.text}</span>
                  <span style={{
                    width:16, height:16, borderRadius:3, background:'#0e0e10', color:'#fff',
                    display:'inline-grid', placeItems:'center', fontWeight:700, fontSize:8
                  }}>{it.proj}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- Clients ---- */
function Clients() {
  return (
    <div className="page wide">
      <div className="page-head">
        <div className="page-emoji outline">☖</div>
        <div>
          <h1 className="page-title">Clients</h1>
          <div className="page-subtitle">{DATA.CLIENTS.length} clients · 3 active</div>
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
        <div style={{display:'flex', gap:6}}>
          <button className="topbar-act"><Glyph.Filter /> Filter</button>
          <button className="topbar-act"><Glyph.Sort /> Sort</button>
        </div>
        <button className="btn" onClick={()=>window.__openNewClient?.()}><Glyph.Plus /> New client</button>
      </div>
      <div className="tbl">
        <div className="tbl-head" style={{gridTemplateColumns: '1fr 1fr 120px 110px 110px'}}>
          <div>Client</div>
          <div>Contact</div>
          <div>Status</div>
          <div style={{textAlign:'right'}}>Rate</div>
          <div style={{textAlign:'right'}}>Projects</div>
        </div>
        {DATA.CLIENTS.map(c => {
          const pc = DATA.PROJECTS.filter(p => p.clientId === c.id).length;
          return (
            <div key={c.id} className="tbl-row" style={{gridTemplateColumns:'1fr 1fr 120px 110px 110px'}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:28, height:28, borderRadius:'50%', background:'#0e0e10', color:'#fff', display:'grid', placeItems:'center', fontWeight:600, fontSize:11}}>{c.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                <div>
                  <div className="ttl">{c.name}</div>
                  <div className="muted" style={{fontSize:11.5}}>{c.company}</div>
                </div>
              </div>
              <div className="muted" style={{fontSize:13}}>{c.contact}</div>
              <div><span className="row-status"><span className="swatch" style={{background: c.status==='active'?'#0e0e10': c.status==='paused'?'#9b9b9f':'#d6d6d2'}} />{c.status}</span></div>
              <div className="num muted" style={{textAlign:'right'}}>{c.rate ? fmtMoney(c.rate) + '/h' : '—'}</div>
              <div className="num" style={{textAlign:'right'}}>{pc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Projects list ---- */
function ProjectsList({ onOpenProject }) {
  return (
    <div className="page wide">
      <div className="page-head">
        <div className="page-emoji outline">P</div>
        <div>
          <h1 className="page-title">Projects</h1>
          <div className="page-subtitle">{DATA.PROJECTS.length} total · {DATA.PROJECTS.filter(p=>p.status==='active').length} active</div>
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
        <div style={{display:'flex', gap:6}}>
          <button className="topbar-act" style={{background:'var(--bg-side-active)', color:'var(--fg)'}}>All</button>
          <button className="topbar-act">Active</button>
          <button className="topbar-act">Paused</button>
          <button className="topbar-act">Archived</button>
        </div>
        <button className="btn" onClick={()=>window.__openNewProject?.()}><Glyph.Plus /> New project</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14}}>
        {DATA.PROJECTS.map(p => {
          const tcount = DATA.TASKS.filter(t => t.projectId === p.id && t.statusId !== 'done').length;
          const client = p.clientId ? DATA.CLIENTS.find(c=>c.id===p.clientId) : null;
          return (
            <div key={p.id} onClick={()=>onOpenProject(p.id)}
              style={{border:'1px solid var(--line)', borderRadius:'var(--r-lg)', padding:18, background:'#fff', cursor:'pointer', display:'flex', flexDirection:'column', gap:14}}>
              <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
                <div style={{width:44, height:44, borderRadius:10, background:'#0e0e10', color:'#fff', display:'grid', placeItems:'center', fontWeight:700, fontSize:16}}>{p.glyph}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:600, fontSize:15, letterSpacing:'-0.01em'}}>{p.name.split(' · ').slice(-1)[0] || p.name}</div>
                  <div style={{fontSize:12, color:'var(--fg-muted)', marginTop:2}}>{client?.name || 'Personal'}</div>
                </div>
                <span className="row-status"><span className="swatch" style={{background: p.status==='active'?'#0e0e10':'#9b9b9f'}} />{p.status}</span>
              </div>
              <div style={{fontSize:13, color:'var(--fg-muted)', lineHeight:1.5}}>{p.description}</div>
              <div>
                <div style={{height:5, background:'#eee', borderRadius:3, overflow:'hidden', marginBottom:8}}>
                  <div style={{height:'100%', width:(p.progress*100)+'%', background:'#0e0e10'}} />
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:11.5, color:'var(--fg-muted)'}}>
                  <span><span className="mono" style={{color:'var(--fg)'}}>{Math.round(p.progress*100)}%</span> complete</span>
                  <span><span className="mono" style={{color:'var(--fg)'}}>{tcount}</span> open</span>
                  <span>Due <span className="mono" style={{color:'var(--fg)'}}>{fmtDate(p.dueDate)}</span></span>
                </div>
              </div>
            </div>
          );
        })}
        <div onClick={()=>window.__openNewProject?.()} style={{border:'1px dashed var(--line-strong)', borderRadius:'var(--r-lg)', padding:18, background:'transparent', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, minHeight:230, color:'var(--fg-muted)'}}>
          <span style={{width:36, height:36, borderRadius:8, background:'#fff', border:'1px solid var(--line)', display:'grid', placeItems:'center'}}><Glyph.Plus /></span>
          <div style={{fontSize:13, fontWeight:500}}>New project</div>
          <div style={{fontSize:11.5}}>Press <span className="kbd">N</span> to create</div>
        </div>
      </div>
    </div>
  );
}

/* ---- Settings ---- */
function Settings() {
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-emoji outline">⚙</div>
        <div>
          <h1 className="page-title">Settings</h1>
          <div className="page-subtitle">Workspace · Local data on this device</div>
        </div>
      </div>

      <div className="section-title">Workspace</div>
      <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', background:'#fff', padding:6}}>
        <SettingsRow label="Workspace name" value="SoloDesk · Ramy" />
        <SettingsRow label="Date format" value="May 21, 2026" />
        <SettingsRow label="Default currency" value="USD" />
        <SettingsRow label="Default hourly rate" value="$120 / h" />
      </div>

      <div className="section-title" style={{marginTop:24}}>Invoicing</div>
      <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', background:'#fff', padding:6}}>
        <SettingsRow label="Invoice prefix" value="INV" />
        <SettingsRow label="Next invoice number" value="0014" />
        <SettingsRow label="Tax" value="Sales tax · 8.5%" />
      </div>

      <div className="section-title" style={{marginTop:24}}>Kanban statuses</div>
      <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', background:'#fff'}}>
        {DATA.STATUSES.map((s, i) => {
          const G = Glyph[s.glyph];
          return (
            <div key={s.id} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderBottom: i===DATA.STATUSES.length-1?'none':'1px solid var(--line)'}}>
              <Glyph.Grip />
              <G size={14} />
              <span style={{flex:1, fontSize:14, fontWeight:500}}>{s.name}</span>
              {s.isDone && <span className="tag">Done state</span>}
              <button className="side-act"><Glyph.More /></button>
            </div>
          );
        })}
      </div>

      <div className="section-title" style={{marginTop:24}}>Data</div>
      <div style={{border:'1px solid var(--line)', borderRadius:'var(--r-md)', background:'#fff', padding:6}}>
        <SettingsRow label="Export backup" value={<button className="btn ghost"><Glyph.Share /> Download JSON</button>} />
        <SettingsRow label="Import data" value={<button className="btn ghost"><Glyph.Link /> Replace from file</button>} />
        <SettingsRow label="Clear all data" value={<button className="btn ghost"><Glyph.Trash /> Reset workspace</button>} />
      </div>
    </div>
  );
}

function SettingsRow({ label, value }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:6}}>
      <span style={{fontSize:13.5, color:'var(--fg)'}}>{label}</span>
      <span style={{fontSize:13, color:'var(--fg-muted)'}}>{value}</span>
    </div>
  );
}

/* ---- Trash ---- */
function Trash() {
  const items = [
    { kind:'Task', glyph:'List', title:'Old onboarding redesign', proj:'NW', when:'May 18' },
    { kind:'Doc', glyph:'File',  title:'Draft pricing v1', proj:'NW', when:'May 14' },
    { kind:'Task', glyph:'List', title:'Logo concepts', proj:'FB', when:'May 10' },
    { kind:'Project', glyph:'Briefcase', title:'Discovery sprint · Q1', proj:'—', when:'Apr 30' },
    { kind:'Doc', glyph:'File',  title:'Old release plan', proj:'AS', when:'Apr 21' },
    { kind:'Task', glyph:'List', title:'Email signature design', proj:'NW', when:'Apr 15' },
  ];
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-emoji outline">◌</div>
        <div>
          <h1 className="page-title">Trash</h1>
          <div className="page-subtitle">Deleted items · permanently removed after 30 days</div>
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
        <span style={{fontSize:13, color:'var(--fg-muted)'}}>{items.length} items</span>
        <button className="btn ghost"><Glyph.Trash /> Empty trash</button>
      </div>
      <div className="tbl">
        <div className="tbl-head" style={{gridTemplateColumns: '24px 1fr 80px 110px 140px'}}>
          <div></div>
          <div>Item</div>
          <div>Type</div>
          <div>Deleted</div>
          <div style={{textAlign:'right'}}>Actions</div>
        </div>
        {items.map((it,i) => {
          const G = Glyph[it.glyph];
          return (
            <div key={i} className="tbl-row" style={{gridTemplateColumns:'24px 1fr 80px 110px 140px'}}>
              <G size={14} />
              <div className="ttl">{it.title}</div>
              <div className="muted" style={{fontSize:12}}>{it.kind}</div>
              <div className="muted num">{it.when}</div>
              <div style={{textAlign:'right', display:'flex', gap:6, justifyContent:'flex-end'}}>
                <button className="topbar-act">Restore</button>
                <button className="topbar-act">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.GlobalViews = { Dashboard, Inbox, Activity, Clients, ProjectsList, Settings, Trash };
