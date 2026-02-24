import React, { useState, useEffect } from "react";
import "../styles/GroupEditor.css";
import Header from "../components/header/Header";

const AVATARS = [
  "/groupavatars/Ant.png",
  "/groupavatars/Szarvi.png",
  "/groupavatars/Bodi.png",
];
const MAX_WORDS = 250;
const MAX_CHARS = 10000000;
const VISIBLE_AVATARS = 3;
const SKILLS_PER_PAGE = 5;

export default function GroupEditor({ isLoggedIn, setIsLoggedIn, userId = 0 }) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [avatarOffset, setAvatarOffset] = useState(0);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillSuggestionsOffset, setSkillSuggestionsOffset] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  const maxOffset = Math.max(0, AVATARS.length - VISIBLE_AVATARS);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const resp = await fetch("http://localhost:3001/skills");
        if (!resp.ok) throw new Error("Nem sikerült lekérni a skilleket.");
        const data = await resp.json();
        setAllSkills(data || []);
      } catch (err) {
        console.error(err);
        setError("Nem sikerült betölteni a skilleket.");
      }
    };
    fetchSkills();
  }, []);

  const handleDescriptionChange = (e) => {
    let value = e.target.value || "";
    if (value.length > MAX_CHARS) value = value.slice(0, MAX_CHARS);
    if (value.trim() === "") {
      setDescription("");
      return;
    }
    const words = value.trim().split(/\s+/);
    if (words.length <= MAX_WORDS) {
      setDescription(value);
    } else {
      setDescription(words.slice(0, MAX_WORDS).join(" "));
    }
  };

  const handlePrevAvatar = () => {
    setAvatarOffset((prev) => (prev === 0 ? maxOffset : prev - 1));
  };

  const handleNextAvatar = () => {
    setAvatarOffset((prev) => (prev === maxOffset ? 0 : prev + 1));
  };

  const selectedSkills = allSkills.filter((s) =>
    selectedSkillIds.includes(s.SkillID)
  );

  const filteredSkills = allSkills
    .filter((s) =>
      s.Skill.toLowerCase().startsWith(searchTerm.toLowerCase())
    )
    .filter((s) => !selectedSkillIds.includes(s.SkillID));

  const maxSkillOffset = Math.max(
    0,
    Math.ceil(filteredSkills.length / SKILLS_PER_PAGE) - 1
  );
  const visibleSkills = filteredSkills.slice(
    skillSuggestionsOffset * SKILLS_PER_PAGE,
    skillSuggestionsOffset * SKILLS_PER_PAGE + SKILLS_PER_PAGE
  );

  const handleAddSkill = (id) => {
    setSelectedSkillIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSearchTerm("");
    setSkillSuggestionsOffset(0);
  };

  const handleRemoveSkill = (id) =>
    setSelectedSkillIds((prev) => prev.filter((x) => x !== id));

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (visibleSkills.length > 0) handleAddSkill(visibleSkills[0].SkillID);
    }
  };

  const handlePrevSkillsPage = () => {
    setSkillSuggestionsOffset((prev) => Math.max(0, prev - 1));
  };

  const handleNextSkillsPage = () => {
    setSkillSuggestionsOffset((prev) => Math.min(maxSkillOffset, prev + 1));
  };

  const handleCancel = () => {
    setGroupName("");
    setDescription("");
    setSelectedSkillIds([]);
    setAvatarIndex(0);
    setAvatarOffset(0);
    setSkillSuggestionsOffset(0);
    setError("");
    setSuccess("");
    setSearchTerm("");
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!userId || userId < 1) {
      setError("Be kell jelentkezned a csoport létrehozásához.");
      return;
    }

    if (!groupName.trim()) {
      setError("Adj meg egy csoportnevet!");
      return;
    }

    if (selectedSkillIds.length === 0) {
      setError("Válassz legalább egy skillt!");
      return;
    }

    const payload = {
      chatName: groupName.trim(),
      chatPic: AVATARS[avatarIndex],
      skillIds: selectedSkillIds,
      userId: Number(userId),
    };

    try {
      const resp = await fetch("http://localhost:3001/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) throw new Error(data.error || data.message || "Ismeretlen hiba történt.");

      setSuccess("Csoport sikeresen létrehozva! 🎉");
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-blue">
        <Header isLoggedIn = {isLoggedIn} setIsLoggedIn = {setIsLoggedIn}/>

        <div className="profile-page">
          <div className="profile-card">
            <div className="profile-header">
              <h2>Create group</h2>
              <p>
                Set up a new group and add the skills you want to share or learn.
              </p>
            </div>

            <div className="profile-grid">
              {/* BAL OLDAL */}
              <section className="profile-section">
                <h3 className="section-title">Group details</h3>

                <div className="group-avatar-block">
                  <p className="field-label">Group avatar</p>
                  <div className="avatar-carousel">
                    <button
                      type="button"
                      className="avatar-nav-btn"
                      onClick={handlePrevAvatar}
                    >
                      ‹
                    </button>

                    <div className="avatar-carousel-window">
                      <div
                        className="avatar-carousel-track"
                        style={{
                          transform: `translateX(-${
                            avatarOffset * (100 / VISIBLE_AVATARS)
                          }%)`,
                        }}
                      >
                        {AVATARS.map((src, i) => (
                          <button
                            key={i}
                            type="button"
                            className={
                              "avatar-circle" +
                              (i === avatarIndex ? " avatar-circle--active" : "")
                            }
                            onClick={() => setAvatarIndex(i)}
                          >
                            <img src={src} alt={`Avatar ${i + 1}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="avatar-nav-btn"
                      onClick={handleNextAvatar}
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* GROUP NAME */}
                <div className="field">
                  <label className="field-label">Group name</label>
                  <input
                    className="text-input"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Frontend study buddies"
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="field">
                  <label className="field-label">
                    Description (max. 250 words)
                  </label>
                  <textarea
                    className="text-area"
                    rows={3}
                    placeholder="Short description of your group..."
                    value={description}
                    onChange={handleDescriptionChange}
                  />
                </div>
              </section>

              {/* JOBB OLDAL – SKILLEK */}
              <section className="profile-section">
                <h3 className="section-title">Group skills</h3>

                <div className="skills-chips">
                  {selectedSkills.map((skill) => (
                    <span key={skill.SkillID} className="skill-chip">
                      {skill.Skill}
                      <button
                        type="button"
                        className="skill-chip-remove"
                        onClick={() => handleRemoveSkill(skill.SkillID)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {selectedSkills.length === 0 && (
                    <p className="skills-empty">No skills yet. Start typing…</p>
                  )}
                </div>

                <div className="skills-input-row">
                  <input
                    className="text-input"
                    placeholder="Search skills…"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSkillSuggestionsOffset(0);
                    }}
                    onKeyDown={handleSearchKeyDown}
                  />
                </div>

                {searchTerm && filteredSkills.length > 0 && (
                  <div className="skills-filter-row">
                    <button
                      type="button"
                      className="avatar-nav-btn skills-filter-arrow"
                      aria-label="Previous skills"
                      onClick={handlePrevSkillsPage}
                      disabled={skillSuggestionsOffset === 0}
                    >
                      ‹
                    </button>
                    <div className="skills-filter-strip">
                      {visibleSkills.map((skill) => (
                        <button
                          key={skill.SkillID}
                          type="button"
                          className="skills-suggestion-item"
                          onClick={() => handleAddSkill(skill.SkillID)}
                        >
                          {skill.Skill}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="avatar-nav-btn skills-filter-arrow"
                      aria-label="Next skills"
                      onClick={handleNextSkillsPage}
                      disabled={skillSuggestionsOffset >= maxSkillOffset}
                    >
                      ›
                    </button>
                  </div>
                )}

                {searchTerm && filteredSkills.length === 0 && (
                  <p className="skills-empty">
                    No results for “{searchTerm}”.
                  </p>
                )}
              </section>
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && !showModal && (
              <p className="form-success">{success}</p>
            )}

            <div className="profile-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
              >
                Create group
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Group created</h3>
            <p>Your group has been created successfully 🎉</p>
            <button className="btn-primary" onClick={() => setShowModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
