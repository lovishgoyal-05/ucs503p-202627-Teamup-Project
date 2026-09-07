import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Dashboard() {
  const { user } = useAuth();
  return <div className="page"><h1>Welcome, {user?.name} 👋</h1><p className="muted">Ready to find your next teammate?</p>
    <div className="grid two" style={{marginTop:25}}>
      <div className="card"><h3>Explore projects</h3><p>Find projects that need your skills.</p><Link className="btn" to="/explore">Explore</Link></div>
      <div className="card"><h3>Create a project</h3><p>Have an idea? Start a project and build your team.</p><Link className="btn" to="/projects/new">Create Project</Link></div>
    </div>
  </div>;
}
