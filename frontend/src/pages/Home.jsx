import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import axios from "axios";
import "../styles/Home.css";

export default function Home({isLoggedIn, setIsLoggedIn}) {
  
  const [chips, setChips] = useState([]);          // skill-nevek a chipekhez
  const [allCards, setAllCards] = useState([]);    // összes csoport
  const [selectedChips, setSelectedChips] = useState([]); // kiválasztott skillek
  const [searchText, setSearchText] = useState("");        // csoportnév kereső
  const [error, setError] = useState("");

  // 🔹 Skillek (chipek) betöltése az adatbázisból
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const resp = await fetch("http://localhost:3001/skills");
        if (!resp.ok) throw new Error("Nem sikerült a skillek lekérése.");
        const data = await resp.json();
        // backend: SELECT SkillID, Skill FROM skills
        setChips(data.map((s) => s.Skill)); // csak a nevek kellenek chipnek
      } catch (err) {
        console.error("Hiba a skillek lekérésekor:", err);
        setError("Nem sikerült betölteni a skilleket.");
      }
    };
    
    loadSkills();
  }, []);
  
  // 🔹 Kártyák betöltése az új /cards endpointból
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const resp = await fetch("http://localhost:3001/groups");
        if (!resp.ok) throw new Error("Nem sikerült a csoportok lekérése.");
        const data = await resp.json();

        // Normalizáljuk a backend adatot a kártyához
        const normalized = data.map((g) => ({
          id: g.ChatID,
          title: g.ChatName,
          skills: g.Skills ? g.Skills.split(", ").filter(Boolean) : [],
          users: g.MemberCount || 0,
          pic: g.ChatPic || null,
        }));

        setAllCards(normalized);
      } catch (err) {
        console.error("Hiba a csoportok lekérésekor:", err);
        setError("Nem sikerült betölteni a csoportokat.");
      }
    };
    loadGroups();
  }, []);

  // 🔹 Több chip kijelölése (toggle)
  const handleChipClick = (chip) => {
    setSelectedChips((prev) => {
      if (prev.includes(chip)) {
        // ha már benne van → vedd ki
        return prev.filter((c) => c !== chip);
      }
      // ha még nincs benne → add hozzá
      return [...prev, chip];
    });
  };

  // 🔹 Szűrés: csoportnév + skill chipek
  const filteredCards = allCards.filter((card) => {
    const titleText = card.title.toLowerCase();
    const search = searchText.toLowerCase();

    // név szerinti szűrés
    const matchesSearch =
      search === "" ? true : titleText.includes(search);

    // skill chipek szerinti szűrés
    const matchesChips =
      selectedChips.length === 0
        ? true
        : selectedChips.some((chip) =>
            card.skills.some((skill) =>
              skill.toLowerCase().includes(chip.toLowerCase())
            )
          );

    return matchesSearch && matchesChips;
  });

  return (
    <div className="sb-page">
      <Header isLoggedIn = {isLoggedIn} setIsLoggedIn = {setIsLoggedIn}/>

      <main className="sb-content">
        {/* Kereső + chipek */}
        <section className="sb-search-wrap">
          <div className="sb-search">
            <input
              type="text"
              placeholder="Search groups by name"
              aria-label="Csoport név szerinti keresés"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <svg className="sb-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <line
                x1="16.5"
                y1="16.5"
                x2="22"
                y2="22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <ul className="sb-chips">
            {chips.map((c) => (
              <li
                key={c}
                onClick={() => handleChipClick(c)}
                className={selectedChips.includes(c) ? "sb-chip active" : "sb-chip"}
              >
                {c}
              </li>
            ))}
          </ul>
        </section>

        {error && <p className="sb-error">{error}</p>}

        {/* SZŰRT CSOPORTKÁRTYÁK */}
        <section className="sb-cards">
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              title={card.title}
              skills={card.skills}
              users={card.users}
              pic={card.pic}
            />
          ))}

          {filteredCards.length === 0 && !error && (
            <p className="sb-empty">No groups match your filters.</p>
          )}
        </section>
      </main>
    </div>
  );
}

function Card({ title, skills, users, pic }) {
  return (
    <article className="sb-card">
      <div className="sb-card-badge" />

      <div className="sb-card-header">
        <div className="sb-card-avatar">
          {pic ? (
            <img src={pic} alt={title} />
          ) : (
            <span>{title.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <h3>{title}</h3>
      </div>

      <ol className="sb-list">
        {skills.length === 0 && <li>No skills specified yet.</li>}
        {skills.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ol>

      <div className="sb-card-footer">
        <div className="sb-avatars">
          <span className="sb-av"></span>
          <span className="sb-av"></span>
          <span className="sb-av"></span>
        </div>
        <span className="sb-count">{users} users</span>
        <button className="sb-join">Join</button>
      </div>
    </article>
  );
}
