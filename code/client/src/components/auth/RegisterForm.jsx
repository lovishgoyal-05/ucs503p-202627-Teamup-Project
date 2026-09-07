import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RegisterForm() {
  const [form, setForm] = useState({ name:"", email:"", password:"", college:"", course:"", year:"" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try { await register(form); navigate("/dashboard"); }
    catch (err) { setError(err.response?.data?.message || "Registration failed"); }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Create your TeamUp account</h2>
      {error && <div className="error">{error}</div>}
      {["name","email","password","college","course","year"].map(key => (
        <div className="field" key={key}>
          <label>{key[0].toUpperCase()+key.slice(1)}</label>
          <input type={key==="password"?"password":"text"} required={["name","email","password"].includes(key)}
            value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>
        </div>
      ))}
      <button className="btn">Register</button>
    </form>
  );
}
