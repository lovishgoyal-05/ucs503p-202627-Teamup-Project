import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try { await login(form); navigate("/dashboard"); }
    catch (err) { setError(err.response?.data?.message || "Login failed"); }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
      <div className="field"><label>Password</label><input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
      <button className="btn">Login</button>
    </form>
  );
}
