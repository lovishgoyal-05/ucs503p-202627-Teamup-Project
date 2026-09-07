import { useState } from "react";
import { createTeam } from "../../services/teamService";
export default function CreateTeam({ projectId, onCreated }) {
  const [name, setName] = useState("");
  async function submit(e) {
    e.preventDefault();
    const { data } = await createTeam({ name, project: projectId });
    onCreated?.(data.team);
  }
  return <form className="card" onSubmit={submit}><h3>Create Team</h3><div className="field"><label>Team name</label><input required value={name} onChange={e=>setName(e.target.value)}/></div><button className="btn">Create</button></form>;
}
