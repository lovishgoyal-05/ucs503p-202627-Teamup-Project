import { useEffect,useState } from "react";
import { getProjects } from "../services/projectService";
import ProjectList from "../components/project/ProjectList";
import { Link } from "react-router-dom";
export default function MyProjects(){ const [projects,setProjects]=useState([]); useEffect(()=>{getProjects({mine:true}).then(r=>setProjects(r.data.projects));},[]); return <div className="page"><div className="row"><h1>My Projects</h1><Link className="btn" to="/projects/new">New Project</Link></div><ProjectList projects={projects}/></div>; }
