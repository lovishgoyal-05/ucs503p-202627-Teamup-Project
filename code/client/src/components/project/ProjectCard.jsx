import { Link } from "react-router-dom";
export default function ProjectCard({ project }) {
  return (
    <article className="card">
      <div className="row"><h3>{project.title}</h3><span className="tag">{project.category}</span></div>
      <p className="muted">{project.description?.slice(0, 130)}{project.description?.length > 130 ? "..." : ""}</p>
      <div className="tags">{(project.requiredSkills || []).map(s => <span className="tag" key={s}>{s}</span>)}</div>
      <p className="muted">Team: {(project.members?.length || 0)} / {project.teamSize}</p>
      <Link className="btn small" to={`/projects/${project._id}`}>View Project</Link>
    </article>
  );
}
