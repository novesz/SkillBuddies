import { useState } from "react";

export default function SkillManager({ skills, onAdd, onRemove }) {
  const [value, setValue] = useState("");

  const tryAdd = () => {
    const s = value.trim();
    if (s) onAdd(s);
    setValue("");
  };

  return (
    <section className="skills-section card">
      <div className="skills-title">Skills</div>

      <div className="tag-list">
        {skills.map((s) => (
          <span className="tag" key={s}>
            {s}
            <button
              type="button"
              className="tag-x"
              aria-label={`Remove ${s}`}
              onClick={() => onRemove(s)}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="add-row">
        <input
          className="input"
          placeholder="Add a skill…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? tryAdd() : null)}
        />
        <button className="btn" type="button" onClick={tryAdd}>
          Add
        </button>
      </div>
    </section>
  );
}
