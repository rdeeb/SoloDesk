/* SoloDesk — main app */
const { useState: useStateApp, useMemo: useMemoApp, useEffect: useEffectApp } = React;

function App() {
  // Default tweaks
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "density": "default",
    "railVariant": "dark",
    "monoNumerals": true,
    "showCover": true,
    "defaultProject": "p1",
    "defaultView": "tasks"
  }/*EDITMODE-END*/;

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Section: which top-level area is selected
  const [section, setSection] = useStateApp('project'); // home | inbox | activity | project | projects | clients | settings | trash
  // Selected project
  const [projectId, setProjectId] = useStateApp(tweaks.defaultProject);
  // Within a project: which view
  const [view, setView] = useStateApp(tweaks.defaultView); // overview | board | tasks | docs | time | invoices | doc:<id>
  // Sidebar filters
  const [statusFilter, setStatusFilter] = useStateApp(null);
  const [archivedFilter, setArchivedFilter] = useStateApp(false);
  // Sidebar section open state
  const [openSections, setOpenSections] = useStateApp({ status: true, pages: true, recent: true });
  function toggleSection(k) { setOpenSections(s => ({...s, [k]: !s[k]})); }

  // Drawer state
  const [drawer, setDrawer] = useStateApp(null); // null | 'new-project' | 'new-client'
  function openNewProject() { setDrawer('new-project'); }
  function openNewClient()  { setDrawer('new-client'); }
  function closeDrawer()    { setDrawer(null); }

  // Apply density tweak
  useEffectApp(() => {
    document.documentElement.setAttribute('data-density', tweaks.density);
  }, [tweaks.density]);

  // Compute derived
  const project = useMemoApp(() => DATA.PROJECTS.find(p => p.id === projectId) || DATA.PROJECTS[0], [projectId]);
  const tasks = useMemoApp(() => DATA.TASKS.filter(t => t.projectId === project.id), [project.id]);
  const taskCounts = useMemoApp(() => {
    const counts = { all: tasks.filter(t => !t.archived).length, archived: tasks.filter(t => t.archived).length, byStatus: {}, docs: DATA.DOCS.filter(d => d.projectId === project.id).length };
    DATA.STATUSES.forEach(s => counts.byStatus[s.id] = tasks.filter(t => t.statusId === s.id && !t.archived).length);
    return counts;
  }, [tasks, project.id]);

  // Crumbs computed based on section + view
  const crumbs = useMemoApp(() => {
    if (section === 'project' || section.startsWith('project:')) {
      const viewTitle = view.startsWith('doc:')
        ? (DATA.DOCS.find(d => d.id === view.slice(4))?.title || 'Doc')
        : (view.charAt(0).toUpperCase() + view.slice(1));
      return [
        { label: 'Workspace', icon: <Glyph.Home /> },
        { label: project.name.split(' · ').slice(-1)[0] || project.name, glyph: project.glyph, dark: true },
        { label: viewTitle, active: true },
      ];
    }
    const sectionTitle = { home:'Dashboard', inbox:'Inbox', activity:'Activity', projects:'Projects', clients:'Clients', settings:'Settings', trash:'Trash' }[section];
    return [
      { label: 'Workspace', icon: <Glyph.Home /> },
      { label: sectionTitle, active: true },
    ];
  }, [section, view, project]);

  function openProject(pid) {
    setProjectId(pid);
    setSection('project');
    setView('overview');
    setStatusFilter(null);
    setArchivedFilter(false);
  }

  // Expose to children via a simple global (prototype-grade)
  window.__openNewProject = openNewProject;
  window.__openNewClient = openNewClient;

  // Section switch — sync sidebar
  useEffectApp(() => {
    if (section === 'project') {
      // Restore default view if needed
    }
  }, [section]);

  // ----- Sidebar render -----
  function renderSidebar() {
    if (section === 'project') {
      return (
        <Sidebar.ProjectSidebar
          project={project}
          view={view}
          setView={setView}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          archivedFilter={archivedFilter}
          setArchivedFilter={setArchivedFilter}
          taskCounts={taskCounts}
          openSections={openSections}
          toggleSection={toggleSection}
          onRename={() => {}}
        />
      );
    }
    if (section === 'projects') {
      return (
        <Sidebar.ProjectsSidebar
          activeProjectId={projectId}
          onPickProject={(pid)=>openProject(pid)}
          onNew={openNewProject}
          view={'all'}
          setView={()=>{}}
        />
      );
    }
    return <Sidebar.GlobalSidebar section={section} setSection={setSection} />;
  }

  // ----- Main render -----
  function renderMain() {
    // Top bar actions
    const newAction =
      section === 'projects' ? { label: 'New project', onClick: openNewProject } :
      section === 'clients'  ? { label: 'New client',  onClick: openNewClient  } :
      section === 'project'  && view === 'docs' ? { label: 'New doc', onClick: () => {} } :
      section === 'project'  && view === 'tasks' ? { label: 'New task', onClick: () => {} } :
      section === 'project'  && view === 'invoices' ? { label: 'New invoice', onClick: () => {} } :
      section === 'project'  ? null :
      null;

    const actions = (
      <>
        <button className="topbar-act"><Glyph.Share /> Share</button>
        <button className="topbar-act"><Glyph.More /></button>
        {newAction && (
          <button className="btn" onClick={newAction.onClick}><Glyph.Plus /> {newAction.label}</button>
        )}
      </>
    );

    let body;
    if (section === 'home') body = <GlobalViews.Dashboard onOpenProject={openProject} />;
    else if (section === 'inbox') body = <GlobalViews.Inbox />;
    else if (section === 'activity') body = <GlobalViews.Activity />;
    else if (section === 'projects') body = <GlobalViews.ProjectsList onOpenProject={openProject} />;
    else if (section === 'clients') body = <GlobalViews.Clients />;
    else if (section === 'settings') body = <GlobalViews.Settings />;
    else if (section === 'trash') body = <GlobalViews.Trash />;
    else if (section === 'project') {
      if (view === 'overview') body = <ProjectViews.ProjectOverview project={project} tasks={tasks} onView={setView} onOpenTask={() => {}} />;
      else if (view === 'board') body = <ProjectViews.Board project={project} tasks={tasks} />;
      else if (view === 'tasks') body = <ProjectViews.TasksList project={project} tasks={tasks} statusFilter={statusFilter} archivedFilter={archivedFilter} onOpenTask={() => {}} />;
      else if (view === 'docs') body = <DocViews.DocsList project={project} onOpen={(id)=>setView('doc:'+id)} />;
      else if (view === 'time') body = <ProjectViews.TimeView project={project} tasks={tasks} />;
      else if (view === 'invoices') body = <ProjectViews.InvoicesView project={project} />;
      else if (view.startsWith('doc:')) {
        return (
          <div className="main">
            <ProjectViews.Topbar crumbs={crumbs} actions={actions} />
            <DocViews.DocEditor docId={view.slice(4)} project={project} onBack={()=>setView('docs')} />
          </div>
        );
      }
    }

    // Board has its own height handling
    const fullHeight = section === 'project' && view === 'board';

    return (
      <div className="main">
        <ProjectViews.Topbar crumbs={crumbs} actions={actions} />
        <div className="canvas" style={fullHeight ? { padding:0 } : {}}>
          {body}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar.Rail section={section} setSection={(s) => {
        // when switching to "project" go to the current project
        setSection(s);
        if (s === 'project') setView(view.startsWith('doc:') ? view : (view || 'overview'));
      }} projectId={projectId} />
      {renderSidebar()}
      {renderMain()}

      <Drawers.NewProjectDrawer
        open={drawer === 'new-project'}
        onClose={closeDrawer}
        onCreate={(values) => {
          const id = 'p' + Date.now();
          DATA.PROJECTS.unshift({
            id, glyph: values.glyph, name: values.name, clientId: values.clientId,
            description: values.description || 'No description yet.',
            status: values.status, rate: values.rate, budget: values.budget,
            currency: values.currency, startDate: values.startDate, dueDate: values.dueDate,
            progress: 0,
          });
          DATA.PROJECT_GROUPS[0].ids.unshift(id);
          closeDrawer();
          openProject(id);
        }}
      />
      <Drawers.NewClientDrawer
        open={drawer === 'new-client'}
        onClose={closeDrawer}
        onCreate={(client) => {
          DATA.CLIENTS.unshift(client);
          closeDrawer();
        }}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Sidebar">
          <TweakRadio label="Density" value={tweaks.density} onChange={v => setTweak('density', v)} options={[
            { value: 'compact', label: 'Compact' },
            { value: 'default', label: 'Default' },
            { value: 'cozy',    label: 'Cozy' },
          ]} />
        </TweakSection>
        <TweakSection label="Defaults">
          <TweakSelect label="Default project" value={tweaks.defaultProject} onChange={v => setTweak('defaultProject', v)} options={
            DATA.PROJECTS.map(p => ({ value: p.id, label: p.name }))
          } />
          <TweakSelect label="Default view" value={tweaks.defaultView} onChange={v => setTweak('defaultView', v)} options={[
            { value: 'overview', label: 'Overview' },
            { value: 'board',    label: 'Board' },
            { value: 'tasks',    label: 'Tasks' },
            { value: 'docs',     label: 'Docs' },
            { value: 'time',     label: 'Time' },
            { value: 'invoices', label: 'Invoices' },
          ]} />
        </TweakSection>
        <TweakSection label="Jump to">
          <TweakButton label="Open · New project drawer" onClick={openNewProject} />
          <TweakButton label="Open · New client drawer" onClick={openNewClient} />
          <TweakButton label="Dashboard" onClick={() => setSection('home')} />
          <TweakButton label="Atlas · Mobile App v2" onClick={() => openProject('p2')} />
          <TweakButton label="Northwind board" onClick={() => { openProject('p1'); setView('board'); }} />
          <TweakButton label="Open doc · Site brief" onClick={() => { openProject('p1'); setView('doc:d1'); }} />
          <TweakButton label="Invoices view" onClick={() => { openProject('p1'); setView('invoices'); }} />
          <TweakButton label="Settings" onClick={() => setSection('settings')} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
