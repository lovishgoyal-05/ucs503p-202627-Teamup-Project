import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link className="brand" to="/">TeamUp</Link>
        <nav className="nav-links">
          <Link to="/explore">Explore</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/projects">My Projects</Link>
              <Link to="/teams">My Teams</Link>
              <Link to="/profile">Profile</Link>
              <button className="btn small" onClick={() => { logout(); navigate("/"); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link className="btn small" to="/register">Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
