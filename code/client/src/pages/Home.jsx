import { Link } from "react-router-dom";
export default function Home() {
  return <div className="page hero">
    <h1>Find your perfect team.</h1>
    <p>TeamUp helps students discover projects, meet skilled teammates, and build together for projects and hackathons.</p>
    <Link className="btn" to="/explore">Explore Projects</Link>{" "}
    <Link className="btn secondary" to="/register">Join TeamUp</Link>
    <div className="grid" style={{marginTop:50}}>
      <div className="card"><h3>Discover</h3><p className="muted">Find projects matching your interests and skills.</p></div>
      <div className="card"><h3>Connect</h3><p className="muted">Meet students looking for teammates.</p></div>
      <div className="card"><h3>Build</h3><p className="muted">Form teams and turn ideas into working projects.</p></div>
    </div>
  </div>;
}
