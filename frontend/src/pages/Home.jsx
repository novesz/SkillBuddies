import React from "react";
import Header from "../components/header/Header";
import "../styles/Home.css";

export default function Home() {
  const chips = [
  "Math",
  "History",
  "Crocheting",
  "Music",
  "Hungarian",
  "Drawing",
  "Rock Climbing",
  "Photography"
                ];


  return (
    <div className="sb-page">
      <Header />

      <main className="sb-content">
        {/* Kereső + chipek */}
        <section className="sb-search-wrap">
          <div className="sb-search">
            <input type="text" placeholder="Search here" aria-label="Keresés" />
            <svg className="sb-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
              <line x1="16.5" y1="16.5" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <ul className="sb-chips">
            {chips.map(c => <li key={c}>{c}</li>)}
          </ul>
        </section>

        {/* Kártyák */}
        <section className="sb-cards">
          <Card
            title="HUMANITIES"
            items={[
              "Hungarian (Intermediate)",
              "History (Basic–Intermediate)",
              "Foreign Language – English (A2–B2)",
              "Foreign Language – German (A1–B1)"
            ]}
            users={69}
          />

          <Card
            title="OUTDOOR HOBBIES"
            items={["Gardening", "Hiking", "Cycling"]}
            users={120}
          />

          <Card
            title="ARTS"
            items={["Painting", "Sculpture", "Music", "Literature", "Photography"]}
            users={42}
          />

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
        {items.map((it,i)=><li key={i}>{it}</li>)}
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
