import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Explore from "../pages/Explore";
import Projects from "../pages/Projects";
import ProjectDetails from "../pages/ProjectDetails";
import Teams from "../pages/Teams";
import TeamDetails from "../pages/TeamDetails";
import Profile from "../pages/Profile";
import EditProfile from "../pages/EditProfile";
import MyTeams from "../pages/MyTeams";
import MyProjects from "../pages/MyProjects";
import NotFound from "../pages/NotFound";

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/explore" element={<Explore/>}/>
    <Route path="/projects/:id" element={<ProjectDetails/>}/>
    <Route path="/teams/:id" element={<TeamDetails/>}/>
    <Route path="/dashboard" element={<Private><Dashboard/></Private>}/>
    <Route path="/projects" element={<Private><MyProjects/></Private>}/>
    <Route path="/projects/new" element={<Private><Projects/></Private>}/>
    <Route path="/teams" element={<Private><MyTeams/></Private>}/>
    <Route path="/profile" element={<Private><Profile/></Private>}/>
    <Route path="/profile/edit" element={<Private><EditProfile/></Private>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes>;
}
