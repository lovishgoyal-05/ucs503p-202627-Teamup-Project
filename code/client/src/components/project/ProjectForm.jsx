import { useState } from "react";
import { createProject } from "../../services/projectService";
import { PROJECT_CATEGORIES } from "../../utils/constants";

export default function ProjectForm({ onCreated }) {
  const [form, setForm] = useState({ title:"", description:"", category:PROJECT_CATEGORIES[0], requiredSkills:"", teamSize:4, deadline:"" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await createProject({
        ...form,
        requiredSkills: form.requiredSkills.split(",").map(s=>s.trim()).filter(Boolean),
        teamSize: Number(form.teamSize)
      });
      onCreated?.(data.project);
      setForm({ title:"", description:"", category:PROJECT_CATEGORIES[0], requiredSkills:"", teamSize:4, deadline:"" });
    } catch (err) { setError(err.response?.data?.message || "Could not create project"); }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Create Project</h2>
      {error && <div className="error">{error}</div>}
      <div className="field"><label>Title</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
      <div className="field"><label>Description</label><textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
      <div className="field"><label>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{PROJECT_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="field"><label>Required skills (comma separated)</label><input placeholder="React, Node.js, MongoDB" value={form.requiredSkills} onChange={e=>setForm({...form,requiredSkills:e.target.value})}/></div>
      <div className="field"><label>Team size</label><input type="number" min="1" max="20" value={form.teamSize} onChange={e=>setForm({...form,teamSize:e.target.value})}/></div>
      <div className="field"><label>Deadline</label><input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></div>
      <button className="btn">Create Project</button>
    </form>
  );
}
