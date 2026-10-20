import React, { useEffect, useMemo, useState } from 'react'
import {
  HeartHandshake, LayoutDashboard, Package, Users, Truck, Leaf, LogOut,
  Plus, Search, MapPin, Clock3, CheckCircle2, CircleAlert, Sprout,
  TrendingUp, Utensils, HandHeart, Building2, UserRound, ArrowRight,
  RotateCcw, X, Menu, ClipboardList, Bike, ChevronDown,
  Soup, Wheat, Apple, Milk, ShieldCheck, Sparkles, Timer
} from 'lucide-react'


const API = '/api'
async function api(path, options = {}) {
  const token = localStorage.getItem('sb_token')
  const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }, ...options })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`)
  return body
}
function normalizeRecord(item) { return { ...item, id: item._id || item.id, created: item.createdAt ? new Date(item.createdAt).getTime() : (item.created || Date.now()) } }

const roles = [
  { id: 'donor', label: 'Donor', desc: 'Share surplus food', icon: Utensils },
  { id: 'charity', label: 'Charity / NGO', desc: 'Coordinate community needs', icon: Building2 },
  { id: 'volunteer', label: 'Volunteer', desc: 'Help deliver donations', icon: Bike },
  { id: 'needy', label: 'Needy', desc: 'Find available food support', icon: HandHeart },
]
const seedDonations = [
  { id: 101, title: 'Fresh vegetable meal boxes', category: 'Cooked meals', quantity: 25, unit: 'meal boxes', location: 'Bhandup West, Mumbai', expiry: 'Today, 7:00 PM', donor: 'Green Plate Cafe', status: 'Available', description: 'Freshly prepared vegetarian meal boxes. Please collect in insulated bags.', created: Date.now() - 100000 },
  { id: 102, title: 'Bakery bread & buns', category: 'Bakery', quantity: 40, unit: 'pieces', location: 'Powai, Mumbai', expiry: 'Today, 8:30 PM', donor: 'Daily Crust Bakery', status: 'Available', description: 'Packed bread and buns from today’s batch.', created: Date.now() - 200000 },
  { id: 103, title: 'Seasonal fruits', category: 'Produce', quantity: 18, unit: 'kg', location: 'Kanjurmarg, Mumbai', expiry: 'Tomorrow, 11:00 AM', donor: 'Fresh Basket Store', status: 'Claimed', description: 'Bananas, apples and oranges. Good condition.', created: Date.now() - 300000 },
  { id: 104, title: 'Packed lunch portions', category: 'Cooked meals', quantity: 15, unit: 'portions', location: 'Vikhroli, Mumbai', expiry: 'Today, 6:30 PM', donor: 'Community Kitchen', status: 'Available', description: 'Vegetarian packed lunch portions.', created: Date.now() - 400000 },
]
const seedRequests = [
  { id: 501, donationId: 103, donationTitle: 'Seasonal fruits', requester: 'Sunrise Community Centre', requesterRole: 'charity', quantity: 10, status: 'Approved', volunteer: 'Aarav S.', location: 'Kanjurmarg, Mumbai', created: Date.now() - 150000 },
]
const seedVolunteers = [
  { id: 601, donationId: 103, title: 'Seasonal fruits', pickup: 'Fresh Basket Store', dropoff: 'Sunrise Community Centre', location: 'Kanjurmarg, Mumbai', status: 'In progress', volunteer: 'Aarav S.' },
]

function readLocal(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('sb_token') || '')
  const [role, setRole] = useState(() => localStorage.getItem('sb_token') ? (localStorage.getItem('sb_role') || '') : '')
  const [userName, setUserName] = useState(() => localStorage.getItem('sb_name') || '')
  const [donations, setDonations] = useState(() => readLocal('sb_donations', seedDonations))
  const [requests, setRequests] = useState(() => readLocal('sb_requests', seedRequests))
  const [deliveries, setDeliveries] = useState(() => readLocal('sb_deliveries', seedVolunteers))
  const [page, setPage] = useState('overview')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const [newDonation, setNewDonation] = useState({ title:'', category:'Cooked meals', quantity:'', unit:'meal boxes', location:'', expiry:'Today, 7:00 PM', description:'' })

  useEffect(() => {
    if (!authToken) return
    let alive = true
    Promise.all([api('/donations'), api('/requests'), api('/deliveries')]).then(([ds, rs, vs]) => {
      if (!alive) return
      setDonations(ds.map(normalizeRecord)); setRequests(rs.map(normalizeRecord)); setDeliveries(vs.map(normalizeRecord))
    }).catch(() => { if (alive) setToast('Backend unavailable — showing saved browser data. Start the backend to sync changes.') })
    return () => { alive = false }
  }, [authToken])
  useEffect(() => localStorage.setItem('sb_donations', JSON.stringify(donations)), [donations])
  useEffect(() => localStorage.setItem('sb_requests', JSON.stringify(requests)), [requests])
  useEffect(() => localStorage.setItem('sb_deliveries', JSON.stringify(deliveries)), [deliveries])
  useEffect(() => { if (role) localStorage.setItem('sb_role', role) }, [role])
  useEffect(() => { if (userName) localStorage.setItem('sb_name', userName) }, [userName])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t) } }, [toast])

  const roleInfo = roles.find(r => r.id === role) || roles[0]
  const available = donations.filter(d => d.status === 'Available')
  const totalMeals = donations.reduce((sum, d) => sum + Number(d.quantity || 0), 0)
  const myRequests = requests.filter(r => role === 'needy' ? r.requester === userName : role === 'charity' ? r.requesterRole === 'charity' : true)
  const filteredDonations = useMemo(() => donations.filter(d => {
    const matchesSearch = `${d.title} ${d.category} ${d.location} ${d.donor}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || d.status === filter
    return matchesSearch && matchesFilter
  }), [donations, search, filter])

  async function signIn(selectedRole, name, email, password, mode) {
    try {
      const result = await api(`/auth/${mode}`, { method:'POST', body:JSON.stringify({ name, email, password, role:selectedRole }) })
      localStorage.setItem('sb_token', result.token)
      localStorage.setItem('sb_role', result.user.role)
      localStorage.setItem('sb_name', result.user.name)
      setAuthToken(result.token); setRole(result.user.role); setUserName(result.user.name); setPage('overview'); setToast(mode === 'register' ? 'Account created successfully' : 'Welcome back!')
    } catch (err) { throw err }
  }
  function signOut() {
    setRole(''); setAuthToken(''); setPage('overview'); localStorage.removeItem('sb_token'); localStorage.removeItem('sb_role'); localStorage.removeItem('sb_name')
  }
  function addDonation(e) {
    e.preventDefault()
    if (!newDonation.title.trim() || !newDonation.quantity || !newDonation.location.trim()) return
    const payload = { ...newDonation, quantity: Number(newDonation.quantity), donor: userName, status: 'Available' }
    api('/donations', { method:'POST', body:JSON.stringify(payload) }).then(saved => {
      const item = normalizeRecord(saved); setDonations(prev => [item, ...prev.filter(x => String(x.id) !== String(item.id))])
      setNewDonation({ title:'', category:'Cooked meals', quantity:'', unit:'meal boxes', location:'', expiry:'Today, 7:00 PM', description:'' })
      setShowForm(false); setToast('Donation published successfully')
    }).catch(err => setToast(err.message || 'Could not save donation. Check backend connection.'))
  }
  function claimDonation(d) {
    if (requests.some(r => String(r.donationId) === String(d.id) && r.requester === userName && r.status !== 'Rejected')) { setToast('You already requested this donation'); return }
    const payload = { donationId:String(d.id), donationTitle:d.title, requester:userName, requesterRole:role, quantity:d.quantity, location:d.location }
    api('/requests', { method:'POST', body:JSON.stringify(payload) }).then(saved => {
      setRequests(prev => [normalizeRecord(saved), ...prev]); setDonations(prev => prev.map(x => String(x.id) === String(d.id) ? {...x, status:'Claimed'} : x))
      setToast('Request sent. Check My Requests for updates.')
    }).catch(err => setToast(err.message || 'Could not send request. Check backend connection.'))
  }

  function approveRequest(req) {
    api(`/requests/${req.id}`, { method:'PATCH', body:JSON.stringify({status:'Approved'}) }).then(saved => {
      setRequests(prev => prev.map(r => String(r.id) === String(req.id) ? normalizeRecord(saved) : r)); setToast('Request approved')
    }).catch(err => setToast(err.message || 'Could not approve request.'))
  }
  function assignDelivery(req) {
    const payload = { donationId:String(req.donationId), title:req.donationTitle, pickup:'Donor location', dropoff:req.requester, location:req.location, status:'Available', volunteer:'Unassigned' }
    api('/deliveries', { method:'POST', body:JSON.stringify(payload) }).then(saved => { setDeliveries(prev => [normalizeRecord(saved), ...prev]); setToast('Delivery task added for volunteers') }).catch(err => setToast(err.message || 'Could not create delivery task.'))
  }
  function updateDelivery(id, status) {
    api(`/deliveries/${id}`, { method:'PATCH', body:JSON.stringify({status, volunteer:userName}) }).then(saved => {
      setDeliveries(prev => prev.map(d => String(d.id) === String(id) ? normalizeRecord(saved) : d)); setToast(`Delivery marked ${status.toLowerCase()}`)
    }).catch(err => setToast(err.message || 'Could not update delivery.'))
  }
  function resetDemo() {
    if (!confirm('Reset all local ShareBite data to demo data?')) return
    setDonations(seedDonations); setRequests(seedRequests); setDeliveries(seedVolunteers)
    setToast('Demo data restored')
  }

  if (!role || !authToken) return <Welcome onSignIn={signIn} />
  const navItems = [
    { id:'overview', label:'Overview', icon:LayoutDashboard },
    { id:'status', label:'Status dashboard', icon:ClipboardList },
    { id:'donations', label:role==='donor'?'My donations':'Browse donations', icon:Package },
    ...(role==='needy' ? [{id:'requests',label:'My requests',icon:ClipboardList}] : []),
    ...(role==='charity' ? [{id:'requests',label:'Manage requests',icon:ClipboardList}] : []),
    ...(role==='volunteer' ? [{id:'deliveries',label:'Delivery tasks',icon:Truck}] : []),
    { id:'impact', label:'Impact & analytics', icon:TrendingUp },
  ]
  const titleMap = { overview:'Overview', status:'Status dashboard', donations:role==='donor'?'My donations':'Food donations', requests:role==='charity'?'Manage requests':'My requests', deliveries:'Delivery tasks', impact:'Impact & analytics' }
  const subtitleMap = {
    donations:'Find, share, and manage food donations near your community.',
    requests:'Keep track of requests and coordinate food support.',
    deliveries:'Help move food from donors to the people who need it.',
    status:'A single view of donation, request and delivery progress.',
    impact:'See the community impact made possible through ShareBite.',
  }
  const pendingCount = requests.filter(r => r.status === 'Pending').length

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><HeartHandshake size={22}/></div>
          <div><strong>ShareBite</strong><span>Giving made simple</span></div>
          <button className="mobile-close" onClick={()=>setMobileNav(false)}><X size={18}/></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${page===item.id ? 'active' : ''}`} onClick={()=>{ setPage(item.id); setMobileNav(false) }}>
              <item.icon size={18}/><span>{item.label}</span>
              {item.id==='requests' && role==='charity' && pendingCount>0 && <i className="nav-count">{pendingCount}</i>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="eco-card">
            <Photo src={foodImage('Produce','sidebar')} className="eco-photo" />
            <div className="eco-body">
              <div className="eco-icon"><Sprout size={18}/></div>
              <strong>Small actions, big impact</strong>
              <p>Every shared meal helps build a kinder community.</p>
            </div>
          </div>
          <button className="nav-item" onClick={resetDemo}><RotateCcw size={17}/><span>Reset demo data</span></button>
          <button className="nav-item signout" onClick={signOut}><LogOut size={17}/><span>Sign out</span></button>
        </div>
      </aside>
      {mobileNav && <div className="mobile-scrim" onClick={()=>setMobileNav(false)} />}

      <main className="main-area">
        <header className="topbar">
          <div className="top-left">
            <button className="menu-btn" onClick={()=>setMobileNav(true)}><Menu size={20}/></button>
            <div className="breadcrumb">Workspace <span>/</span> <strong>{titleMap[page]}</strong></div>
          </div>
          <div className="top-right">
            <div className="status-pill"><span className="live-dot"/> ShareBite workspace</div>
            <div className="user-chip">
              <div className="avatar">{userName.slice(0,1).toUpperCase()}</div>
              <div className="user-chip-text"><strong>{userName}</strong><span>{roleInfo.label}</span></div>
              <ChevronDown size={15}/>
            </div>
          </div>
        </header>

        <section className="page-content">
          {page==='overview' ? (
            <HeroBanner role={role} userName={userName} roleInfo={roleInfo} available={available.length} totalMeals={totalMeals} onAdd={()=>setShowForm(true)} setPage={setPage} />
          ) : (
            <div className="page-heading">
              <div>
                <div className="eyebrow">{roleInfo.label.toUpperCase()} PORTAL</div>
                <h1>{titleMap[page]}</h1>
                <p>{subtitleMap[page]}</p>
              </div>
              {role==='donor' && page==='donations' && <button className="primary-btn" onClick={()=>setShowForm(true)}><Plus size={17}/> Add donation</button>}
            </div>
          )}

          {page==='status' && <StatusDashboard donations={donations} requests={requests} deliveries={deliveries} totalMeals={totalMeals} />}
          {page==='overview' && <Overview role={role} userName={userName} donations={donations} requests={requests} deliveries={deliveries} available={available} totalMeals={totalMeals} setPage={setPage} onClaim={claimDonation} />}
          {page==='donations' && <Donations role={role} userName={userName} donations={role==='donor'?donations.filter(d=>d.donor===userName):filteredDonations} allDonations={donations} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} onClaim={claimDonation} onAdd={()=>setShowForm(true)} />}
          {page==='requests' && <Requests role={role} requests={requests} userName={userName} onApprove={approveRequest} onAssign={assignDelivery} />}
          {page==='deliveries' && <Deliveries deliveries={deliveries} onUpdate={updateDelivery} />}
          {page==='impact' && <Impact donations={donations} requests={requests} deliveries={deliveries} totalMeals={totalMeals} />}

          <footer className="footer"><span>© 2026 ShareBite</span><span><span className="footer-dot"/> Changes sync to the ShareBite database</span></footer>
        </section>
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={()=>setShowForm(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <Photo src={foodImage('Cooked meals','modal')} className="modal-photo">
              <div className="modal-photo-text"><div className="eyebrow light">DONATE FOOD</div><h2>Share a donation</h2><p>List surplus food for your community.</p></div>
              <button className="icon-btn" onClick={()=>setShowForm(false)}><X size={20}/></button>
            </Photo>
            <form onSubmit={addDonation} className="donation-form">
              <label>Donation title<input required value={newDonation.title} onChange={e=>setNewDonation({...newDonation,title:e.target.value})} placeholder="e.g. Fresh lunch boxes"/></label>
              <div className="form-row">
                <label>Category<select value={newDonation.category} onChange={e=>setNewDonation({...newDonation,category:e.target.value})}><option>Cooked meals</option><option>Bakery</option><option>Produce</option><option>Packaged food</option><option>Dairy</option></select></label>
                <label>Quantity<input required type="number" min="1" value={newDonation.quantity} onChange={e=>setNewDonation({...newDonation,quantity:e.target.value})} placeholder="e.g. 20"/></label>
              </div>
              <div className="form-row">
                <label>Unit<select value={newDonation.unit} onChange={e=>setNewDonation({...newDonation,unit:e.target.value})}><option>meal boxes</option><option>portions</option><option>kg</option><option>pieces</option><option>packets</option></select></label>
                <label>Best before<select value={newDonation.expiry} onChange={e=>setNewDonation({...newDonation,expiry:e.target.value})}><option>Today, 6:00 PM</option><option>Today, 7:00 PM</option><option>Today, 8:30 PM</option><option>Tomorrow, 11:00 AM</option></select></label>
              </div>
              <label>Pickup location<input required value={newDonation.location} onChange={e=>setNewDonation({...newDonation,location:e.target.value})} placeholder="Area, city"/></label>
              <label>Notes (optional)<textarea value={newDonation.description} onChange={e=>setNewDonation({...newDonation,description:e.target.value})} placeholder="Food details, pickup instructions..." rows="3"/></label>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={()=>setShowForm(false)}>Cancel</button>
                <button className="primary-btn" type="submit"><Plus size={17}/> Publish donation</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Photos                                                             */
/* ------------------------------------------------------------------ */
const unsplash = (id, w = 1000) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`
const FOOD_POOLS = {
  'Cooked meals': ['1547592180-85f173990554', '1546069901-ba9599a7e63c', '1504674900247-0877df9cc836', '1512621776951-a57141f2eefd'],
  'Bakery': ['1509440159596-0249088772ff', '1555507036-ab1f4038808a', '1586444248902-2f64eddc13df'],
  'Produce': ['1610832958506-aa56368176cf', '1488459716781-31db52582fe9', '1567306226416-28f0efdc88ce', '1542838132-92c53300491e'],
  'Packaged food': ['1604908176997-125f25cc6f3d', '1586201375761-83865001e31c', '1578916171728-46686eac8d58'],
  'Dairy': ['1563636619-e9143da7973b', '1550583724-b2692b85b150', '1486297678162-eb2a19b0a32d'],
}
const SCENE = {
  hero: '1498837167922-ddd27525d352',
  community: '1593113598332-cd288d649433',
  hands: '1488521787991-ed7bbaae773c',
  table: '1504674900247-0877df9cc836',
}
const CATEGORY_ICON = { 'Cooked meals': Soup, 'Bakery': Wheat, 'Produce': Apple, 'Packaged food': Package, 'Dairy': Milk }
function guessCategory(text = '') {
  const t = text.toLowerCase()
  if (/bread|bun|bake|cake|pastry|biscuit|roti/.test(t)) return 'Bakery'
  if (/fruit|veg|produce|apple|banana|orange|mango|salad/.test(t)) return /box|meal|lunch/.test(t) ? 'Cooked meals' : 'Produce'
  if (/milk|dairy|curd|cheese|paneer|butter/.test(t)) return 'Dairy'
  if (/pack|rice|flour|grain|dal|oil/.test(t)) return 'Packaged food'
  return 'Cooked meals'
}
function foodImage(category, seed = '') {
  const cat = FOOD_POOLS[category] ? category : guessCategory(String(seed))
  const pool = FOOD_POOLS[cat]
  let h = 0
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return unsplash(pool[h % pool.length])
}
function categoryOf(d) { return FOOD_POOLS[d.category] ? d.category : guessCategory(d.title || d.donationTitle) }

