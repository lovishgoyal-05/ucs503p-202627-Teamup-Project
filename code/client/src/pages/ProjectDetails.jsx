import { useEffect,useState } from "react";
import { Link,useParams } from "react-router-dom";
import { getProject } from "../services/projectService";
import CreateTeam from "../components/team/CreateTeam";
import JoinTeamButton from "../components/team/JoinTeamButton";

export default function ProjectDetails(){
  const {id}=useParams(); const [project,setProject]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{getProject(id).then(r=>setProject(r.data.project)).catch(e=>setError(e.response?.data?.message||"Not found"));},[id]);
  if(error)return <div className="page"><div className="error">{error}</div></div>;
  if(!project)return <div className="page">Loading...</div>;
  return <div className="page"><Link to="/explore">← Explore</Link><div className="card" style={{marginTop:15}}>
    <div className="row"><h1>{project.title}</h1><span className="tag">{project.category}</span></div>
    <p>{project.description}</p><p className="muted">Created by {project.creator?.name}</p>
    <div className="tags">{project.requiredSkills?.map(s=><span className="tag" key={s}>{s}</span>)}</div>
    <p>Team size: {project.members?.length||0} / {project.teamSize}</p>
    {project.team ? <JoinTeamButton teamId={project.team._id}/> : <CreateTeam projectId={project._id} onCreated={t=>setProject({...project,team:t})}/>}
  </div></div>;
}
