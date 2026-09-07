import ProjectCard from "./ProjectCard";
export default function ProjectList({ projects = [] }) {
  if (!projects.length) return <p className="muted">No projects found.</p>;
  return <div className="grid">{projects.map(p => <ProjectCard project={p} key={p._id}/>)}</div>;
}
