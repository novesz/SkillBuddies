import { useState, useId } from "react";

export default function PasswordPanel({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const titleId = useId();

  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) return alert("New passwords don't match.");
    await onSubmit({ current, next });
    setCurrent(""); setNext(""); setConfirm(""); setOpen(false);
  };

  return (
    <section className={`password-section ${open ? "open" : ""}`}>
      <button
        className="pw-heading"
        aria-expanded={open}
        aria-controls={titleId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Change password</span>
        <i className="chev" aria-hidden="true" />
      </button>

      <form
        id={titleId}
        className="pw-panel"
        onSubmit={submit}
        aria-hidden={!open}
      >
        <label className="field">
          <span>Current password</span>
          <input
            className="input"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>New password</span>
          <input
            className="input"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Confirm new password</span>
          <input
            className="input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>

        <div className="row-right">
          <button className="btn btn-primary" type="submit">
            Save password
          </button>
        </div>
      </form>
    </section>
  );
}
