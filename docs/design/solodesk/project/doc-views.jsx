/* Doc editor + Docs list */
const { useState: useStateD, useRef: useRefD, useEffect: useEffectD } = React;

function DocsList({ project, onOpen }) {
  const docs = project ? DATA.DOCS.filter(d => d.projectId === project.id) : DATA.DOCS.filter(d => d.isStandalone);

  return (
    <div className="page">
      {project ? <ProjectViews.PageHead project={project} /> : (
        <div className="page-head">
          <div className="page-emoji outline">D</div>
          <div>
            <h1 className="page-title">Standalone docs</h1>
            <div className="page-subtitle">Docs not tied to a project · {docs.length} total</div>
          </div>
        </div>
      )}

      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <h2 style={{margin:0, fontSize:18, fontWeight:600, letterSpacing:'-0.01em'}}>{project ? 'Docs' : 'All docs'}</h2>
          <span className="mono" style={{color:'var(--fg-muted)'}}>{docs.length}</span>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button className="topbar-act"><Glyph.Sort /> Sort</button>
          <button className="btn"><Glyph.Plus /> New doc</button>
        </div>
      </div>

      <div className="tbl">
        <div className="tbl-head" style={{gridTemplateColumns: '24px 1fr 140px 110px'}}>
          <div></div>
          <div>Title</div>
          <div>Project</div>
          <div style={{textAlign:'right'}}>Updated</div>
        </div>
        {docs.map(d => {
          const proj = d.projectId ? DATA.PROJECTS.find(p => p.id === d.projectId) : null;
          return (
            <div key={d.id} className="tbl-row" style={{gridTemplateColumns:'24px 1fr 140px 110px', cursor:'pointer'}} onClick={()=>onOpen(d.id)}>
              <Glyph.File />
              <div className="ttl">{d.title}</div>
              <div className="muted" style={{fontSize:12}}>{proj ? proj.name.split(' · ').slice(-1)[0] : 'Standalone'}</div>
              <div className="muted num" style={{textAlign:'right'}}>{fmtDate(d.updatedAt)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Doc editor with slash menu ---- */

const SLASH_OPTS = [
  { id: 'p',    glyph: <span className="mono" style={{fontWeight:600}}>P</span>,  ttl: 'Text',         sub: 'Plain paragraph',           cmd: '/text' },
  { id: 'h1',   glyph: <span className="mono" style={{fontWeight:600}}>H1</span>, ttl: 'Heading 1',    sub: 'Big section heading',       cmd: '/h1' },
  { id: 'h2',   glyph: <span className="mono" style={{fontWeight:600}}>H2</span>, ttl: 'Heading 2',    sub: 'Medium heading',            cmd: '/h2' },
  { id: 'h3',   glyph: <span className="mono" style={{fontWeight:600}}>H3</span>, ttl: 'Heading 3',    sub: 'Small heading',             cmd: '/h3' },
  { id: 'ul',   glyph: <Glyph.GBullet size={14} />,                              ttl: 'Bullet list',  sub: 'Unordered list',            cmd: '/bullet' },
  { id: 'ol',   glyph: <span className="mono" style={{fontWeight:600, fontSize:11}}>1.</span>, ttl: 'Numbered list', sub: 'Ordered list',  cmd: '/num' },
  { id: 'task', glyph: <Glyph.GTask size={14} />,                                ttl: 'To-do list',   sub: 'Checkable items',           cmd: '/todo' },
  { id: 'quote',glyph: <Glyph.GQuote size={14} />,                               ttl: 'Quote',        sub: 'Inline blockquote',         cmd: '/quote' },
  { id: 'code', glyph: <Glyph.GCode size={14} />,                                ttl: 'Code',         sub: 'Code block',                cmd: '/code' },
  { id: 'div',  glyph: <Glyph.GDivider size={14} />,                             ttl: 'Divider',      sub: 'Horizontal rule',           cmd: '/divider' },
];

function DocEditor({ docId, project, onBack }) {
  const doc = DATA.DOCS.find(d => d.id === docId);
  const [body, setBody] = useStateD(DATA.DOC_BODY);
  const [title, setTitle] = useStateD(doc?.title || 'Untitled');
  const [slashOpen, setSlashOpen] = useStateD(false);
  const [slashAt, setSlashAt] = useStateD({ x: 0, y: 0 });
  const [slashIdx, setSlashIdx] = useStateD(0);
  const [slashFilter, setSlashFilter] = useStateD('');
  const docRef = useRefD(null);

  const filteredOpts = SLASH_OPTS.filter(o =>
    !slashFilter || o.ttl.toLowerCase().includes(slashFilter.toLowerCase()) || o.cmd.includes(slashFilter.toLowerCase())
  );

  useEffectD(() => {
    function onKey(e) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        // Open slash menu in center of doc
        const rect = docRef.current?.getBoundingClientRect();
        if (rect) {
          setSlashAt({ x: rect.left + 80, y: rect.top + 160 });
          setSlashOpen(true);
          setSlashFilter('');
          setSlashIdx(0);
          e.preventDefault();
        }
      } else if (slashOpen) {
        if (e.key === 'Escape') { setSlashOpen(false); }
        else if (e.key === 'ArrowDown') { setSlashIdx(i => Math.min(filteredOpts.length-1, i+1)); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { setSlashIdx(i => Math.max(0, i-1)); e.preventDefault(); }
        else if (e.key === 'Enter') { setSlashOpen(false); e.preventDefault(); }
        else if (e.key === 'Backspace' && !slashFilter) { setSlashOpen(false); }
        else if (e.key.length === 1) { setSlashFilter(f => f + e.key); }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slashOpen, slashFilter, filteredOpts.length]);

  return (
    <div className="canvas" style={{position:'relative'}}>
      <div className="page-cover" />
      <div className="doc" ref={docRef}>
        <div style={{display:'flex', alignItems:'center', gap:6, color:'var(--fg-muted)', fontSize:12, marginBottom:14}}>
          <span style={{
            width:24, height:24, borderRadius:6, background:'#0e0e10', color:'#fff',
            display:'inline-grid', placeItems:'center', fontWeight:700, fontSize:11
          }}>{project ? project.glyph : 'D'}</span>
          <span>{project ? project.name : 'Standalone'}</span>
          <Glyph.ChevRight size={12} />
          <span style={{color:'var(--fg)'}}>{doc?.title}</span>
        </div>

        <input
          className="doc-title"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          placeholder="Untitled"
        />

        <div style={{display:'flex', gap:14, marginBottom:24, color:'var(--fg-muted)', fontSize:12}}>
          <span>Last edit · <span className="mono">{fmtDate(doc?.updatedAt)}</span></span>
          <span>Owner · You</span>
          <span style={{display:'inline-flex', alignItems:'center', gap:4}}><Glyph.Link size={12}/> 0 backlinks</span>
        </div>

        {body.map((b, i) => <DocBlock key={b.id} block={b} />)}

        <div style={{marginTop:30, color:'var(--fg-faint)', fontSize:14, fontStyle:'italic', paddingLeft:28}}>
          Press <span className="kbd">/</span> for commands…
        </div>
      </div>

      {slashOpen && (
        <div className="doc-slash" style={{ left: slashAt.x, top: slashAt.y }}>
          <div className="sect">{slashFilter ? `MATCHES /${slashFilter}` : 'BASIC BLOCKS'}</div>
          {filteredOpts.map((o,i) => (
            <div className="opt" key={o.id} data-active={i===slashIdx} onClick={()=>setSlashOpen(false)}>
              <div className="glyph">{o.glyph}</div>
              <div className="meta">
                <span className="ttl">{o.ttl}</span>
                <span className="sub">{o.sub}</span>
              </div>
              <span className="kbd">{o.cmd}</span>
            </div>
          ))}
          {!filteredOpts.length && <div style={{padding:10, fontSize:13, color:'var(--fg-muted)'}}>No matches</div>}
        </div>
      )}
    </div>
  );
}

function DocBlock({ block }) {
  const [done, setDone] = useStateD({});
  const wrapped = (children) => (
    <div className="doc-block">
      <button className="doc-block-handle" tabIndex={-1} aria-label="Drag"><Glyph.Grip /></button>
      <button className="doc-block-handle" tabIndex={-1} style={{left:22}} aria-label="Add"><Glyph.Plus /></button>
      <div style={{paddingLeft:24}}>{children}</div>
    </div>
  );

  switch (block.type) {
    case 'h1': return wrapped(<h1>{block.text}</h1>);
    case 'h2': return wrapped(<h2>{block.text}</h2>);
    case 'h3': return wrapped(<h3>{block.text}</h3>);
    case 'p':  return wrapped(<p>{block.text}</p>);
    case 'ul': return wrapped(<ul>{block.items.map((t,i)=> <li key={i}>{t}</li>)}</ul>);
    case 'ol': return wrapped(<ol>{block.items.map((t,i)=> <li key={i}>{t}</li>)}</ol>);
    case 'quote': return wrapped(<blockquote>{block.text}</blockquote>);
    case 'code': return wrapped(<pre>{block.text}</pre>);
    case 'task': return wrapped(
      <div>
        {block.items.map((it,i) => (
          <div key={i} className={"doc-task " + (done[i] ?? it.done ? 'done' : '')}>
            <button className="task-check" data-checked={done[i] ?? it.done} onClick={()=>setDone({...done, [i]: !(done[i] ?? it.done)})}>
              <Glyph.Check />
            </button>
            <span className="doc-task-text">{it.text}</span>
          </div>
        ))}
      </div>
    );
    case 'callout': return (
      <div className="doc-block">
        <div style={{paddingLeft:24}}>
          <div style={{display:'flex', gap:10, padding:'10px 14px', background:'#fafaf8', border:'1px solid var(--line)', borderRadius:'var(--r-md)'}}>
            <span style={{
              width:22, height:22, borderRadius:'50%', background:'#0e0e10', color:'#fff',
              display:'grid', placeItems:'center', fontWeight:700, fontSize:11, flexShrink:0, marginTop:2
            }}>!</span>
            <p style={{margin:0, fontSize:15, lineHeight:1.55}}>{block.text}</p>
          </div>
        </div>
      </div>
    );
    default: return null;
  }
}

window.DocViews = { DocsList, DocEditor };
