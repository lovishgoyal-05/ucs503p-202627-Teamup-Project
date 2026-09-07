import { useEffect,useState } from "react";
import { Link,useParams } from "react-router-dom";
import { getTeam,updateRequest } from "../services/teamService";
import { useAuth } from "../context/AuthContext";

export default function TeamDetails(){
  const {id}=useParams(); const {user}=useAuth(); const [team,setTeam]=useState(null);
  async function load(){ const {data}=await getTeam(id); setTeam(data.team); }
  useEffect(()=>{load()},[id]);
  async function decision(requestId,status){ await updateRequest(requestId,status); load(); }
  if(!team)return <div className="page">Loading...</div>;
  const isOwner=team.owner?._id===user?._id;
  return <div className="page"><Link to="/teams">← My Teams</Link><div className="card" style={{marginTop:15}}>
    <h1>{team.name}</h1><p className="muted">{team.project?.title}</p>
    <h3>Members</h3><ul>{team.members?.map(m=><li key={m._id}>{m.name} — {m.email}</li>)}</ul>
    {isOwner && <><h3>Pending Requests</h3>{(team.requests||[]).map(r=><div className="row card" key={r._id}><span>{r.user?.name}</span><span><button className="btn small" onClick={()=>decision(r._id,"accepted")}>Accept</button>{" "}<button className="btn danger small" onClick={()=>decision(r._id,"rejected")}>Reject</button></span></div>)}</>}
  </div></div>;
}
