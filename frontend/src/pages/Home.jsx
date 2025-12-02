import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import axios from "axios";
import "../styles/Home.css";

export default function Home() {
  const [chips, setChips] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [selectedChips, setSelectedChips] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  

  // 🔹 Skillek (chipek) betöltése az adatbázisból
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const resp = await fetch("http://localhost:3001/skills");
        const data = await resp.json();
        // backend: SELECT * FROM skills => { SkillID, Skill }
        setChips(data.map((s) => s.Skill));
      } catch (err) {
        console.error("Hiba a skillek lekérésekor:", err);
      }
    };
    
    loadSkills();
  }, []);
  useEffect(() => {
    axios.get("http://localhost:3001/auth/status", { withCredentials: true })
      .then((response) => {
        setIsLoggedIn(response.data.loggedIn);
        console.log("Bejelentkezve:", response.data.loggedIn);
      })
      .catch((error) => {
        console.error("Hiba a bejelentkezési állapot lekérésekor:", error);
      });
    
  }, []);
  // 🔹 Kártyák betöltése az új /cards endpointból
  useEffect(() => {
    const loadCards = async () => {
      try {
        const resp = await fetch("http://localhost:3001/cards");
        const data = await resp.json();
        // data már ilyen formában jön: { id, title, items, users }
        setAllCards(data);
      } catch (err) {
        console.error("Hiba a kártyák lekérésekor:", err);
      }
    };
    loadCards();
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

  // 🔹 Szűrés több chip alapján – OR logika
  const filteredCards =
    selectedChips.length === 0
      ? allCards
      : allCards.filter((card) => {
          const text = (card.title + " " + card.items.join(" ")).toLowerCase();
          return selectedChips.some((chip) =>
            text.includes(chip.toLowerCase())
          );
        });

  return (
    <div className="sb-page">
      <Header/>

      <main className="sb-content">
        {/* Kereső + chipek */}
        <section className="sb-search-wrap">
          <div className="sb-search">
            <input type="text" placeholder="Search here" aria-label="Keresés" />
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

        {/* SZŰRT KÁRTYÁK */}
        <section className="sb-cards">
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              title={card.title}
              items={card.items}
              users={card.users}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

function Card({ title, items, users }) {
  return (
    <article className="sb-card">
      <div className="sb-card-badge" />
      <h3>{title}</h3>
      <ol className="sb-list">
        {items.map((it, i) => (
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
