import { Link } from "react-router-dom";
export default function TeamCard({ team }) {
  return <article className="card"><h3>{team.name}</h3><p className="muted">{team.project?.title || "Project team"}</p><p>{team.members?.length || 0} member(s)</p><Link className="btn small" to={`/teams/${team._id}`}>View Team</Link></article>;
}