// Photo with a graceful gradient fallback if the image cannot load (offline, blocked, etc.)
function Photo({ src, alt = '', className = '', children }) {
  const [bad, setBad] = useState(false)
  return (
    <div className={`photo ${className}`}>
      {!bad && <img src={src} alt={alt} loading="lazy" onError={()=>setBad(true)} />}
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Landing / sign-in                                                  */
/* ------------------------------------------------------------------ */
function Welcome({onSignIn}) {
  const [selected, setSelected] = useState('donor')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (mode==='register' && !name.trim()) { setError('Please enter your name or organization name.'); return }
    setBusy(true)
    try { await onSignIn(selected, name, email, password, mode) }
    catch(err) { setError(err.message || 'Could not sign in. Please try again.') }
    finally { setBusy(false) }
  }
  const steps = [
    { n:'01', title:'Donors share surplus food', text:'Restaurants, shops and homes list fresh food that would otherwise go to waste.', cat:'Cooked meals', icon:Utensils },
    { n:'02', title:'Charities & families request', text:'NGOs and people in need browse what is nearby and send a request in one tap.', cat:'Produce', icon:HandHeart },
    { n:'03', title:'Volunteers deliver it', text:'Volunteers pick up approved donations and carry them to the people who need them.', cat:'Bakery', icon:Bike },
  ]
  const roleCards = [
    { ...roles[0], cat:'Cooked meals' }, { ...roles[1], cat:'Packaged food' }, { ...roles[2], cat:'Bakery' }, { ...roles[3], cat:'Produce' },
  ]
  return (
    <div className="landing">
      <header className="land-nav">
        <div className="brand"><div className="brand-mark"><HeartHandshake size={22}/></div><div><strong>ShareBite</strong><span>Giving made simple</span></div></div>
        <nav className="land-links">
          <a href="#how">How it works</a><a href="#roles">Who it’s for</a><a href="#food">Fresh food</a>
        </nav>
        <a className="land-cta" href="#auth">Sign in <ArrowRight size={15}/></a>
      </header>

      <section className="land-hero">
        <Photo src={unsplash(SCENE.hero, 1800)} className="hero-bg" />
        <div className="hero-shade" />
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker"><Leaf size={14}/> FOOD IS MEANT TO BE SHARED</div>
            <h1>Good food.<br/><em>Good people.</em><br/>Greater impact.</h1>
            <p>Connect surplus food with the people who need it. ShareBite brings donors, charities, volunteers, and communities together to reduce food waste and spread kindness.</p>
            <div className="hero-actions">
              <a className="primary-btn big" href="#auth">Get started <ArrowRight size={17}/></a>
              <a className="ghost-btn" href="#how">See how it works</a>
            </div>
            <div className="hero-stats">
              <div><strong>4</strong><span>community roles</span></div>
              <div><strong>One</strong><span>shared purpose</span></div>
              <div><strong>∞</strong><span>ways to help</span></div>
            </div>
          </div>

          <div className="login-card auth-card" id="auth">
            <div className="login-card-head">
              <div className="mini-logo"><HeartHandshake size={20}/></div>
              <h2>{mode==='login'?'Welcome back':'Create your account'}</h2>
              <p>{mode==='login'?'Sign in to continue to your ShareBite workspace.':'Join the community and start making an impact.'}</p>
            </div>
            <div className="auth-tabs">
              <button type="button" className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('')}}>Sign in</button>
              <button type="button" className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('')}}>Create account</button>
            </div>
            <form onSubmit={submit} className="auth-form">
              {mode==='register' && <label className="name-label">Full name / organization<input required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Aarav Sharma or Green Plate Cafe" autoComplete="name"/></label>}
              <label className="name-label">Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></label>
              <label className="name-label">Password<input required type="password" minLength="8" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode==='login'?'current-password':'new-password'}/></label>
              <div className="role-label">Choose your role</div>
              <div className="role-grid">
                {roles.map(r => (
                  <button type="button" key={r.id} onClick={()=>setSelected(r.id)} className={`role-option ${selected===r.id?'selected':''}`}>
                    <div className="role-icon"><r.icon size={19}/></div>
                    <div><strong>{r.label}</strong><span>{r.desc}</span></div>
                    <span className="radio-dot"/>
                  </button>
                ))}
              </div>
              {error && <div className="auth-error"><CircleAlert size={15}/>{error}</div>}
              <button className="primary-btn continue-btn" type="submit" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in securely':'Create account'} <ArrowRight size={17}/></button>
            </form>
            <div className="demo-disclaimer"><ShieldCheck size={14}/> Passwords are securely hashed on the server</div>
          </div>
        </div>
      </section>

      <section className="land-section" id="food">
        <div className="section-head"><div className="eyebrow">WHAT GETS SHARED</div><h2>Fresh, good food — never wasted</h2><p>From hot meals to bakery bread, seasonal produce and dairy: every listing is food that deserves a plate.</p></div>
        <div className="food-strip">
          {Object.keys(FOOD_POOLS).map(c => {
            const Icon = CATEGORY_ICON[c]
            return <Photo key={c} src={foodImage(c, 'strip')} alt={c} className="strip-tile"><div className="strip-label"><Icon size={16}/>{c}</div></Photo>
          })}
        </div>
      </section>

      <section className="land-section" id="how">
        <div className="section-head"><div className="eyebrow">HOW IT WORKS</div><h2>From surplus to supper in three steps</h2><p>A simple flow that keeps everyone connected — from the kitchen to the doorstep.</p></div>
        <div className="steps-grid">
          {steps.map(s => (
            <div className="step-card" key={s.n}>
              <Photo src={foodImage(s.cat, s.title)} alt="" className="step-photo"><span className="step-num">{s.n}</span></Photo>
              <div className="step-body"><div className="step-icon"><s.icon size={20}/></div><h3>{s.title}</h3><p>{s.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="land-section" id="roles">
        <div className="section-head"><div className="eyebrow">WHO IT’S FOR</div><h2>There’s a place for everyone</h2><p>Pick the role that fits you and jump straight in.</p></div>
        <div className="roles-showcase">
          {roleCards.map(r => (
            <a href="#auth" key={r.id} className="role-card" onClick={()=>setSelected(r.id)}>
              <Photo src={foodImage(r.cat, r.id)} alt="" className="role-card-photo" />
              <div className="role-card-shade" />
              <div className="role-card-body"><div className="role-card-icon"><r.icon size={20}/></div><strong>{r.label}</strong><span>{r.desc}</span><em>Join as {r.label} <ArrowRight size={14}/></em></div>
            </a>
          ))}
        </div>
      </section>

      <section className="land-band">
        <Photo src={unsplash(SCENE.community, 1600)} className="band-bg" />
        <div className="band-shade" />
        <div className="band-inner">
          <Sparkles size={26}/>
          <h2>Every meal shared is a little hope delivered.</h2>
          <p>Join your community and help turn extra food into real support.</p>
          <a className="primary-btn big light" href="#auth">Create your account <ArrowRight size={17}/></a>
        </div>
      </section>

      <footer className="land-footer"><span>© 2026 ShareBite</span><span>Built for a more thoughtful food system <HeartHandshake size={14}/></span></footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Workspace screens                                                  */
/* ------------------------------------------------------------------ */
function HeroBanner({role,userName,roleInfo,available,totalMeals,onAdd,setPage}) {
  const cta = role==='donor'
    ? { label:'Add a donation', icon:Plus, run:onAdd }
    : role==='volunteer'
      ? { label:'View delivery tasks', icon:Truck, run:()=>setPage('deliveries') }
      : { label:'Browse available food', icon:Search, run:()=>setPage('donations') }
  return (
    <section className="hero-banner">
      <Photo src={unsplash(SCENE.table, 1600)} className="banner-bg" />
      <div className="banner-shade" />
      <div className="banner-content">
        <div className="eyebrow light">{roleInfo.label.toUpperCase()} PORTAL</div>
        <h1>Welcome back, {userName.split(' ')[0]}!</h1>
        <p>Here’s what’s happening in your food-sharing community today.</p>
        <div className="banner-actions">
          <button className="primary-btn big light" onClick={cta.run}><cta.icon size={17}/> {cta.label}</button>
          <div className="banner-chip"><Utensils size={15}/> {totalMeals.toLocaleString()} portions listed</div>
          <div className="banner-chip"><Package size={15}/> {available} available now</div>
        </div>
      </div>
    </section>
  )
}
function StatCard({icon:Icon,label,value,detail,tone='green'}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div className="stat-info"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>
}
function Overview({role,userName,donations,requests,deliveries,available,totalMeals,setPage,onClaim}) {
  const roleRequests = requests.filter(r => role==='needy'?r.requester===userName:role==='charity'?r.requesterRole==='charity':true)
  const recent = donations.slice(0,4)
  const listed = role==='donor' ? donations.filter(d=>d.donor===userName).slice(0,4) : recent.filter(d=>d.status==='Available').slice(0,4)
  const listedAll = role==='donor' ? donations.filter(d=>d.donor===userName) : recent.filter(d=>d.status==='Available')
  const recoveredPct = Math.min(100,Math.round((donations.filter(d=>d.status!=='Available').length/Math.max(1,donations.length))*100))
  return <>
    <div className="stats-grid">
      <StatCard icon={Package} label={role==='donor'?'My donations':'Available donations'} value={role==='donor'?donations.filter(d=>d.donor===userName).length:available.length} detail={role==='donor'?'Food listings created':'Ready to be claimed'} />
      <StatCard icon={Utensils} label="Food portions listed" value={totalMeals.toLocaleString()} detail="Across all local listings" tone="orange"/>
      <StatCard icon={HandHeart} label={role==='charity'?'Community requests':'My requests'} value={roleRequests.length} detail="Requests tracked locally" tone="purple"/>
      <StatCard icon={Truck} label="Deliveries" value={deliveries.length} detail="Tasks in the delivery board" tone="blue"/>
    </div>
    <div className="overview-grid">
      <section className="panel donations-panel">
        <div className="panel-heading">
          <div><h3>{role==='donor'?'Your recent donations':'Available food nearby'}</h3><p>{role==='donor'?'A quick look at your food listings':'Discover food that can be shared today'}</p></div>
          <button className="text-btn" onClick={()=>setPage('donations')}>View all <ArrowRight size={15}/></button>
        </div>
        <div className="donation-list">
          {listed.map(d=><DonationRow key={d.id} d={d} role={role} onClaim={onClaim}/>)}
          {listedAll.length===0 && <EmptyState title="Nothing here yet" text="Food listings will appear here when available."/>}
        </div>
      </section>
      <section className="panel impact-panel">
        <div className="panel-heading"><div><h3>Your community impact</h3><p>Small steps make a real difference</p></div><div className="impact-badge"><Sprout size={16}/></div></div>
        <div className="impact-number"><strong>{Math.round(totalMeals*0.7)}</strong><span>estimated meals shared</span></div>
        <div className="progress-label"><span>Community food recovery</span><strong>{recoveredPct}%</strong></div>
        <div className="progress-track"><div style={{width:`${recoveredPct}%`}}/></div>
        <div className="impact-tip"><Leaf size={17}/><p><strong>Track My Tree</strong><br/>Your helpful actions grow your impact score. Keep sharing and supporting local food recovery.</p></div>
        <button className="secondary-btn full-btn" onClick={()=>setPage('impact')}>Explore impact <ArrowRight size={15}/></button>
      </section>
    </div>
    {role==='volunteer' && <div className="callout-row"><div className="callout-icon"><Truck size={21}/></div><div><strong>Ready to lend a hand?</strong><p>Check delivery tasks and help food reach the right people.</p></div><button className="secondary-btn" onClick={()=>setPage('deliveries')}>View tasks <ArrowRight size={15}/></button></div>}
    {role==='needy' && <div className="callout-row"><div className="callout-icon"><HandHeart size={21}/></div><div><strong>Find food support near you</strong><p>Browse available donations and send a request for what you need.</p></div><button className="secondary-btn" onClick={()=>setPage('donations')}>Browse food <ArrowRight size={15}/></button></div>}
  </>
}
function DonationRow({d,role,onClaim}) {
  return (
    <div className="donation-row">
      <Photo src={foodImage(categoryOf(d), d.title)} alt={d.title} className="food-thumb" />
      <div className="donation-main"><strong>{d.title}</strong><span><MapPin size={12}/>{d.location}</span><small>{d.quantity} {d.unit} · {d.category}</small></div>
      <div className="donation-end">
        <span className={`status ${d.status.toLowerCase()}`}>{d.status}</span>
        {(role==='needy'||role==='charity')&&d.status==='Available'&&<button className="small-action" onClick={()=>onClaim(d)}>Request</button>}
      </div>
    </div>
  )
}
function Donations({role,userName,donations,allDonations,search,setSearch,filter,setFilter,onClaim,onAdd}) {
  const isDonor = role==='donor'
  return <>
    <div className="filter-bar">
      <div className="search-wrap"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search food, category, or location..."/></div>
      <div className="filter-pills">
        {['All','Available','Claimed','Completed'].map(f => <button key={f} type="button" className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}
      </div>
      {isDonor && <button className="primary-btn" onClick={onAdd}><Plus size={17}/> Add donation</button>}
    </div>
    <div className="results-caption">{isDonor?'Your food listings':`${donations.length} food listing${donations.length===1?'':'s'} found`} <span>• Synced with ShareBite database</span></div>
    <div className="donation-cards">
      {donations.map(d => {
        const cat = categoryOf(d); const Icon = CATEGORY_ICON[cat]
        return (
          <div className="food-card" key={d.id}>
            <Photo src={foodImage(cat, d.title)} alt={d.title} className="food-card-art">
              <span className="chip-cat"><Icon size={13}/>{d.category}</span>
              <span className={`status ${d.status.toLowerCase()}`}>{d.status}</span>
            </Photo>
            <div className="food-card-body">
              <h3>{d.title}</h3>
              <p className="food-description">{d.description||'Food donation available for local community collection.'}</p>
              <div className="food-meta">
                <span><Package size={15}/>{d.quantity} {d.unit}</span>
                <span><Clock3 size={15}/>{d.expiry}</span>
                <span><MapPin size={15}/>{d.location}</span>
              </div>
              <div className="food-card-footer">
                <div className="donor-mini"><div className="avatar small">{(d.donor||'D').slice(0,1)}</div><span>{d.donor}</span></div>
                {!isDonor&&(role==='needy'||role==='charity')&&d.status==='Available'&&<button className="small-action" onClick={()=>onClaim(d)}>Request food <ArrowRight size={14}/></button>}
              </div>
            </div>
          </div>
        )
      })}
      {donations.length===0 && <div className="panel empty-panel"><EmptyState title="No matching donations" text="Try another search or change the status filter."/></div>}
    </div>
  </>
}
function Requests({role,requests,userName,onApprove,onAssign}) {
  const visible = role==='charity' ? requests : role==='needy' ? requests.filter(r=>r.requester===userName) : requests
  return (
    <div className="panel table-panel">
      <div className="panel-heading">
        <div><h3>{role==='charity'?'Incoming food requests':'Request history'}</h3><p>{role==='charity'?'Review community requests and coordinate deliveries':'Updates for your food requests'}</p></div>
        <span className="count-badge">{visible.length} total</span>
      </div>
      {visible.length===0 ? <EmptyState title="No requests yet" text="New food requests will show up here."/> : (
        <div className="request-list">
          {visible.map(r => (
            <div className="request-row" key={r.id}>
              <Photo src={foodImage('', r.donationTitle)} alt="" className="request-photo" />
              <div className="request-details"><strong>{r.donationTitle}</strong><span>Requested by {r.requester} · {r.quantity} portions</span><small><MapPin size={12}/>{r.location}</small></div>
              <div className="request-actions">
                <span className={`status ${r.status.toLowerCase()}`}>{r.status}</span>
                {role==='charity'&&r.status==='Pending'&&<button className="small-action" onClick={()=>onApprove(r)}>Approve</button>}
                {role==='charity'&&r.status==='Approved'&&<button className="small-action" onClick={()=>onAssign(r)}>Arrange delivery</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
function Deliveries({deliveries,onUpdate}) {
  return (
    <div className="delivery-grid">
      {deliveries.map(d => (
        <div className="delivery-card" key={d.id}>
          <Photo src={foodImage('', d.title)} alt={d.title} className="delivery-photo">
            <div className="delivery-icon"><Truck size={20}/></div>
            <span className={`status ${d.status.toLowerCase().replace(' ','-')}`}>{d.status}</span>
          </Photo>
          <div className="delivery-body">
            <h3>{d.title}</h3>
            <div className="route-line"><div className="route-dot"/><div><small>PICKUP</small><strong>{d.pickup}</strong></div></div>
            <div className="route-line"><div className="route-dot end"/><div><small>DROP-OFF</small><strong>{d.dropoff}</strong></div></div>
            <div className="delivery-location"><MapPin size={14}/>{d.location}</div>
            {d.status==='Available'
              ? <button className="primary-btn full-btn" onClick={()=>onUpdate(d.id,'In progress')}>Accept delivery <ArrowRight size={15}/></button>
              : d.status==='In progress'
                ? <button className="secondary-btn full-btn" onClick={()=>onUpdate(d.id,'Completed')}><CheckCircle2 size={15}/> Mark delivered</button>
                : <div className="completed-note"><CheckCircle2 size={16}/> Completed by {d.volunteer}</div>}
          </div>
        </div>
      ))}
      {deliveries.length===0 && <div className="panel empty-panel"><EmptyState title="No delivery tasks" text="Approved requests can be turned into delivery tasks by a charity."/></div>}
    </div>
  )
}
function StatusDashboard({donations,requests,deliveries,totalMeals}) {
  const donationGroups = [{label:'Available',count:donations.filter(x=>x.status==='Available').length,tone:'green'},{label:'Claimed',count:donations.filter(x=>x.status==='Claimed').length,tone:'orange'},{label:'Completed',count:donations.filter(x=>x.status==='Completed').length,tone:'blue'}]
  const requestGroups = ['Pending','Approved','Rejected'].map(label=>({label,count:requests.filter(x=>x.status===label).length,tone:label==='Approved'?'green':label==='Pending'?'orange':'red'}))
  const deliveryGroups = ['Available','In progress','Completed'].map(label=>({label,count:deliveries.filter(x=>x.status===label).length,tone:label==='Completed'?'green':label==='In progress'?'blue':'orange'}))
  const recent = [...donations.map(x=>({...x,kind:'Food donation',when:x.created})),...requests.map(x=>({...x,kind:'Food request',when:x.created})),...deliveries.map(x=>({...x,kind:'Delivery task',when:x.created}))].sort((a,b)=>(b.when||0)-(a.when||0)).slice(0,7)
  return <>
    <div className="status-hero">
      <Photo src={unsplash(SCENE.hands, 1400)} className="status-hero-bg" />
      <div className="status-hero-shade" />
      <div className="status-hero-copy"><span className="eyebrow light">LIVE COMMUNITY SNAPSHOT</span><h2>Everything in one place</h2><p>Track food listings, community requests and deliveries without switching between pages.</p></div>
      <div className="status-hero-mark"><HeartHandshake size={32}/></div>
    </div>
    <div className="stats-grid">
      <StatCard icon={Package} label="Food portions listed" value={totalMeals} detail={`${donations.length} donation listings`}/>
      <StatCard icon={ClipboardList} label="Total requests" value={requests.length} detail="Community support requests" tone="purple"/>
      <StatCard icon={Truck} label="Delivery tasks" value={deliveries.length} detail={`${deliveries.filter(x=>x.status==='Completed').length} completed`} tone="blue"/>
      <StatCard icon={CheckCircle2} label="Completed deliveries" value={deliveries.filter(x=>x.status==='Completed').length} detail="Successfully delivered" tone="orange"/>
    </div>
    <div className="status-columns">
      <StatusGroup title="Food donation status" subtitle="Availability of listed food" groups={donationGroups} icon={Package}/>
      <StatusGroup title="Request status" subtitle="Requests from people and NGOs" groups={requestGroups} icon={ClipboardList}/>
      <StatusGroup title="Delivery status" subtitle="Pickup to successful delivery" groups={deliveryGroups} icon={Truck}/>
    </div>
    <section className="panel activity-panel">
      <div className="panel-heading"><div><h3>Recent activity</h3><p>Latest records across ShareBite</p></div><span className="live-label"><span className="live-dot"/> Database snapshot</span></div>
      {recent.length===0 ? <EmptyState title="No activity yet" text="New donations, requests and delivery updates will appear here."/> : (
        <div className="activity-list">
          {recent.map((item,i)=>(
            <div className="activity-row" key={`${item.kind}-${item.id||i}`}>
              <div className={`activity-icon activity-${item.kind==='Food donation'?'food':item.kind==='Food request'?'request':'delivery'}`}>{item.kind==='Food donation'?<Package size={17}/>:item.kind==='Food request'?<ClipboardList size={17}/>:<Truck size={17}/>}</div>
              <div className="activity-copy"><strong>{item.title||item.donationTitle||item.kind}</strong><span>{item.kind} · {item.location||item.dropoff||'Community'}</span></div>
              <span className={`status ${String(item.status||'').toLowerCase().replace(' ','-')}`}>{item.status||'Recorded'}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  </>
}
function StatusGroup({title,subtitle,groups,icon:Icon}) {
  const total = Math.max(1, groups.reduce((s,g)=>s+g.count,0))
  return (
    <section className="panel status-group">
      <div className="status-group-head"><div className="status-group-icon"><Icon size={18}/></div><div><h3>{title}</h3><p>{subtitle}</p></div></div>
      {groups.map(g=>(
        <div className="status-count-row" key={g.label}>
          <div className="status-count-top"><span><i className={`status-dot ${g.tone}`}/>{g.label}</span><strong>{g.count}</strong></div>
          <div className="mini-bar"><i className={g.tone} style={{width:`${(g.count/total)*100}%`}}/></div>
        </div>
      ))}
    </section>
  )
}
function Impact({donations,requests,deliveries,totalMeals}) {
  const complete = deliveries.filter(d=>d.status==='Completed').length
  const claimed = donations.filter(d=>d.status!=='Available').length
  const categories = ['Cooked meals','Bakery','Produce','Packaged food','Dairy']
  const max = Math.max(1,...categories.map(c=>donations.filter(d=>d.category===c).length))
  return <>
    <div className="stats-grid">
      <StatCard icon={Sprout} label="Food units listed" value={totalMeals} detail="Quantity across all donations"/>
      <StatCard icon={HeartHandshake} label="Requests tracked" value={requests.length} detail="Community food requests" tone="purple"/>
      <StatCard icon={CheckCircle2} label="Completed deliveries" value={complete} detail="Delivery tasks completed" tone="blue"/>
      <StatCard icon={TrendingUp} label="Listings claimed" value={claimed} detail="No longer available" tone="orange"/>
    </div>
    <div className="overview-grid">
      <section className="panel chart-panel">
        <div className="panel-heading"><div><h3>Donation categories</h3><p>Breakdown of food shared in your community</p></div></div>
        <div className="bar-chart">
          {categories.map((c,i)=>{
            const count=donations.filter(d=>d.category===c).length; const Icon=CATEGORY_ICON[c]
            return <div className="bar-row" key={c}><span><Icon size={15}/>{c}</span><div className="bar-track"><div className={`bar-fill fill-${i}`} style={{width:`${count/max*100}%`}}/></div><strong>{count}</strong></div>
          })}
        </div>
        <div className="chart-footnote">Calculated from the current ShareBite database records.</div>
      </section>
      <section className="panel tree-panel">
        <Photo src={foodImage('Produce','tree')} className="tree-photo"><div className="tree-circle"><Sprout size={34}/></div></Photo>
        <div className="tree-body">
          <div className="eyebrow centered">TRACK MY TREE</div>
          <h3>Your kindness is growing</h3>
          <p>Earn impact points by sharing food, requesting support responsibly, and completing deliveries.</p>
          <div className="points-line"><span><Leaf size={16}/> Community points</span><strong>{donations.filter(d=>d.status!=='Available').length*20+complete*30+requests.length*10}</strong></div>
          <div className="tree-level"><span>Seedling</span><span>Growing tree</span></div>
          <div className="progress-track"><div style={{width:`${Math.min(100,claimed*12+complete*15)}%`}}/></div>
        </div>
      </section>
    </div>
  </>
}
function EmptyState({title,text}) { return <div className="empty-state"><div><Package size={23}/></div><strong>{title}</strong><p>{text}</p></div> }

export default App
