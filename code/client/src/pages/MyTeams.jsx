import { useEffect,useState } from "react";
import { getMyTeams } from "../services/teamService";
import TeamList from "../components/team/TeamList";
export default function MyTeams(){ const [teams,setTeams]=useState([]); useEffect(()=>{getMyTeams().then(r=>setTeams(r.data.teams));},[]); return <div className="page"><h1>My Teams</h1><TeamList teams={teams}/></div>; }
