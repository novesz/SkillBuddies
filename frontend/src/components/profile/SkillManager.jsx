import { useState, useEffect } from "react";

export default function SkillManager({ skills, onAdd, onRemove }) {
  const [value, setValue] = useState("");
  const [allSkills, setAllSkills] = useState([]);       // minden skill a DB-ből
  const [suggestions, setSuggestions] = useState([]);   // autocomplete lista

  // 1) Összes skill betöltése az adatbázisból
  useEffect(() => {
    fetch("http://localhost:3001/skills")
      .then((res) => res.json())
      .then((data) => {
        // data: pl. [{SkillID: 1, Skill: "C#"}, ...]
        setAllSkills(data.map((s) => s.Skill)); // csak a nevek kellenek ide
      })
      .catch((err) => console.error("Error loading skills", err));
  }, []);

  // 2) Javaslatok frissítése, ha változik az input
  useEffect(() => {
    const text = value.trim().toLowerCase();

    if (!text) {
      setSuggestions([]);
      return;
    }

    const filtered = allSkills
      .filter(
        (skill) =>
          skill.toLowerCase().startsWith(text) && !skills.includes(skill)
      )
      .slice(0, 5); // max 5 javaslat

    setSuggestions(filtered);
  }, [value, allSkills, skills]);

  // 3) Megnézzük, hogy az input pontosan egyezik-e egy létező skill névvel
  const trimmed = value.trim();
  const exactMatch =
    trimmed &&
    allSkills.find(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );

  // Csak akkor engedünk hozzáadni, ha létezik ilyen skill ÉS még nincs a listában
  const canAdd = !!exactMatch && !skills.includes(exactMatch);

  // 4) Hozzáadás (Enter vagy Add gomb)
  const tryAdd = () => {
    if (!canAdd || !exactMatch) return;

    onAdd(exactMatch);          // szülő komponensnek továbbadjuk
    setValue("");              // input ürítés
    setSuggestions([]);        // javaslatlista eltüntetése
  };

  // 5) Ha a javaslatra kattint, azt adjuk hozzá
  const handleSuggestionClick = (skill) => {
    if (skills.includes(skill)) return;

    onAdd(skill);
    setValue("");
    setSuggestions([]);
  };

  return (
    <section className="skills-section card">
      <div className="skills-title">Skills</div>

      {/* már meglévő skillek */}
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
      <div className="skills-input-wrapper">
        <input
          className="input"
          placeholder="Add a skill…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? tryAdd() : null)}
        />

        {/* DROPDOWN – az input ALATT */}
        {suggestions.length > 0 && (
          <ul className="skills-suggestions">
            {suggestions.map((skill) => (
              <li
                key={skill}
                onClick={() => handleSuggestionClick(skill)}
              >
                {skill}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        className="btn"
        type="button"
        onClick={tryAdd}
        disabled={!canAdd}
      >
        Add
      </button>
    </div>
  </section>
);
}
