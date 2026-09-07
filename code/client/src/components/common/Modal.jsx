export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",display:"grid",placeItems:"center",zIndex:20}}>
      <div className="card" style={{width:"min(520px,92%)"}}>
        <div className="row"><h3>{title}</h3><button onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  );
}
