import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass, Users, CalendarDays, UserRound, LogIn, Bell, Plus, Search,
  ArrowUpRight, Code2, Sparkles, ShieldCheck, LogOut, RefreshCw, X, Menu,
  MapPin, Globe, CheckCircle2, Clock, Award, Shield, Lock, Briefcase,
  GraduationCap, Check, AlertCircle, FileText, Send, ChevronRight
} from 'lucide-react';
import {
  api, setToken, loginUrl, logout, adminLogin,
  applyToEvent, getEventApplications, getOrganizerApplications,
  reviewEventApplication, getMyEventApplications, getPendingEvents,
  reviewEvent, getAdminUsers, getAdminDashboard, createPost, requestJoin,
  syncWebEvents
} from './api';

const sampleEvents = [
  {
    id: 'demo1',
    title: 'Campus Innovation Sprint',
    description: 'Build practical solutions with a cross-disciplinary team.',
    venue: 'Online / Campus',
    startsAt: '2026-11-08T09:00:00Z',
    organizerName: 'Innovation Hub'
  },
  {
    id: 'demo2',
    title: 'Open Source Weekend',
    description: 'Contribute to real projects and meet maintainers.',
    venue: 'Online',
    startsAt: '2026-11-15T10:00:00Z',
    organizerName: 'Dev Club'
  }
];

function App() {
  const [me, setMe] = useState(null);
  const [notice, setNotice] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const t = new URLSearchParams(loc.search).get('token');
    if (t) {
      setToken(t);
      window.history.replaceState({}, '', loc.pathname);
    }
    api('/auth/me')
      .then(setMe)
      .catch(() => setMe(null));
  }, [loc.pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [loc.pathname]);

  const isOrganizer = me?.roles?.includes('ORGANIZER') || me?.roles?.includes('ADMIN');
  const isAdmin = me?.roles?.includes('ADMIN');

  return (
    <div className="app-shell">
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={21} />
          </div>
          <span>team<span className="brand-accent">up</span></span>
          <span className="beta">BETA</span>
          <button
            className="mobile-close-btn"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace">
          <div className="avatar">{me?.fullName?.[0] || 'T'}</div>
          <div>
            <b>{me?.fullName || 'Welcome to TeamUp'}</b>
            <small>
              {isAdmin
                ? 'Administrator'
                : isOrganizer
                ? 'Organizer Portal'
                : (me?.email || 'Student Portal')}
            </small>
          </div>
          <span className="online-dot" />
        </div>

        <p className="nav-label">MAIN WORKSPACE</p>
        <nav>
          <NavLink to="/" end><Compass />Discover</NavLink>
          <NavLink to="/events"><CalendarDays />Events</NavLink>
          <NavLink to="/teams"><Users />My teams & projects</NavLink>
          <NavLink to="/matching"><Sparkles />Skill matching</NavLink>
          {isOrganizer && (
            <NavLink to="/organizer" className="nav-highlight">
              <Award />Organizer Portal
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="nav-highlight admin-nav">
              <ShieldCheck />Admin Portal
            </NavLink>
          )}
          <NavLink to="/notifications"><Bell />Notifications</NavLink>
          <NavLink to="/profile"><UserRound />My profile</NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Code2 size={17} /></div>
            <b>Build something great.</b>
            <p>Find people who bring your ideas to life.</p>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              Explore GitHub <ArrowUpRight size={13} />
            </a>
          </div>

          {me ? (
            <button
              className="user-row"
              onClick={async () => {
                await logout();
                setMe(null);
                setNotice('You have signed out.');
                navigate('/login');
              }}
            >
              <div className="avatar avatar-small">{me?.fullName?.[0] || '?'}</div>
              <span>
                <b>{me?.fullName || 'Signed in'}</b>
                <small>{isAdmin ? 'Admin' : isOrganizer ? 'Organizer' : 'Student'} · Sign out</small>
              </span>
              <LogOut size={16} />
            </button>
          ) : (
            <NavLink to="/login" className="user-row" style={{ color: 'var(--blue-600)' }}>
              <div className="avatar avatar-small" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}>
                <LogIn size={15} />
              </div>
              <span>
                <b>Sign In</b>
                <small>Student or Organizer</small>
              </span>
              <ChevronRight size={16} />
            </NavLink>
          )}
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="crumb">
              Workspace <span>/</span> <b>
                {loc.pathname === '/'
                  ? 'Discover'
                  : loc.pathname === '/login'
                  ? 'Choose Access Portal'
                  : loc.pathname === '/admin/login'
                  ? 'Admin Gateway'
                  : loc.pathname === '/admin'
                  ? 'Admin Portal'
                  : loc.pathname === '/organizer'
                  ? 'Organizer Portal'
                  : loc.pathname.slice(1).replace('-', ' ')}
              </b>
            </div>
          </div>
          <div className="top-actions">
            <span className="status-pill"><i /> Platform online</span>
            <button className="icon-button" onClick={() => window.location.reload()} title="Refresh">
              <RefreshCw size={17} />
            </button>
            {me ? (
              <NavLink className="top-avatar" to="/profile" title={me.fullName}>
                {me?.fullName?.[0] || 'U'}
              </NavLink>
            ) : (
              <NavLink to="/login" className="btn btn-primary btn-sm">
                <LogIn size={14} /> Sign In
              </NavLink>
            )}
          </div>
        </header>

        {notice && (
          <div className="notice" onClick={() => setNotice('')}>
            <span>{notice}</span>
            <button>×</button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Discover me={me} />} />
          <Route path="/login" element={<Login me={me} onUserUpdate={setMe} setNotice={setNotice} />} />
          <Route path="/admin/login" element={<AdminLogin me={me} onUserUpdate={setMe} setNotice={setNotice} />} />
          <Route path="/admin" element={<AdminPortal me={me} setNotice={setNotice} onUserUpdate={setMe} />} />
          <Route path="/organizer" element={<OrganizerPortal me={me} onUserUpdate={setMe} setNotice={setNotice} />} />
          <Route path="/events" element={<Events me={me} onUserUpdate={setMe} setNotice={setNotice} />} />
          <Route path="/teams" element={<Teams me={me} setNotice={setNotice} />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile me={me} onChange={setMe} setNotice={setNotice} />} />
          <Route path="/auth/callback" element={<Callback onDone={setMe} />} />
          <Route path="*" element={<Discover me={me} />} />
        </Routes>

        <footer>
          © 2026 TeamUp <span>Made for ambitious students & event organizers</span>
          <span className="footer-right"><ShieldCheck size={13} /> Built for seamless campus collaboration</span>
        </footer>

        {/* Mobile Adaptive Bottom Navigation Bar */}
        <nav className="mobile-bottom-bar" aria-label="Quick Navigation">
          <NavLink to="/" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Compass size={20} />
            <span>Discover</span>
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <CalendarDays size={20} />
            <span>Events</span>
          </NavLink>
          <NavLink to="/teams" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Teams</span>
          </NavLink>
          <NavLink to="/matching" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Sparkles size={20} />
            <span>Match</span>
          </NavLink>
          <button
            type="button"
            className="bottom-nav-item bottom-nav-menu"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open workspace menu"
          >
            <Menu size={20} />
            <span>More</span>
          </button>
        </nav>
      </main>
    </div>
  );
}

