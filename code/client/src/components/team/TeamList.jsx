import TeamCard from "./TeamCard";
export default function TeamList({ teams=[] }) {
  if (!teams.length) return <p className="muted">You are not in a team yet.</p>;
  return <div className="grid">{teams.map(t=><TeamCard team={t} key={t._id}/>)}</div>;
}
