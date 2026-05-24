/* Drawers: New Project + New Client (nestable) */
const { useState: useStateDr, useEffect: useEffectDr } = React;

const PROJECT_STATUSES = [
  { id: 'active',    label: 'Active',    glyph: 'STodo' },
  { id: 'paused',    label: 'Paused',    glyph: 'SBacklog' },
  { id: 'completed', label: 'Completed', glyph: 'SDone' },
  { id: 'archived',  label: 'Archived',  glyph: 'SCanceled' },
];

const CONTRACT_STATUSES = [
  { id: 'lead',      label: 'Lead' },
  { id: 'active',    label: 'Active' },
  { id: 'paused',    label: 'Paused' },
  { id: 'completed', label: 'Completed' },
  { id: 'lost',      label: 'Lost' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'];

const GLYPH_PRESETS = [
  '◆','◇','◉','●','▲','▼','■','□','★','☉','☖','☗','☘','☂','✦','✶','✺','✷',
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
];

function Drawer({ open, onClose, level = 0, children }) {
  useEffectDr(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key !== 'Escape') return;
      // Only the topmost drawer should react. Level-0 must yield to any open level-1.
      if (level === 0 && document.querySelector('.drawer.level-1')) return;
      onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, level]);

  if (!open) return null;
  return (
    <>
      {level === 0 && <div className="drawer-backdrop" onClick={onClose} />}
      <div className={"drawer " + (level === 1 ? 'level-1' : '')} role="dialog" aria-modal="true">
        {children}
      </div>
    </>
  );
}

function GlyphPicker({ value, onChange, onClose }) {
  return (
    <div className="glyph-picker">
      {GLYPH_PRESETS.map(g => (
        <button key={g} type="button" data-active={value === g} onClick={()=>{ onChange(g); onClose(); }}>{g}</button>
      ))}
    </div>
  );
}