function PageHead({ eyebrow, title, sub, action }) {
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="empty-state">
      <Sparkles size={22} />
      <span>{text}</span>
    </div>
  );
}

/* ==========================================================================
   ROLE LOGIN SELECTION PAGE (/login)
   ========================================================================== */

function Login({ me, onUserUpdate, setNotice }) {
  return (
    <div className="login-page-wrap">
      <div className="login-card-container">
        <div className="login-heading">
          <div className="login-badge">
            <Sparkles size={14} /> TeamUp Access
          </div>
          <h1>How would you like to log in?</h1>
          <p>Select your role below to access dedicated tools tailored for your campus journey.</p>
        </div>

        <div className="role-selection-grid">
          {/* Student Access Card */}
          <div className="role-card">
            <div className="role-card-accent" />
            <div className="role-card-icon">
              <GraduationCap size={28} />
            </div>
            <div className="role-card-tag">Student Collaboration</div>
            <h2>Login as Student</h2>
            <p>
              Join ambitious project teams, recruit peers for your own ideas, and apply to attend campus hackathons & workshops.
            </p>
            <ul className="role-feature-list">
              <li><Check size={16} /> Discover & join active student teams</li>
              <li><Check size={16} /> Recruit collaborators for general projects</li>
              <li><Check size={16} /> Apply & register for campus events</li>
              <li><Check size={16} /> AI-assisted skill matching & profile</li>
            </ul>
            <div className="role-actions">
              <a href={loginUrl} className="role-login-btn role-login-primary">
                <LogIn size={16} /> Continue with Google (Student)
              </a>
            </div>
          </div>

          {/* Organizer Access Card */}
          <div className="role-card organizer-card">
            <div className="role-card-accent" />
            <div className="role-card-icon">
              <Award size={28} />
            </div>
            <div className="role-card-tag">Host & Review</div>
            <h2>Login as Organizer</h2>
            <p>
              Host campus hackathons, workshops, and gatherings. Manage attendee rosters and review all applicant credentials.
            </p>
            <ul className="role-feature-list">
              <li><Check size={16} /> Host hackathons, workshops & meetups</li>
              <li><Check size={16} /> Dedicated dashboard of hosted events only</li>
              <li><Check size={16} /> Full applicant details (skills, bio, statement)</li>
              <li><Check size={16} /> Accept or reject attendee applications</li>
            </ul>
            <div className="role-actions">
              <a href={loginUrl} className="role-login-btn role-login-primary">
                <LogIn size={16} /> Continue with Google (Organizer)
              </a>
            </div>
          </div>
        </div>

        {/* Private Admin Portal link */}
        <div className="admin-portal-link-box">
          <Shield size={17} style={{ color: 'var(--blue-600)' }} />
          <span>Platform administrator?</span>
          <NavLink to="/admin/login">
            Admin Portal Access <ArrowUpRight size={14} />
          </NavLink>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   ADMIN LOGIN GATEWAY (/admin/login)
   ========================================================================== */

function AdminLogin({ me, onUserUpdate, setNotice }) {
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(passcode, email);
      const u = await api('/auth/me');
      if (onUserUpdate) onUserUpdate(u);
      if (setNotice) setNotice('Successfully authenticated as Administrator!');
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin passcode or credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="content">
      <div className="admin-login-card">
        <div className="admin-card-head">
          <div className="admin-shield-icon">
            <Lock size={28} />
          </div>
          <h2>Admin Portal Gateway</h2>
          <p>Enter your administrator credentials to access platform governance and moderation.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <label>Administrator Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@domain.edu"
              required
            />
          </div>

          <div className="form-group">
            <label>Admin Secret Passcode</label>
            <input
              type="password"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              placeholder="Enter administrator passcode"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            <ShieldCheck size={16} /> {loading ? 'Authenticating…' : 'Access Admin Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <NavLink to="/login" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            ← Back to Student & Organizer login
          </NavLink>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   ADMIN PORTAL DASHBOARD (/admin)
   ========================================================================== */

function AdminPortal({ me, setNotice, onUserUpdate }) {
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('events');
  const [loading, setLoading] = useState(true);
  const [syncingWeb, setSyncingWeb] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const isAdmin = me?.roles?.includes('ADMIN');

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, pEvents, uList] = await Promise.all([
        getAdminDashboard(),
        getPendingEvents(),
        getAdminUsers()
      ]);
      setStats(s);
      setPendingEvents(pEvents || []);
      setUsers(uList || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWeb = async () => {
    setSyncingWeb(true);
    try {
      const res = await syncWebEvents();
      if (setNotice) {
        setNotice(`Web search completed! Scanned ${res.totalScanned || 0} competitions & discovered ${res.newEventsCount || 0} new hackathons.`);
      }
      loadData();
    } catch (e) {
      alert(e.message || 'Web search failed');
    } finally {
      setSyncingWeb(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="content">
        <PageHead
          eyebrow="RESTRICTED AREA"
          title="Admin Access Required"
          sub="You need administrator privileges to view this portal."
        />
        <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Lock size={44} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h3>Authentication Required</h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 20px', color: 'var(--text-muted)' }}>
            This portal is private to platform administrators. Please use your secret passcode to sign in.
          </p>
          <NavLink to="/admin/login" className="btn btn-primary">
            <Lock size={15} /> Go to Admin Login
          </NavLink>
        </div>
      </div>
    );
  }

  async function handleApprove(eventId, title) {
    try {
      await reviewEvent(eventId, 'APPROVE');
      if (setNotice) setNotice(`Event "${title}" has been approved and published!`);
      loadData();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleReject(eventId, title) {
    const reason = prompt(`Enter reason for rejecting "${title}":`, 'Details incomplete or duplicate');
    if (reason === null) return;
    try {
      await reviewEvent(eventId, 'REJECT', reason);
      if (setNotice) setNotice(`Event "${title}" was rejected.`);
      loadData();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="content">
      <PageHead
        eyebrow="PLATFORM CONTROL CENTER"
        title="Admin Portal"
        sub="Private moderation suite: inspect pending events, monitor platform metrics, and manage users."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={loadData}>
              <RefreshCw size={15} /> Refresh Data
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSyncWeb}
              disabled={syncingWeb}
              title="Search the web for upcoming hackathons & competitions immediately (otherwise auto-searches every 1 hour)"
            >
              <Globe size={15} /> {syncingWeb ? 'Searching Web…' : 'Search Web Now'}
            </button>
          </div>
        }
      />

      {err && <div className="notice">{err}</div>}

      {/* Metrics Grid */}
      <div className="stats-grid">
        <Stat icon={<CalendarDays />} label="Pending Events" value={stats?.pendingEvents ?? '—'} tone="orange" />
        <Stat icon={<CheckCircle2 />} label="Approved Events" value={stats?.approvedEvents ?? '—'} tone="green" />
        <Stat icon={<Users />} label="Registered Users" value={stats?.users ?? '—'} tone="blue" />
        <Stat icon={<Briefcase />} label="Open Posts" value={stats?.openPosts ?? '—'} tone="purple" />
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={'tab-btn ' + (tab === 'events' ? 'active' : '')}
          onClick={() => setTab('events')}
        >
          Pending Event Moderation <span className="tab-count">{pendingEvents.length}</span>
        </button>
        <button
          className={'tab-btn ' + (tab === 'users' ? 'active' : '')}
          onClick={() => setTab('users')}
        >
          User Directory <span className="tab-count">{users.length}</span>
        </button>
      </div>

      {tab === 'events' && (
        <div className="panel">
          <div className="panel-title">
            <div>
              <h2>Events Awaiting Moderation</h2>
              <p>Review event submissions before they become visible to students.</p>
            </div>
            <Award />
          </div>

          {pendingEvents.length === 0 ? (
            <Empty text="All events have been reviewed! There are no pending event submissions." />
          ) : (
            <div className="event-grid event-grid-wide" style={{ marginTop: '16px' }}>
              {pendingEvents.map((e, idx) => (
                <article className="event-card" key={e.id}>
                  <div className="event-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="app-status-badge PENDING">PENDING APPROVAL</span>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {e.startsAt ? new Date(e.startsAt).toLocaleDateString() : 'Date TBA'}
                      </small>
                    </div>
                    <h3 style={{ marginTop: '10px' }}>{e.title}</h3>
                    <p>{e.description}</p>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0' }}>
                      <b>Organizer:</b> {e.organizerName || 'Unknown'} ({e.organizerEmail || 'No email'})
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      <b>Venue:</b> {e.venue || 'TBA'}
                    </div>
                    <div className="applicant-actions" style={{ marginTop: '16px' }}>
                      <button className="btn btn-sm btn-reject" onClick={() => handleReject(e.id, e.title)}>
                        <X size={14} /> Reject
                      </button>
                      <button className="btn btn-sm btn-accept" onClick={() => handleApprove(e.id, e.title)}>
                        <Check size={14} /> Approve Event
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="panel">
          <div className="panel-title">
            <div>
              <h2>User Directory</h2>
              <p>All registered platform accounts and their roles.</p>
            </div>
            <Users />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <b>{u.fullName || 'Anonymous'}</b>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {(u.roles || '').split(',').map((r, i) => (
                        <span className="role-badge-pill" key={i}>{r.trim()}</span>
                      ))}
                    </td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className="online-dot" style={{ display: 'inline-block', marginRight: '6px' }} />
                      Active
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   ORGANIZER PORTAL DASHBOARD (/organizer)
   ========================================================================== */

function OrganizerPortal({ me, onUserUpdate, setNotice }) {
  const [hostedEvents, setHostedEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('ALL');

  const isOrganizer = me?.roles?.includes('ORGANIZER') || me?.roles?.includes('ADMIN');

  const loadData = async () => {
    setLoading(true);
    try {
      const [events, apps] = await Promise.all([
        api('/events/mine').catch(() => []),
        getOrganizerApplications().catch(() => [])
      ]);
      setHostedEvents(events || []);
      setApplications(apps || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOrganizer) {
      loadData();
    }
  }, [isOrganizer]);

  if (!me || !isOrganizer) {
    return (
      <div className="content">
        <PageHead
          eyebrow="ORGANIZER ACCESS"
          title="Organizer Dashboard"
          sub="Sign in as an organizer to view your hosted events and student applicants."
        />
        <div className="panel" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Award size={48} style={{ color: 'var(--blue-600)', margin: '0 auto 16px' }} />
          <h2>Organizer Privileges Required</h2>
          <p style={{ maxWidth: '440px', margin: '0 auto 24px', color: 'var(--text-muted)' }}>
            This portal is specifically for event hosts to manage their events and inspect student applicants.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <NavLink to="/login" className="btn btn-primary">
              <LogIn size={15} /> Sign in as Organizer
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  async function handleReview(appId, status, applicantName) {
    try {
      await reviewEventApplication(appId, status);
      if (setNotice) setNotice(`Application for ${applicantName} marked as ${status.toLowerCase()}!`);
      loadData();
    } catch (e) {
      alert(e.message);
    }
  }

  const filteredApps = applications.filter(app => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (selectedEventId !== 'ALL' && app.eventId !== selectedEventId) return false;
    return true;
  });

  return (
    <div className="content">
      <PageHead
        eyebrow="EVENT HOSTING WORKSPACE"
        title="Organizer Dashboard"
        sub="Review only the events you are hosting and all student applicant details."
        action={
          <div className="page-head-actions">
            <button className="btn btn-secondary" onClick={loadData}>
              <RefreshCw size={15} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={() => setShowEventModal(true)}>
              <Plus size={16} /> Host New Event
            </button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="stats-grid">
        <Stat icon={<CalendarDays />} label="Hosted Events" value={hostedEvents.length} tone="blue" />
        <Stat icon={<Users />} label="Total Applicants" value={applications.length} tone="purple" />
        <Stat icon={<Clock />} label="Pending Reviews" value={applications.filter(a => a.status === 'PENDING').length} tone="orange" />
        <Stat icon={<CheckCircle2 />} label="Accepted Students" value={applications.filter(a => a.status === 'ACCEPTED').length} tone="green" />
      </div>

      {/* Hosted Events Section */}
      <div className="panel" style={{ marginBottom: '28px' }}>
        <div className="panel-title">
          <div>
            <h2>My Hosted Events <span className="tab-count">{hostedEvents.length}</span></h2>
            <p>Events published under your organizer account.</p>
          </div>
          <CalendarDays />
        </div>

        {hostedEvents.length === 0 ? (
          <Empty text="You haven't hosted any events yet. Click '+ Host New Event' to publish your first hackathon or workshop!" />
        ) : (
          <div className="event-grid event-grid-wide" style={{ marginTop: '16px' }}>
            {hostedEvents.map((e, i) => (
              <article className="event-card" key={e.id}>
                <div className="event-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={'app-status-badge ' + (e.status === 'APPROVED' ? 'ACCEPTED' : 'PENDING')}>
                      {e.status}
                    </span>
                    <small style={{ color: 'var(--text-muted)' }}>
                      {e.startsAt ? new Date(e.startsAt).toLocaleDateString() : 'Date TBA'}
                    </small>
                  </div>
                  <h3 style={{ marginTop: '10px' }}>{e.title}</h3>
                  <p>{e.description}</p>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px' }}>
                    <MapPin size={14} /> {e.venue || 'Location TBA'}
                  </div>
                  {e.eventUrl && (
                    <div style={{ marginTop: '6px' }}>
                      <a href={e.eventUrl} target="_blank" rel="noreferrer" className="event-link-pill">
                        Site Link <ArrowUpRight size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Student Applicants Section */}
      <div className="panel">
        <div className="panel-title">
          <div>
            <h2>Student Applicants Roster <span className="tab-count">{filteredApps.length}</span></h2>
            <p>Complete details, statements, and skillsets of students applying to your events.</p>
          </div>
          <Users />
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', margin: '16px 0 20px 0' }}>
          <div className="filter-tabs" style={{ margin: 0 }}>
            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(st => (
              <button
                key={st}
                className={'tab-btn ' + (statusFilter === st ? 'active' : '')}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? 'All Applicants' : st}
                <span className="tab-count">
                  {st === 'ALL' ? applications.length : applications.filter(a => a.status === st).length}
                </span>
              </button>
            ))}
          </div>

          {hostedEvents.length > 1 && (
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line-default)', fontSize: '13px' }}
            >
              <option value="ALL">Filter by all events</option>
              {hostedEvents.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          )}
        </div>

        {filteredApps.length === 0 ? (
          <Empty text="No applicant submissions match your current filter. As students register for your events, their profiles will appear here." />
        ) : (
          filteredApps.map(app => (
            <div className="applicant-card" key={app.id}>
              <div className="applicant-header">
                <div className="applicant-user-info">
                  <div className="applicant-avatar">
                    {app.applicantName?.[0] || 'S'}
                  </div>
                  <div className="applicant-names">
                    <b>{app.applicantName || 'Student Applicant'}</b>
                    <small>{app.applicantEmail} · Applied {new Date(app.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="role-badge-pill" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)' }}>
                    For: {app.eventTitle}
                  </span>
                  <span className={'app-status-badge ' + app.status}>
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Application Statement */}
              {app.message && (
                <div className="applicant-statement">
                  <b>Statement / Motivation:</b>
                  <p style={{ margin: '4px 0 0 0', lineHeight: 1.5 }}>{app.message}</p>
                </div>
              )}

              {/* Skills */}
              {app.skills && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Skills:</span>
                  <div className="applicant-skills-wrap">
                    {app.skills.split(',').map((sk, idx) => (
                      <span className="applicant-skill-tag" key={idx}>{sk.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Actions */}
              {app.status === 'PENDING' && (
                <div className="applicant-actions">
                  <button
                    className="btn btn-sm btn-reject"
                    onClick={() => handleReview(app.id, 'REJECTED', app.applicantName)}
                  >
                    <X size={14} /> Reject Application
                  </button>
                  <button
                    className="btn btn-sm btn-accept"
                    onClick={() => handleReview(app.id, 'ACCEPTED', app.applicantName)}
                  >
                    <Check size={14} /> Accept Application
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showEventModal && (
        <AddEventModal
          onClose={() => setShowEventModal(false)}
          onSuccess={(title) => {
            setShowEventModal(false);
            if (setNotice) setNotice(`Event "${title}" submitted!`);
            loadData();
          }}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   DISCOVER COMPONENT (Community Feed)
   ========================================================================== */

function Discover({ me }) {
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState('');
  const [applyEvent, setApplyEvent] = useState(null);
  const [joinPost, setJoinPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api('/events').then(d => setEvents(d.items || [])).catch(() => setEvents(sampleEvents));
    api('/posts').then(d => setPosts(d.items || [])).catch(() => setPosts([]));
  }, []);

  return (
    <div className="content">
      <div className="hero">
        <div className="hero-copy">
          <div className="hero-tag"><span /> YOUR NEXT COLLABORATION STARTS HERE</div>
          <h1>Good things happen<br />when <em>great minds</em> meet.</h1>
          <p>Find teammates, discover student events, and turn your skills into something extraordinary.</p>
          <div className="hero-buttons">
            <NavLink className="btn btn-primary" to="/teams">
              Find teammates <ArrowUpRight size={16} />
            </NavLink>
            <NavLink className="btn btn-ghost" to="/events">
              Explore events
            </NavLink>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack"><i>L</i><i>A</i><i>R</i><i>+</i></div>
            <span>
              <b>One idea can change everything.</b>
              <small>Start building with your community.</small>
            </span>
          </div>
        </div>

        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-core"><Users size={48} /></div>
          <div className="float-card card-top">
            <span className="mini-icon violet"><Code2 size={16} /></span>
            <div><b>Frontend developer</b><small>React · UI/UX</small></div>
            <span className="match">98%</span>
          </div>
          <div className="float-card card-bottom">
            <span className="mini-icon green"><Sparkles size={16} /></span>
            <div><b>Perfect skill match</b><small>3 skills aligned</small></div>
            <span className="sparkle-dot">✦</span>
          </div>
          <div className="art-dot dot-a" />
          <div className="art-dot dot-b" />
        </div>
        <div className="hero-grid" />
      </div>

      <div className="section-head">
        <div>
          <div className="eyebrow">YOUR COMMUNITY</div>
          <h2>Explore what’s happening</h2>
          <p>Fresh opportunities to learn, build, and connect.</p>
        </div>
        <div className="search-box">
          <Search size={17} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search opportunities..." />
        </div>
      </div>

      <div className="stats-grid">
        <Stat icon={<CalendarDays />} label="Upcoming events" value={events.length || '—'} tone="purple" />
        <Stat icon={<Users />} label="Open opportunities" value={posts.length || '—'} tone="blue" />
        <Stat icon={<Sparkles />} label="Skill-based matching" value="AI-ready" tone="green" />
        <Stat icon={<ShieldCheck />} label="Community" value="Student-first" tone="orange" />
      </div>

      <div className="section-head compact">
        <div>
          <h2>Upcoming events <span className="count">{events.length}</span></h2>
          <p>Opportunities worth showing up for.</p>
        </div>
        <NavLink className="text-link" to="/events">View all <ArrowUpRight size={15} /></NavLink>
      </div>

      <div className="event-grid">
        {events
          .filter(e => (e.title || '').toLowerCase().includes(q.toLowerCase()))
          .slice(0, 3)
          .map((e, i) => (
            <EventCard
              key={e.id}
              event={e}
              index={i}
              onApply={() => {
                if (!me) navigate('/login');
                else setApplyEvent(e);
              }}
            />
          ))}
        {events.length === 0 && <Empty text="No approved events yet. Check back soon." />}
      </div>

      <div className="section-head compact">
        <div>
          <h2>Collaborate & Recruit <span className="count">{posts.length}</span></h2>
          <p>Student projects looking for your unique skills.</p>
        </div>
        <NavLink className="text-link" to="/teams">View all projects <ArrowUpRight size={15} /></NavLink>
      </div>

      <div className="post-grid">
        {posts.slice(0, 3).map((p, i) => (
          <PostCard
            key={p.id}
            post={p}
            index={i}
            onJoin={() => {
              if (!me) navigate('/login');
              else setJoinPost(p);
            }}
          />
        ))}
        {posts.length === 0 && <Empty text="No open recruitment posts yet. Be the first to create one in 'My teams'!" />}
      </div>

      {applyEvent && (
        <ApplyModal
          event={applyEvent}
          onClose={() => setApplyEvent(null)}
          onSuccess={() => {
            setApplyEvent(null);
            alert('Application submitted! The event organizer has received your details.');
          }}
        />
      )}

      {joinPost && (
        <JoinRequestModal
          post={joinPost}
          onClose={() => setJoinPost(null)}
          onSuccess={() => {
            setJoinPost(null);
            alert('Join request sent to the team creator!');
          }}
        />
      )}
    </div>
  );
}

function Stat({ icon, label, value, tone }) {
  return (
    <div className="stat-card">
      <div className={'stat-icon ' + tone}>{icon}</div>
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <span className="stat-arrow"><ArrowUpRight size={15} /></span>
    </div>
  );
}

function EventCard({ event, index = 0, isOwner = false, onApply }) {
  const category = index % 3 === 0 ? 'COMMUNITY' : index % 3 === 1 ? 'WORKSHOP' : 'HACKATHON';

  return (
    <article className="event-card">
      <div className={'event-cover cover-' + (index % 3)}>
        <span className="cover-chip">{category}</span>
        {isOwner && <span className="owner-chip">MY EVENT</span>}
        <div className="cover-graphic"><span /><span /><span /><span /></div>
        <div className="cover-mark">{index % 3 === 0 ? <Sparkles /> : index % 3 === 1 ? <Code2 /> : <Users />}</div>
      </div>
      <div className="event-body">
        <div className="event-date">
          <CalendarDays size={14} />
          {event.startsAt
            ? new Date(event.startsAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Date to be announced'}
        </div>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        
        {event.organizerName && (
          <div className="event-organizer-row">
            <span className="mini-avatar">{(event.organizerName?.[0] || 'O')}</span>
            <small>Hosted by <b>{event.organizerName}</b></small>
          </div>
        )}

        <div className="event-meta" style={{ marginTop: 'auto', paddingTop: '14px' }}>
          <span><Compass size={14} />{event.venue || 'Location TBA'}</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {event.eventUrl && (
              <a
                href={event.eventUrl}
                target="_blank"
                rel="noreferrer"
                className="event-link-pill"
                title="Open event site"
              >
                Site <ArrowUpRight size={13} />
              </a>
            )}
            {onApply && !isOwner && (
              <button className="btn btn-primary btn-sm" onClick={onApply} style={{ padding: '6px 14px' }}>
                Apply / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function PostCard({ post, index = 0, onJoin }) {
  return (
    <article className="post-card">
      <div className="post-card-top">
        <div className={'post-symbol ps-' + (index % 3)}><Code2 size={19} /></div>
        <span className="open-badge"><i /> OPEN</span>
      </div>
      <h3>{post.title}</h3>
      <p>{post.description}</p>
      <div className="post-meta">
        <span className="mini-avatar">{post.creatorName?.[0] || 'T'}</span>
        <span>{post.creatorName || 'TeamUp student'}</span>
        <span className="recruitment-badge">{post.postType || 'PROJECT'}</span>
      </div>
      <button className="post-cta" onClick={onJoin}>
        Request to join project <ArrowUpRight size={15} />
      </button>
    </article>
  );
}

/* ==========================================================================
   EVENTS PAGE (/events)
   ========================================================================== */

function Events({ me, onUserUpdate, setNotice }) {
  const [items, setItems] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [tab, setTab] = useState('all');
  const [err, setErr] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [applyModalEvent, setApplyModalEvent] = useState(null);
  const [syncingWeb, setSyncingWeb] = useState(false);
  const navigate = useNavigate();

  const isOrganizer = me?.roles?.includes('ORGANIZER') || me?.roles?.includes('ADMIN');
  const isAdmin = me?.roles?.includes('ADMIN');

  const load = () => {
    api('/events')
      .then(d => setItems(d.items || []))
      .catch(e => setErr(e.message));

    if (me) {
      api('/events/mine').then(d => setMyEvents(d || [])).catch(() => setMyEvents([]));
      getMyEventApplications().then(d => setMyApplications(d || [])).catch(() => setMyApplications([]));
      if (isAdmin) {
        getPendingEvents().then(d => setPendingEvents(d || [])).catch(() => setPendingEvents([]));
      }
    }
  };

  useEffect(() => {
    load();
  }, [me, isAdmin]);

  const handleSyncWeb = async () => {
    setSyncingWeb(true);
    try {
      const res = await syncWebEvents();
      if (setNotice) {
        setNotice(`Web search complete! Scanned ${res.totalScanned || 0} competitions & discovered ${res.newEventsCount || 0} new hackathons.`);
      }
      load();
    } catch (e) {
      alert(e.message || 'Web search failed');
    } finally {
      setSyncingWeb(false);
    }
  };

  async function handleAllowEvent(eventId, title) {
    try {
      await reviewEvent(eventId, 'APPROVED');
      if (setNotice) setNotice(`Event "${title}" has been allowed and published to the platform!`);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleRejectEvent(eventId, title) {
    const reason = prompt(`Enter reason for rejecting "${title}":`, 'Details incomplete or duplicate');
    if (reason === null) return;
    try {
      await reviewEvent(eventId, 'REJECTED', reason);
      if (setNotice) setNotice(`Event "${title}" was rejected.`);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="content">
      <PageHead
        eyebrow="CAMPUS EXPERIENCES"
        title="Events & Hackathons"
        sub="Discover approved hackathons, workshops, and gatherings—or apply to participate."
        action={
          <div className="page-head-actions">
            {!me && (
              <NavLink to="/login" className="btn btn-primary">
                <LogIn size={15} /> Sign in to Apply
              </NavLink>
            )}
            {me && isOrganizer && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <NavLink to="/organizer" className="btn btn-secondary">
                  <Award size={15} /> Organizer Dashboard
                </NavLink>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  <Plus size={16} /> Host Event
                </button>
              </div>
            )}
          </div>
        }
      />

      {err && <div className="notice">{err}</div>}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={'tab-btn ' + (tab === 'all' ? 'active' : '')}
          onClick={() => setTab('all')}
        >
          All Approved Events <span className="tab-count">{items.length}</span>
        </button>

        {me && (
          <button
            className={'tab-btn ' + (tab === 'applied' ? 'active' : '')}
            onClick={() => setTab('applied')}
          >
            My Event Applications <span className="tab-count">{myApplications.length}</span>
          </button>
        )}

        {me && isOrganizer && (
          <button
            className={'tab-btn ' + (tab === 'mine' ? 'active' : '')}
            onClick={() => setTab('mine')}
          >
            My Hosted Events <span className="tab-count">{myEvents.length}</span>
          </button>
        )}

        {/* Admin Exclusive Allow & Review Tab */}
        {isAdmin && (
          <button
            className={'tab-btn ' + (tab === 'moderation' ? 'active' : '')}
            onClick={() => setTab('moderation')}
            style={{
              borderColor: tab === 'moderation' ? 'var(--blue-600)' : '#fcd34d',
              background: tab === 'moderation' ? 'linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%)' : '#fffbeb',
              color: tab === 'moderation' ? 'var(--blue-700)' : '#92400e',
              fontWeight: 600
            }}
          >
            <ShieldCheck size={15} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
            Pending Event Moderation <span className="tab-count" style={{ background: '#d97706', color: '#fff' }}>{pendingEvents.length}</span>
          </button>
        )}
      </div>

      {tab === 'all' && (
        <div className="event-grid event-grid-wide">
          {items.map((e, i) => (
            <EventCard
              key={e.id}
              event={e}
              index={i}
              onApply={() => {
                if (!me) navigate('/login');
                else setApplyModalEvent(e);
              }}
            />
          ))}
          {!items.length && <Empty text="No approved events available right now." />}
        </div>
      )}

      {tab === 'applied' && (
        <div className="panel">
          <div className="panel-title">
            <div>
              <h2>Your Event Registrations</h2>
              <p>Track the approval status of hackathons and workshops you have applied to.</p>
            </div>
            <FileText />
          </div>

          {myApplications.length === 0 ? (
            <Empty text="You haven't submitted any event applications yet. Explore approved events and click 'Apply / Register'!" />
          ) : (
            myApplications.map(app => (
              <div className="list-row" key={app.id}>
                <div className="list-icon"><CalendarDays /></div>
                <div className="list-main">
                  <b>{app.eventTitle}</b>
                  <small>
                    Venue: {app.venue || 'TBA'} · Applied: {new Date(app.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <span className={'app-status-badge ' + app.status}>
                  {app.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'mine' && (
        <div className="event-grid event-grid-wide">
          {myEvents.map((e, i) => (
            <EventCard key={e.id} event={e} index={i} isOwner={true} />
          ))}
          {!myEvents.length && (
            <Empty text="You haven't added any events yet. Click '+ Host Event' to publish your first event!" />
          )}
        </div>
      )}

      {/* Admin Exclusive Moderation View */}
      {tab === 'moderation' && isAdmin && (
        <div className="panel">
          <div className="panel-title" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <h2>Pending Event Moderation (Admin Review)</h2>
              <p>Review, explore external web links, and allow events registered by organizers or discovered from web searches.</p>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: 'var(--blue-700)', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                  <Clock size={13} /> Auto-Search: Once Every Hour
                </span>
                <span>Continuously searches the web for new student hackathons & competitions.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSyncWeb}
                disabled={syncingWeb}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Search the web for upcoming hackathons & competitions immediately (otherwise auto-searches every 1 hour)"
              >
                <Globe size={14} /> {syncingWeb ? 'Searching Web…' : 'Search Web for Hackathons Now'}
              </button>
            </div>
          </div>

          {pendingEvents.length === 0 ? (
            <Empty text="All events have been reviewed! There are no pending events from organizers or web feeds." />
          ) : (
            <div className="event-grid event-grid-wide" style={{ marginTop: '16px' }}>
              {pendingEvents.map((e) => {
                const isWebExplored = Boolean(e.sourceName || e.sourceId || (!e.organizerName && e.eventUrl));
                return (
                  <article className="event-card" key={e.id} style={{ border: '1.5px solid #fde68a' }}>
                    <div className="event-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        {isWebExplored ? (
                          <span className="app-status-badge" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Globe size={13} /> WEB EXPLORED FEED
                          </span>
                        ) : (
                          <span className="app-status-badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Users size={13} /> REGISTERED BY ORGANIZER
                          </span>
                        )}
                        <small style={{ color: 'var(--text-muted)' }}>
                          {e.startsAt ? new Date(e.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA'}
                        </small>
                      </div>

                      <h3 style={{ marginTop: '12px', fontSize: '18px' }}>{e.title}</h3>
                      <p style={{ margin: '8px 0 14px', color: 'var(--text-secondary)' }}>{e.description}</p>

                      <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-subtle)', marginBottom: '16px', display: 'grid', gap: '6px', fontSize: '12px' }}>
                        <div>
                          <b>Source / Submitter:</b>{' '}
                          {isWebExplored
                            ? (e.sourceName ? `Imported Feed: ${e.sourceName}` : 'Web Explored Feed')
                            : `${e.organizerName || 'Campus Organizer'} (${e.organizerEmail || 'No email'})`
                          }
                        </div>
                        <div>
                          <b>Venue:</b> {e.venue || 'Hybrid / To be announced'}
                        </div>
                        {e.eventUrl && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <b>Web Link:</b>{' '}
                            <a
                              href={e.eventUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--blue-600)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            >
                              Explore Website <ArrowUpRight size={13} />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="applicant-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {e.eventUrl && (
                          <a
                            href={e.eventUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          >
                            <Globe size={14} /> Explore Source
                          </a>
                        )}
                        <button
                          className="btn btn-sm btn-reject"
                          onClick={() => handleRejectEvent(e.id, e.title)}
                        >
                          <X size={14} /> Reject
                        </button>
                        <button
                          className="btn btn-sm btn-accept"
                          onClick={() => handleAllowEvent(e.id, e.title)}
                        >
                          <Check size={14} /> Allow & Publish Event
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(title) => {
            setShowAddModal(false);
            if (setNotice) setNotice(`Event "${title}" submitted successfully!`);
            load();
          }}
        />
      )}

      {applyModalEvent && (
        <ApplyModal
          event={applyModalEvent}
          onClose={() => setApplyModalEvent(null)}
          onSuccess={() => {
            setApplyModalEvent(null);
            if (setNotice) setNotice('Application submitted! The organizer has received your details.');
            load();
          }}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   TEAMS & PROJECTS WORKSPACE (/teams)
   ========================================================================== */

function Teams({ me, setNotice }) {
  const [teams, setTeams] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState('projects');
  const [err, setErr] = useState('');
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [joinModalPost, setJoinModalPost] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    api('/posts').then(d => setPosts(d.items || [])).catch(() => setPosts([]));
    if (me) {
      api('/teams').then(setTeams).catch(e => setErr(e.message));
    }
  };

  useEffect(() => {
    load();
  }, [me]);

  return (
    <div className="content">
      <PageHead
        eyebrow="STUDENT COLLABORATION"
        title="Teams & Projects"
        sub="Join existing student teams or recruit classmates to build something extraordinary."
        action={
          <div className="page-head-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!me) navigate('/login');
                else setShowRecruitModal(true);
              }}
            >
              <Plus size={16} /> Recruit Teammates / New Project
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={'tab-btn ' + (tab === 'projects' ? 'active' : '')}
          onClick={() => setTab('projects')}
        >
          Open Recruitment Projects <span className="tab-count">{posts.length}</span>
        </button>
        {me && (
          <button
            className={'tab-btn ' + (tab === 'myteams' ? 'active' : '')}
            onClick={() => setTab('myteams')}
          >
            My Active Teams <span className="tab-count">{teams.length}</span>
          </button>
        )}
      </div>

      {tab === 'projects' && (
        <div className="post-grid">
          {posts.map((p, i) => (
            <PostCard
              key={p.id}
              post={p}
              index={i}
              onJoin={() => {
                if (!me) navigate('/login');
                else setJoinModalPost(p);
              }}
            />
          ))}
          {posts.length === 0 && (
            <Empty text="No open recruitment posts yet. Click '+ Recruit Teammates' to post your idea!" />
          )}
        </div>
      )}

      {tab === 'myteams' && (
        <div className="panel">
          <div className="panel-title">
            <div>
              <h2>Your Active Teams</h2>
              <p>Team membership and leadership roles.</p>
            </div>
            <Users />
          </div>
          {err ? (
            <Empty text="Sign in to view your teams." />
          ) : teams.length ? (
            teams.map(t => (
              <div className="list-row" key={t.id}>
                <div className="list-icon"><Users /></div>
                <div className="list-main">
                  <b>{t.name}</b>
                  <small>{t.myRole} · {t.status}</small>
                </div>
                <span className="open-badge">{t.status}</span>
              </div>
            ))
          ) : (
            <Empty text="You haven't joined a team yet. Request to join an open project above!" />
          )}
        </div>
      )}

      {/* Modals */}
      {showRecruitModal && (
        <RecruitModal
          onClose={() => setShowRecruitModal(false)}
          onSuccess={(title) => {
            setShowRecruitModal(false);
            if (setNotice) setNotice(`Project "${title}" published! Collaborators can now request to join.`);
            load();
          }}
        />
      )}

      {joinModalPost && (
        <JoinRequestModal
          post={joinModalPost}
          onClose={() => setJoinModalPost(null)}
          onSuccess={() => {
            setJoinModalPost(null);
            if (setNotice) setNotice('Join request submitted to project creator!');
          }}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   SKILL MATCHING (/matching)
   ========================================================================== */

function Matching() {
  const [items, setItems] = useState([]);
  const [skills, setSkills] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/matching/posts').then(setItems).catch(e => setErr(e.message));
    api('/skills').then(setSkills).catch(() => {});
  }, []);

  return (
    <div className="content">
      <PageHead
        eyebrow="SKILLS MEET OPPORTUNITY"
        title="Your next great match."
        sub="Discover projects that align with the skills you bring to the table."
      />
      <div className="match-banner">
        <div className="match-banner-icon"><Sparkles size={24} /></div>
        <div>
          <h2>Match with purpose.</h2>
          <p>TeamUp compares your profile skills with each project's requirements. Add skills in your profile to maximize your match score.</p>
        </div>
        <span>{skills.length} skills listed</span>
      </div>
      {err ? (
        <Empty text="Sign in and add skills in your profile to see personalized matching." />
      ) : (
        <div className="post-grid">
          {items.map(p => (
            <article className="post-card match-card" key={p.id}>
              <div className="post-card-top">
                <div className="post-symbol ps-0"><Sparkles size={19} /></div>
                <span className="match-score">
                  {p.totalRequired ? Math.round((p.matchedRequired / p.totalRequired) * 100) : '—'}
                  {p.totalRequired ? '%' : ''} match
                </span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.matchedRequired || 0} matched skills · {p.totalRequired || 0} required skills</p>
              <div className="progress">
                <span style={{ width: (p.totalRequired ? Math.min(100, ((p.matchedRequired || 0) / p.totalRequired) * 100) : 0) + '%' }} />
              </div>
              <NavLink className="post-cta" to="/teams">
                View project details <ArrowUpRight size={15} />
              </NavLink>
            </article>
          ))}
          {!items.length && <Empty text="No open projects requiring skills currently. Add your own project!" />}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   NOTIFICATIONS (/notifications)
   ========================================================================== */

function Notifications() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

  const load = () => api('/notifications').then(setItems).catch(e => setErr(e.message));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="content">
      <PageHead
        eyebrow="STAY IN THE LOOP"
        title="Notifications"
        sub="Application reviews, team invitations, and event decisions appear here."
        action={
          <button className="btn btn-secondary" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />
      <div className="panel">
        {err ? (
          <Empty text="Sign in to view your notifications." />
        ) : items.length ? (
          items.map(n => (
            <div className="list-row" key={n.id}>
              <div className="list-icon"><Bell /></div>
              <div className="list-main">
                <b>{n.title}</b>
                <small>{n.body} · {new Date(n.createdAt).toLocaleString()}</small>
              </div>
              {!n.readAt && (
                <button
                  className="small-action"
                  onClick={() => api(`/notifications/${n.id}/read`, { method: 'POST' }).then(load)}
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        ) : (
          <Empty text="You're all caught up. New updates will appear here." />
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   PROFILE (/profile)
   ========================================================================== */

function Profile({ me, onChange, setNotice }) {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState('');
  const [prof, setProf] = useState('BEGINNER');
  const [msg, setMsg] = useState('');

  const load = () => api('/skills').then(setSkills).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    try {
      await api('/skills', { method: 'POST', body: JSON.stringify({ name, proficiency: prof }) });
      setName('');
      setMsg('Skill added to your profile.');
      load();
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function handleBecomeOrganizer() {
    try {
      await api('/auth/roles/organizer', { method: 'POST' });
      const updated = await api('/auth/me');
      if (onChange) onChange(updated);
      if (setNotice) setNotice('Organizer privileges activated! You now have access to the Organizer Portal.');
      setMsg('Organizer privileges activated successfully.');
    } catch (e) {
      setMsg(e.message);
    }
  }

  const isOrganizer = me?.roles?.includes('ORGANIZER') || me?.roles?.includes('ADMIN');

  return (
    <div className="content">
      <PageHead
        eyebrow="YOUR STORY, YOUR SKILLS"
        title="Your profile"
        sub="Make it easier for team leaders and event organizers to discover you."
      />
      <div className="profile-grid">
        <div className="panel profile-panel">
          <div className="profile-avatar">{me?.fullName?.[0] || 'G'}</div>
          <h2>{me?.fullName || 'Your TeamUp profile'}</h2>
          <p>{me?.email || 'Sign in to manage your profile and recruit teammates.'}</p>

          <div className="profile-roles">
            {(me?.roles || ['GUEST']).map(r => (
              <span className="role-chip" key={r}>
                <Award size={12} /> {r}
              </span>
            ))}
          </div>

          {!me ? (
            <div className="profile-actions-stack">
              <NavLink className="btn btn-primary profile-login" to="/login">
                <LogIn size={16} /> Choose Login Portal
              </NavLink>
            </div>
          ) : (
            !isOrganizer && (
              <button className="btn btn-secondary profile-login" onClick={handleBecomeOrganizer}>
                <Award size={16} /> Enable Organizer Mode
              </button>
            )
          )}

          <div className="verified-note">
            <ShieldCheck size={15} /> Verified Campus Account
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <div>
              <h2>My skills</h2>
              <p>Skills enable automated project matching and show on your event applications.</p>
            </div>
            <Sparkles />
          </div>

          <form className="skill-form" onSubmit={add}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. React, Python, UI Design, PyTorch"
              required
              maxLength={80}
            />
            <select value={prof} onChange={e => setProf(e.target.value)}>
              <option>BEGINNER</option>
              <option>INTERMEDIATE</option>
              <option>ADVANCED</option>
            </select>
            <button className="btn btn-primary" type="submit">
              <Plus size={16} /> Add skill
            </button>
          </form>

          {msg && <div className="inline-message">{msg}</div>}

          <div className="skill-list">
            {skills.map(s => (
              <span className="skill-chip" key={s.id}>
                {s.name}<span>↗</span>
              </span>
            ))}
            {!skills.length && <Empty text="Your skills will appear here after you add them." />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   MODALS (Recruitment, Apply to Event, Join Request, Add Event)
   ========================================================================== */

function AddEventModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [eventUrl, setEventUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title || !description || !venue || !startsAt) {
      setError('Please fill in title, description, venue, and start time.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        venue,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        eventUrl: eventUrl || null
      };
      await api('/events', { method: 'POST', body: JSON.stringify(payload) });
      onSuccess(title);
    } catch (err) {
      setError(err.message || 'Failed to publish event');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Host New Event</h2>
            <p>Publish an event for students to discover, collaborate, and attend.</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <label>Event Title <span>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. AI & Cloud Hackathon 2026"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Description <span>*</span></label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide details about the agenda, prizes, who should attend, and what will be built..."
              required
            />
          </div>

          <div className="form-group">
            <label>Venue / Location <span>*</span></label>
            <input
              type="text"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              placeholder="e.g. Campus Innovation Hall A / Online Hybrid"
              required
              maxLength={240}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Starts At <span>*</span></label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Ends At <small>(Optional)</small></label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={e => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Event Website / Link <small>(Optional)</small></label>
            <input
              type="url"
              value={eventUrl}
              onChange={e => setEventUrl(e.target.value)}
              placeholder="https://example.com/hackathon"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Sparkles size={16} /> {submitting ? 'Publishing…' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApplyModal({ event, onClose, onSuccess }) {
  const [message, setMessage] = useState('');
  const [skills, setSkills] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await applyToEvent(event.id, { message, skills });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Register for Event</h2>
            <p>Applying for: <b>{event.title}</b></p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <label>Why do you want to participate? <span>*</span></label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Briefly describe your interest, background, or what you hope to build during the event..."
              required
            />
          </div>

          <div className="form-group">
            <label>Your Skills / Background</label>
            <input
              type="text"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="e.g. React, Python, UI/UX, Cloud, Pitching"
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              Comma-separated list of skills you bring to this event
            </small>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={15} /> {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecruitModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState('PROJECT');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title || !description) {
      setError('Please provide a title and description.');
      return;
    }
    setSubmitting(true);
    try {
      await createPost({
        title,
        description,
        postType,
        maxMembers: 5,
        requiredSkills: []
      });
      onSuccess(title);
    } catch (err) {
      setError(err.message || 'Failed to create recruitment post');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Recruit Teammates</h2>
            <p>Post a project idea and invite other students to join your squad.</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <label>Project Title <span>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Campus Ride-Share App, AI Note Summarizer"
              required
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label>Project Type</label>
            <select value={postType} onChange={e => setPostType(e.target.value)}>
              <option value="PROJECT">General Project</option>
              <option value="HACKATHON">Hackathon Squad</option>
              <option value="STUDY_GROUP">Study & Research Group</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description & Roles Needed <span>*</span></label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your vision, goals, and what roles you are recruiting (e.g. 1 frontend dev, 1 designer)..."
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Plus size={16} /> {submitting ? 'Publishing…' : 'Publish Recruitment Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function JoinRequestModal({ post, onClose, onSuccess }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await requestJoin(post.id, message);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send join request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Request to Join Project</h2>
            <p>Pitching for: <b>{post.title}</b></p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <label>Why do you want to join this project? <span>*</span></label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Introduce yourself, mention what skills you bring, and how you'd like to collaborate..."
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={15} /> {submitting ? 'Sending…' : 'Send Join Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   CALLBACK HANDLER (/auth/callback)
   ========================================================================== */

function Callback({ onDone }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api('/auth/me')
      .then(u => {
        onDone(u);
        navigate('/');
      })
      .catch(e => setError(e.message));
  }, []);

  return (
    <div className="content">
      <div className="panel callback-panel">
        <div className="brand-icon"><ShieldCheck /></div>
        <h2>Welcome to TeamUp</h2>
        <p>{error || 'Finishing your sign-in…'}</p>
        <NavLink className="btn btn-primary" to="/">Go to workspace</NavLink>
      </div>
    </div>
  );
}

export default App;
