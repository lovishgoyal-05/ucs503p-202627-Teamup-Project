import { useNavigate } from "react-router-dom";
import CreateTeam from "../components/team/CreateTeam";
export default function Teams(){ const navigate=useNavigate(); return <div className="page"><h1>Create Team</h1><CreateTeam onCreated={t=>navigate(`/teams/${t._id}`)}/></div>; }
