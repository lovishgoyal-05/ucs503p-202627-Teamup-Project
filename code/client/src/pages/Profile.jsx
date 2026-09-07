import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileCard from "../components/profile/ProfileCard";
export default function Profile(){ const {user}=useAuth(); return <div className="page"><div className="row"><h1>My Profile</h1><Link className="btn" to="/profile/edit">Edit Profile</Link></div><ProfileCard user={user}/></div>; }
