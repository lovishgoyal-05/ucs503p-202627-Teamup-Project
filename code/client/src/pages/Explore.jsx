import { useEffect, useState } from "react";
import { getProjects } from "../services/projectService";
import ProjectList from "../components/project/ProjectList";
import Loader from "../components/common/Loader";

export default function Explore() {
  const [projects,setProjects]=useState([]);
  const [q,setQ]=useState("");
  const [loading,setLoading]=useState(true);
  async function load() { setLoading(true); try { const {data}=await getProjects({search:q}); setProjects(data.projects);} finally {setLoading(false);} }
  useEffect(()=>{ load(); },[]);
  return <div className="page"><div className="row"><div><h1>Explore Projects</h1><p className="muted">Find a project and meet your future teammates.</p></div><div><input placeholder="Search projects..." value={q} onChange={e=>setQ(e.target.value)} style={{padding:10,border:"1px solid #ddd",borderRadius:8}}/> <button className="btn" onClick={load}>Search</button></div></div>{loading?<Loader/>:<ProjectList projects={projects}/>}</div>;
}
