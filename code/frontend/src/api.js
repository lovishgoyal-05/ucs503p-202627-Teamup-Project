const envApiUrl = import.meta.env.VITE_API_URL;
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API = `${envApiUrl || ''}/api/v1`;
let token = localStorage.getItem('teamup_access_token') || '';
export function setToken(value){token=value||'';
 if(token)localStorage.setItem('teamup_access_token',token);
else localStorage.removeItem('teamup_access_token');
}
async function refresh(){const r=await fetch(`${API}/auth/refresh`,{method:'POST',credentials:'include'});
if(!r.ok){setToken('');
return false;
}const d=await r.json();
setToken(d.accessToken);
return true;
}
export async function api(path, options={}) { const send=()=>fetch(`${API}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...(options.headers||{})},credentials:'include'});
let res=await send();
if(res.status===401&&path!=='/auth/refresh'&&path!=='/auth/me'&&await refresh())res=await send();
if(res.status===204)return null;
const data=await res.json().catch(()=>({}));
if(!res.ok)throw new Error(data.title||data.message||`Request failed (${res.status})`);
return data;
}
export const loginUrl = envApiUrl
  ? `${envApiUrl}/oauth2/authorization/google`
  : isLocalhost
    ? 'http://localhost:8080/oauth2/authorization/google'
    : '/oauth2/authorization/google';
export async function logout(){try{await fetch(`${API}/auth/logout`,{method:'POST',credentials:'include'});
}finally{setToken('');
}}
export async function demoLogin(role='ORGANIZER'){const d=await api(`/auth/demo-login?role=${encodeURIComponent(role)}`,{method:'POST'});
if(d?.accessToken)setToken(d.accessToken);
return d;
}

export async function adminLogin(passcode, email) {
  const d = await api('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ passcode, email })
  });
  if (d?.accessToken) setToken(d.accessToken);
  return d;
}

export async function applyToEvent(eventId, { message, skills }) {
  return api(`/events/${eventId}/apply`, {
    method: 'POST',
    body: JSON.stringify({ message, skills })
  });
}

export async function getEventApplications(eventId) {
  return api(`/events/${eventId}/applications`);
}

export async function getOrganizerApplications() {
  return api('/organizer/applications');
}

export async function reviewEventApplication(appId, status) {
  return api(`/event-applications/${appId}/review`, {
    method: 'POST',
    body: JSON.stringify({ status })
  });
}

export async function getMyEventApplications() {
  return api('/events/my-applications');
}

export async function getPendingEvents() {
  return api('/admin/events/pending');
}

export async function reviewEvent(eventId, decision, rejectionReason = null) {
  const status = (decision === 'APPROVE' || decision === 'APPROVED') ? 'APPROVED' : 'REJECTED';
  return api(`/events/${eventId}/review`, {
    method: 'POST',
    body: JSON.stringify({ status })
  });
}

export async function getAdminUsers() {
  return api('/admin/users');
}

export async function syncWebEvents() {
  return api('/admin/events/sync-web', {
    method: 'POST'
  });
}

export async function getAdminDashboard() {
  return api('/admin/dashboard');
}

export async function createPost(post) {
  return api('/posts', {
    method: 'POST',
    body: JSON.stringify(post)
  });
}

export async function requestJoin(postId, message = '') {
  return api(`/posts/${postId}/join-requests`, {
    method: 'POST',
    body: JSON.stringify({ message })
  });
}

