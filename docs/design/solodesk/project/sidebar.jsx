/* Sidebar: dark icon rail + project-aware secondary navigator */
const { useState } = React;

function Rail({ section, setSection, projectId }) {
  const items = [
    { id: 'home',     glyph: 'Home',      label: 'Dashboard' },
    { id: 'inbox',    glyph: 'Inbox',     label: 'Inbox' },
    { id: 'activity', glyph: 'Activity',  label: 'Activity' },
    { id: 'project',  glyph: 'Crosshair', label: 'Current project' },
    { id: 'projects', glyph: 'Briefcase', label: 'All projects' },
    { id: 'clients',  glyph: 'Users',     label: 'Clients' },
  ];

  return (
    <aside className="rail" role="navigation" aria-label="Primary">
      <div className="rail-logo" aria-label="SoloDesk">
        {/* Logo: stacked squares glyph */}
        <svg viewBox="0 0 32 32" fill="none">
          <rect x="3"  y="3"  width="9" height="9" rx="1.5" fill="#fff" />
          <rect x="14" y="3"  width="6" height="6" rx="1.2" fill="#fff" />
          <rect x="22" y="3"  width="7" height="9" rx="1.5" fill="#fff" opacity="0.7"/>
          <rect x="3"  y="14" width="6" height="6" rx="1.2" fill="#fff" opacity="0.7"/>
          <rect x="11" y="14" width="11" height="11" rx="2" fill="#fff" />
          <rect x="24" y="14" width="5" height="5" rx="1" fill="#fff" opacity="0.5"/>
          <rect x="3"  y="22" width="6" height="7" rx="1.2" fill="#fff" opacity="0.5"/>
          <rect x="24" y="21" width="5" height="8" rx="1.2" fill="#fff" opacity="0.7"/>
        </svg>
      </div>
      {items.map((it) => {
        const G = Glyph[it.glyph];
        return (
          <button
            key={it.id}
            className="rail-btn"
            data-active={section === it.id}
            onClick={() => setSection(it.id)}
            aria-label={it.label}
          >
            <G />
            <span className="rail-tip">{it.label}</span>
          </button>
        );
      })}
      <div className="rail-spacer" />
      <button className="rail-btn" data-active={section === 'settings'} onClick={() => setSection('settings')} aria-label="Settings">
        <Glyph.Settings />
        <span className="rail-tip">Settings</span>
      </button>
      <button className="rail-btn" data-active={section === 'trash'} onClick={() => setSection('trash')} aria-label="Trash">
        <Glyph.Trash />
        <span className="rail-tip">Trash</span>
      </button>
      <div style={{height:6}} />
      <button className="rail-avatar" aria-label="Account">R</button>
    </aside>
  );
}

/* ---------- Secondary sidebars per section ---------- */

function SidebarShell({ children, footerText }) {
  return (
    <aside className="side">
      {children}
      <div className="side-footer">
        <span className="dot" />
        <span>{footerText || 'Local-only · Synced to this device'}</span>
      </div>
    </aside>
  );
}

function SearchBox() {
  return (
    <div className="side-search">
      <Glyph.Search />
      <input placeholder="Search projects, tasks, docs…" />
      <kbd>⌘K</kbd>
    </div>
  );
}

