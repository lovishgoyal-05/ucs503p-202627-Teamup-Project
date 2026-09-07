import { useState } from "react";
import { requestToJoin } from "../../services/teamService";
export default function JoinTeamButton({ teamId }) {
  const [message, setMessage] = useState("");
  async function join() {
    try { await requestToJoin(teamId); setMessage("Request sent."); }
    catch (err) { setMessage(err.response?.data?.message || "Could not send request."); }
  }
  return <><button className="btn" onClick={join}>Request to Join</button>{message && <p className="muted">{message}</p>}</>;
}
