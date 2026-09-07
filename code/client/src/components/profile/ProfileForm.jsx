import { useState } from "react";
import { updateProfile } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

export default function ProfileForm() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name:user?.name||"", college:user?.college||"", course:user?.course||"",
    year:user?.year||"", bio:user?.bio||"", skills:(user?.skills||[]).join(", "),
    interests:(user?.interests||[]).join(", ")
  });
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    const { data } = await updateProfile({
      ...form,
      skills: form.skills.split(",").map(x=>x.trim()).filter(Boolean),
      interests: form.interests.split(",").map(x=>x.trim()).filter(Boolean)
    });
    setUser(data.user); setMessage("Profile updated.");
  }
  return <form className="card form" onSubmit={submit}>
    <h2>Edit Profile</h2>{message&&<div className="success">{message}</div>}
    {Object.keys(form).map(key=><div className="field" key={key}><label>{key[0].toUpperCase()+key.slice(1)}</label>{key==="bio"?<textarea value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>:<input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>}</div>)}
    <button className="btn">Save</button>
  </form>;
}