/* Sidebar shown when a Project is active — mirrors the reference image */
function ProjectSidebar({ project, view, setView, statusFilter, setStatusFilter, archivedFilter, setArchivedFilter, taskCounts, openSections, toggleSection, onRename }) {
  const counts = taskCounts;

  return (
    <SidebarShell footerText="Saved locally · last edit just now">
      <div className="side-header">
        <div className="side-title">
          <span className="emoji">{project.glyph}</span>
          <span className="side-title-text">{project.name.split(' · ').slice(-1)[0] || project.name}</span>
        </div>
        <button className="side-act" aria-label="More" onClick={() => {}}>
          <Glyph.More />
        </button>
        <button className="side-act" aria-label="Add to project" onClick={()=>window.__openNewProject?.()}>
          <Glyph.Plus />
        </button>
      </div>
      <SearchBox />

      <div className="side-scroll">
        {/* Quick views */}
        <div
          className="side-row"
          data-active={view === 'tasks' && !archivedFilter && !statusFilter}
          onClick={() => { setView('tasks'); setArchivedFilter(false); setStatusFilter(null); }}
        >
          <span className="ico"><Glyph.List /></span>
          <span className="label">All tasks</span>
          <span className="count mono">{counts.all}</span>
        </div>
        <div
          className="side-row"
          data-active={archivedFilter}
          onClick={() => { setView('tasks'); setArchivedFilter(true); setStatusFilter(null); }}
        >
          <span className="ico"><Glyph.Archive /></span>
          <span className="label">Archived</span>
          <span className="count mono">{counts.archived}</span>
        </div>

        <div className="side-divider" />

        {/* Status section — kanban statuses */}
        <Section open={openSections.status} onToggle={() => toggleSection('status')} title="Status" action={
          <button className="side-act" aria-label="Add status"><Glyph.Plus /></button>
        }>
          {DATA.STATUSES.map(s => {
            const G = Glyph[s.glyph];
            const isActive = view === 'tasks' && statusFilter === s.id;
            return (
              <div
                key={s.id}
                className="side-row"
                data-active={isActive}
                onClick={() => { setView('tasks'); setStatusFilter(s.id); setArchivedFilter(false); }}
              >
                <span className="ico"><G /></span>
                <span className="label">{s.name}</span>
                <span className="count mono">{counts.byStatus[s.id] || 0}</span>
              </div>
            );
          })}
          <div className="side-row" data-muted="true">
            <span className="ico"><Glyph.Plus /></span>
            <span className="label">Add status</span>
          </div>
        </Section>

        <div className="side-divider" />

        {/* Pages — project views */}
        <Section open={openSections.pages} onToggle={() => toggleSection('pages')} title="Pages">
          <SideLink active={view==='overview'} onClick={()=>setView('overview')} ico={<Glyph.Eye />} label="Overview" />
          <SideLink active={view==='board'}    onClick={()=>setView('board')}    ico={<Glyph.Board />} label="Board" />
          <SideLink active={view==='tasks'}    onClick={()=>{setView('tasks'); setStatusFilter(null); setArchivedFilter(false);}} ico={<Glyph.List />} label="Tasks" count={counts.all} />
          <SideLink active={view==='docs'}     onClick={()=>setView('docs')}     ico={<Glyph.File />} label="Docs" count={counts.docs} />
          <SideLink active={view==='time'}     onClick={()=>setView('time')}     ico={<Glyph.Clock />} label="Time" />
          <SideLink active={view==='invoices'} onClick={()=>setView('invoices')} ico={<Glyph.Receipt />} label="Invoices" count={1} />
        </Section>

        <div className="side-divider" />

        {/* Recent docs in project */}
        <Section open={openSections.recent} onToggle={() => toggleSection('recent')} title="Recent docs" action={
          <button className="side-act" aria-label="New doc"><Glyph.Plus /></button>
        }>
          {DATA.DOCS.filter(d => d.projectId === project.id).slice(0,4).map(d => (
            <div key={d.id} className="side-row" onClick={()=>setView('doc:'+d.id)} data-active={view === 'doc:'+d.id}>
              <span className="ico"><Glyph.File /></span>
              <span className="label">{d.title}</span>
            </div>
          ))}
        </Section>
      </div>
    </SidebarShell>
  );
}

function SideLink({ ico, label, count, active, onClick }) {
  return (
    <div className="side-row" data-active={active} onClick={onClick}>
      <span className="ico">{ico}</span>
      <span className="label">{label}</span>
      {count != null ? <span className="count mono">{count}</span> : null}
    </div>
  );
}

function Section({ title, open, onToggle, action, children }) {
  return (
    <div>
      <div className="side-section" data-open={open}>
        <div className="side-section-head" onClick={onToggle}>
          <span className="caret"><Glyph.ChevDown size={12} /></span>
          <span>{title}</span>
        </div>
        {action}
      </div>
      {open ? <div>{children}</div> : null}
    </div>
  );
}

/* Sidebar for the global "Projects" section */
function ProjectsSidebar({ activeProjectId, onPickProject, onNew, view, setView }) {
  const grouped = DATA.PROJECT_GROUPS;
  return (
    <SidebarShell>
      <div className="side-header">
        <div className="side-title">
          <span className="emoji">P</span>
          <span className="side-title-text">Projects</span>
        </div>
        <button className="side-act" aria-label="Filter"><Glyph.Filter /></button>
        <button className="side-act" aria-label="New project" onClick={onNew || (()=>window.__openNewProject?.())}><Glyph.Plus /></button>
      </div>
      <SearchBox />
      <div className="side-scroll">
        <SideLink ico={<Glyph.List />} label="All projects" count={DATA.PROJECTS.length} active={view==='all'} onClick={()=>setView('all')} />
        <SideLink ico={<Glyph.Archive />} label="Archived" count={0} />

        <div className="side-divider" />

        {grouped.map(g => (
          <Section key={g.id} title={g.name} open={true} onToggle={()=>{}}>
            {g.ids.map(pid => {
              const p = DATA.PROJECTS.find(x => x.id === pid);
              if (!p) return null;
              return (
                <div key={pid} className="side-row" data-active={activeProjectId === pid} onClick={()=>onPickProject(pid)}>
                  <span className="ico" style={{
                    width:16, height:16, borderRadius:4, background:'#0e0e10', color:'#fff',
                    display:'grid', placeItems:'center', fontSize:9, fontWeight:700, letterSpacing:'-0.04em'
                  }}>{p.glyph}</span>
                  <span className="label">{p.name.split(' · ').slice(-1)[0] || p.name}</span>
                  <span className="count mono">{DATA.TASKS.filter(t => t.projectId===pid && t.statusId !== 'done').length}</span>
                </div>
              );
            })}
          </Section>
        ))}
      </div>
    </SidebarShell>
  );
}

