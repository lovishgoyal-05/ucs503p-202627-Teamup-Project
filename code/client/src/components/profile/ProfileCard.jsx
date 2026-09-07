export default function ProfileCard({ user }) {
  return <div className="card"><h2>{user.name}</h2><p className="muted">{user.course} {user.year ? `• Year ${user.year}` : ""}</p><p>{user.bio || "No bio yet."}</p><div className="tags">{(user.skills||[]).map(s=><span className="tag" key={s}>{s}</span>)}</div><p className="muted">{user.college}</p></div>;
}
