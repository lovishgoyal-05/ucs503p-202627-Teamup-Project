import { useNavigate } from "react-router-dom";
import ProjectForm from "../components/project/ProjectForm";
export default function Projects(){ const navigate=useNavigate(); return <div className="page"><ProjectForm onCreated={()=>navigate("/projects")}/></div>; }