/* Sidebar for global views: Dashboard, Inbox, Activity, Clients, Settings, Trash */
function GlobalSidebar({ section, setSection }) {
  const labelMap = {
    home: { title: 'Dashboard', emoji: '◆' },
    inbox: { title: 'Inbox', emoji: '☉' },
    activity: { title: 'Activity', emoji: '∿' },
    clients: { title: 'Clients', emoji: '☖' },
    settings: { title: 'Settings', emoji: '⚙' },
    trash: { title: 'Trash', emoji: '◌' },
  };
  const cur = labelMap[section] || labelMap.home;

  return (
    <SidebarShell>
      <div className="side-header">
        <div className="side-title">
          <span className="emoji">{cur.emoji}</span>
          <span className="side-title-text">{cur.title}</span>
        </div>
        <button className="side-act" aria-label="More"><Glyph.More /></button>
      </div>
      <SearchBox />
      <div className="side-scroll">
        {section === 'home' && (
          <>
            <SideLink ico={<Glyph.Dot />} label="Today" count={5} active />
            <SideLink ico={<Glyph.Calendar />} label="This week" count={11} />
            <SideLink ico={<Glyph.Flag />} label="Overdue" count={2} />
            <div className="side-divider" />
            <Section title="Pinned projects" open={true} onToggle={()=>{}}>
              {DATA.PROJECTS.filter(p=>p.status==='active').map(p => (
                <div key={p.id} className="side-row" onClick={()=>setSection('project:'+p.id)}>
                  <span className="ico" style={{
                    width:16, height:16, borderRadius:4, background:'#0e0e10', color:'#fff',
                    display:'grid', placeItems:'center', fontSize:9, fontWeight:700
                  }}>{p.glyph}</span>
                  <span className="label">{p.name.split(' · ').slice(-1)[0] || p.name}</span>
                </div>
              ))}
            </Section>
          </>
        )}
        {section === 'inbox' && (
          <>
            <SideLink ico={<Glyph.Dot />} label="Unread" count={3} active />
            <SideLink ico={<Glyph.Check />} label="Done" count={28} />
            <div className="side-divider" />
            <Section title="Filters" open={true} onToggle={()=>{}}>
              <SideLink ico={<Glyph.Flag />} label="Mentions" />
              <SideLink ico={<Glyph.Clock />} label="Due today" />
              <SideLink ico={<Glyph.File />} label="Doc comments" />
            </Section>
          </>
        )}
        {section === 'activity' && (
          <>
            <SideLink ico={<Glyph.List />} label="All activity" active />
            <SideLink ico={<Glyph.Check />} label="Completions" count={42} />
            <SideLink ico={<Glyph.File />} label="Doc edits" count={17} />
            <SideLink ico={<Glyph.Clock />} label="Time logged" count={'14.2h'} />
            <SideLink ico={<Glyph.Receipt />} label="Invoices" count={3} />
          </>
        )}
        {section === 'clients' && (
          <>
            <SideLink ico={<Glyph.List />} label="All clients" count={DATA.CLIENTS.length} active />
            <SideLink ico={<Glyph.Archive />} label="Archived" count={0} />
            <div className="side-divider" />
            <Section title="Contract status" open={true} onToggle={()=>{}}>
              <SideLink ico={<Glyph.Dot />} label="Lead" count={1} />
              <SideLink ico={<Glyph.Dot />} label="Active" count={2} />
              <SideLink ico={<Glyph.Dot />} label="Paused" count={1} />
              <SideLink ico={<Glyph.Dot />} label="Completed" count={0} />
            </Section>
          </>
        )}
        {section === 'settings' && (
          <>
            <SideLink ico={<Glyph.Settings />} label="Workspace" active />
            <SideLink ico={<Glyph.Receipt />} label="Invoicing" />
            <SideLink ico={<Glyph.Clock />} label="Time & rates" />
            <SideLink ico={<Glyph.Board />} label="Kanban statuses" />
            <SideLink ico={<Glyph.Tag />} label="Tags" />
            <div className="side-divider" />
            <Section title="Data" open={true} onToggle={()=>{}}>
              <SideLink ico={<Glyph.Share />} label="Export backup" />
              <SideLink ico={<Glyph.Link />} label="Import" />
              <SideLink ico={<Glyph.Trash />} label="Trash" />
            </Section>
          </>
        )}
        {section === 'trash' && (
          <>
            <SideLink ico={<Glyph.Trash />} label="All deleted" count={6} active />
            <SideLink ico={<Glyph.Briefcase />} label="Projects" count={1} />
            <SideLink ico={<Glyph.List />} label="Tasks" count={3} />
            <SideLink ico={<Glyph.File />} label="Docs" count={2} />
          </>
        )}
      </div>
    </SidebarShell>
  );
}

window.Sidebar = { Rail, ProjectSidebar, ProjectsSidebar, GlobalSidebar };
