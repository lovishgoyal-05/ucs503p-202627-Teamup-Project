export default function SkillList({ skills=[] }) { return <div className="tags">{skills.map(s=><span className="tag" key={s}>{s}</span>)}</div>; }