/* ----- New Project ----- */
function NewProjectDrawer({ open, onClose, onCreate, defaultClientId }) {
  const [name, setName] = useStateDr('');
  const [glyph, setGlyph] = useStateDr('NP');
  const [clientId, setClientId] = useStateDr(defaultClientId || '');
  const [status, setStatus] = useStateDr('active');
  const [currency, setCurrency] = useStateDr('USD');
  const [rate, setRate] = useStateDr('120');
  const [budget, setBudget] = useStateDr('');
  const [startDate, setStartDate] = useStateDr('2026-05-21');
  const [dueDate, setDueDate] = useStateDr('');
  const [description, setDescription] = useStateDr('');
  const [more, setMore] = useStateDr(false);
  const [showGlyph, setShowGlyph] = useStateDr(false);
  const [showClient, setShowClient] = useStateDr(false);
  const [error, setError] = useStateDr(null);

  // Sync glyph initials with name
  useEffectDr(() => {
    if (!name) { setGlyph('NP'); return; }
    const parts = name.replace(/[^a-zA-Z\s]/g,' ').trim().split(/\s+/);
    const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '');
    setGlyph(initials.toUpperCase() || 'NP');
  }, [name]);

  useEffectDr(() => {
    if (!open) return;
    // Reset on open
    setName(''); setClientId(defaultClientId || ''); setStatus('active');
    setRate('120'); setBudget(''); setDueDate(''); setDescription('');
    setMore(false); setError(null);
  }, [open]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required.'); return; }
    onCreate({
      name: name.trim(), glyph, clientId: clientId || null,
      status, currency,
      rate: rate ? Number(rate) : null,
      budget: budget ? Number(budget) : null,
      startDate, dueDate: dueDate || null,
      description: description.trim(),
    });
  }

  const selectedClient = clientId ? DATA.CLIENTS.find(c => c.id === clientId) : null;

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="drawer-head">
        <button type="button" className="glyph-slot" aria-label="Project icon" onClick={()=>setShowGlyph(s=>!s)}>
          {glyph}
        </button>
        <div className="meta">
          <div className="ttl">New project</div>
          <div className="sub">Projects are the primary workspace in SoloDesk.</div>
        </div>
        <button className="close" onClick={onClose} aria-label="Close"><Glyph.Close /></button>
      </div>

      <div className="drawer-body">
        {showGlyph && (
          <div style={{marginBottom:14}}>
            <div className="form-section-title" style={{marginBottom:6}}>Choose an icon</div>
            <GlyphPicker value={glyph} onChange={setGlyph} onClose={()=>setShowGlyph(false)} />
          </div>
        )}

        <form onSubmit={handleSubmit} id="new-project-form">
          <div className="form-section">
            <div className="field full">
              <label>Name <span className="req">*</span></label>
              <input
                className="input"
                placeholder="e.g. Northwind · Marketing Site"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                autoFocus
              />
              <div className="field-help">Tip — use <span className="kbd">Client · Project</span> for clarity in the sidebar.</div>
            </div>

            <div className="field">
              <label>Client <span className="hint">(optional)</span></label>
              <div className="input-group">
                <select className="select" value={clientId} onChange={(e)=>setClientId(e.target.value)}>
                  <option value="">No client</option>
                  {DATA.CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" className="btn-inline" aria-label="New client" onClick={()=>setShowClient(true)}>
                  <Glyph.Plus />
                </button>
              </div>
              {selectedClient?.rate && <div className="field-help">Default rate from client: <span className="mono">{fmtMoney(selectedClient.rate)}/h</span></div>}
            </div>

            <div className="field">
              <label>Status</label>
              <div className="seg">
                {PROJECT_STATUSES.map(s => {
                  const G = Glyph[s.glyph];
                  return (
                    <button type="button" key={s.id} data-active={status === s.id} onClick={()=>setStatus(s.id)}>
                      <G /> {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="field full">
              <label>Description</label>
              <textarea
                className="textarea"
                placeholder="What's this project about? (you can write the full brief in a doc later)"
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Schedule</div>
            <div className="form-grid">
              <div className="field">
                <label>Start date</label>
                <input className="input mono" type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
              </div>
              <div className="field">
                <label>Due date</label>
                <input className="input mono" type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Money</div>
            <div className="form-grid">
              <div className="field">
                <label>Currency</label>
                <select className="select" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Hourly rate</label>
                <div className="input-group">
                  <span className="adorn">{currency}</span>
                  <input className="input mono" type="number" placeholder="0" value={rate} onChange={(e)=>setRate(e.target.value)} />
                  <span className="adorn right">/h</span>
                </div>
              </div>
              <div className="field full">
                <label>Budget <span className="hint">(optional cap, used for utilization)</span></label>
                <div className="input-group">
                  <span className="adorn">{currency}</span>
                  <input className="input mono" type="number" placeholder="0" value={budget} onChange={(e)=>setBudget(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="disclosure" data-open={more} onClick={()=>setMore(m=>!m)}>
              <span>Advanced — appears in <span className="mono">Project · Settings</span></span>
              <Glyph.ChevRight />
            </div>
            {more && (
              <div style={{display:'grid', gap:12, marginTop:12}}>
                <div className="field">
                  <label>Default kanban statuses</label>
                  <div style={{
                    display:'flex', flexWrap:'wrap', gap:6, padding:'8px 10px',
                    border:'1px solid var(--line)', borderRadius:'var(--r-sm)', background:'#fff'
                  }}>
                    {DATA.STATUSES.map(s => {
                      const G = Glyph[s.glyph];
                      return (
                        <span key={s.id} className="tag" style={{padding:'3px 8px', background:'var(--bg-subtle)'}}>
                          <G size={11} /> {s.name}
                        </span>
                      );
                    })}
                  </div>
                  <div className="field-help">Inherited from workspace. Edit in <span className="kbd">Settings</span>.</div>
                </div>
              </div>
            )}
          </div>

          {error && <div className="field-error" style={{marginTop:10}}><Glyph.Flag size={12} /> {error}</div>}
        </form>
      </div>

      <div className="drawer-foot">
        <div className="left">
          <Glyph.Crosshair size={12} />
          <span>Saved to this device only · <span className="kbd">Esc</span> to close</span>
        </div>
        <div className="right">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="new-project-form" className="btn">
            <Glyph.Plus /> Create project
          </button>
        </div>
      </div>

      <NewClientDrawer
        open={showClient}
        level={1}
        onClose={()=>setShowClient(false)}
        onCreate={(client) => {
          // mock: pretend it was added to data and select it
          DATA.CLIENTS.push(client);
          setClientId(client.id);
          setShowClient(false);
        }}
      />
    </Drawer>
  );
}

/* ----- New Client ----- */
function NewClientDrawer({ open, onClose, onCreate, level = 0 }) {
  const [name, setName] = useStateDr('');
  const [company, setCompany] = useStateDr('');
  const [contact, setContact] = useStateDr('');
  const [email, setEmail] = useStateDr('');
  const [phone, setPhone] = useStateDr('');
  const [website, setWebsite] = useStateDr('');
  const [rate, setRate] = useStateDr('');
  const [currency, setCurrency] = useStateDr('USD');
  const [status, setStatus] = useStateDr('lead');
  const [address, setAddress] = useStateDr('');
  const [notes, setNotes] = useStateDr('');
  const [more, setMore] = useStateDr(false);
  const [error, setError] = useStateDr(null);

  useEffectDr(() => {
    if (!open) return;
    setName(''); setCompany(''); setContact(''); setEmail(''); setPhone(''); setWebsite('');
    setRate(''); setStatus('lead'); setAddress(''); setNotes(''); setMore(false); setError(null);
  }, [open]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Client name is required.'); return; }
    onCreate({
      id: 'c' + Date.now(),
      name: name.trim(), company: company.trim(), contact: contact.trim(),
      email, phone, website,
      rate: rate ? Number(rate) : null,
      currency, status, address, notes,
    });
  }

  const initials = name.split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase() || '?';

  return (
    <Drawer open={open} onClose={onClose} level={level}>
      <div className="drawer-head">
        <div className="glyph-slot outline" aria-hidden="true">{initials}</div>
        <div className="meta">
          <div className="ttl">{level === 1 ? 'New client · attach to project' : 'New client'}</div>
          <div className="sub">Clients are optional containers for projects and invoices.</div>
        </div>
        <button className="close" onClick={onClose} aria-label="Close"><Glyph.Close /></button>
      </div>

      <div className="drawer-body">
        <form onSubmit={handleSubmit} id={"new-client-form-" + level}>
          <div className="form-section">
            <div className="form-grid">
              <div className="field full">
                <label>Name <span className="req">*</span></label>
                <input className="input" placeholder="Person, brand, or workspace name" value={name} onChange={(e)=>setName(e.target.value)} autoFocus />
              </div>
              <div className="field">
                <label>Company</label>
                <input className="input" placeholder="Northwind Labs Inc." value={company} onChange={(e)=>setCompany(e.target.value)} />
              </div>
              <div className="field">
                <label>Contact person</label>
                <input className="input" placeholder="Primary point of contact" value={contact} onChange={(e)=>setContact(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label>Contract status</label>
              <div className="seg">
                {CONTRACT_STATUSES.map(s => (
                  <button type="button" key={s.id} data-active={status === s.id} onClick={()=>setStatus(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Contact</div>
            <div className="form-grid">
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" placeholder="hello@northwind.dev" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input className="input mono" placeholder="+1 (555) 010-0123" value={phone} onChange={(e)=>setPhone(e.target.value)} />
              </div>
              <div className="field full">
                <label>Website</label>
                <div className="input-group">
                  <span className="adorn">https://</span>
                  <input className="input" placeholder="northwind.dev" value={website} onChange={(e)=>setWebsite(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Money</div>
            <div className="form-grid">
              <div className="field">
                <label>Currency</label>
                <select className="select" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Default hourly rate</label>
                <div className="input-group">
                  <span className="adorn">{currency}</span>
                  <input className="input mono" type="number" placeholder="0" value={rate} onChange={(e)=>setRate(e.target.value)} />
                  <span className="adorn right">/h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="disclosure" data-open={more} onClick={()=>setMore(m=>!m)}>
              <span>More — billing address & notes</span>
              <Glyph.ChevRight />
            </div>
            {more && (
              <div style={{display:'grid', gap:12, marginTop:12}}>
                <div className="field">
                  <label>Billing address</label>
                  <textarea className="textarea" placeholder="Address used on invoices" value={address} onChange={(e)=>setAddress(e.target.value)} />
                </div>
                <div className="field">
                  <label>Notes</label>
                  <textarea className="textarea" placeholder="Internal notes (visible only to you)" value={notes} onChange={(e)=>setNotes(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {error && <div className="field-error" style={{marginTop:10}}><Glyph.Flag size={12} /> {error}</div>}
        </form>
      </div>

      <div className="drawer-foot">
        <div className="left">
          <Glyph.Users size={12} />
          <span>Clients can be linked or unlinked anytime</span>
        </div>
        <div className="right">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form={"new-client-form-" + level} className="btn">
            <Glyph.Plus /> Create client
          </button>
        </div>
      </div>
    </Drawer>
  );
}

window.Drawers = { NewProjectDrawer, NewClientDrawer };
