import React, { useState, useEffect } from "react";
import "../styles/GroupEditor.css";
import Header from "../components/header/Header";

export default function GroupEditor() {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const MAX_WORDS = 250;
  const MAX_CHARS = 10000000; // ezt bármikor átírhatod másra


  const avatars = [
    "/groupavatars/Ant.png",
  ];

  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [createdChatId, setCreatedChatId] = useState(null);

  const currentUserId = 8;

  // 🔹 skillek betöltése
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

  // 🔹 leírás változás – max. 250 szó
  const handleDescriptionChange = (e) => {
  let value = e.target.value || "";

  // 1) KARAKTER LIMIT – ne lehessen végtelenül spamelni
  if (value.length > MAX_CHARS) {
    value = value.slice(0, MAX_CHARS);
  }

  // ha üres, töröljük
  if (value.trim() === "") {
    setDescription("");
    return;
  }

  // 2) SZÓ LIMIT – max. 250 szó
  const words = value.trim().split(/\s+/);

  if (words.length <= MAX_WORDS) {
    // ha még belefér 250-be, mehet teljesen (már levágva MAX_CHARS-re)
    setDescription(value);
  } else {
    // ha több lenne, akkor csak az első 250 szót tartjuk meg
    const limited = words.slice(0, MAX_WORDS).join(" ");
    setDescription(limited);
  }
};


  // 🔹 avatar lapozás
  const handlePrevAvatar = () =>
    setAvatarIndex((prev) => (prev === 0 ? avatars.length - 1 : prev - 1));

  const handleNextAvatar = () =>
    setAvatarIndex((prev) => (prev === avatars.length - 1 ? 0 : prev + 1));

  // 🔹 kiválasztott skillek objektumai
  const selectedSkills = allSkills.filter((s) =>
    selectedSkillIds.includes(s.SkillID)
  );

  // 🔹 keresési találatok
  const filteredSkills = allSkills
    .filter((s) => s.Skill.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((s) => !selectedSkillIds.includes(s.SkillID))
    .slice(0, 6);

  const handleAddSkill = (id) => {
    setSelectedSkillIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSearchTerm("");
  };

  const handleRemoveSkill = (id) =>
    setSelectedSkillIds((prev) => prev.filter((x) => x !== id));

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSkills.length > 0) handleAddSkill(filteredSkills[0].SkillID);
    }
  };

  const handleCancel = () => {
    setGroupName("");
    setDescription("");
    setSelectedSkillIds([]);
    setAvatarIndex(0);
    setError("");
    setSuccess("");
    setSearchTerm("");
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!groupName.trim()) {
      setError("Adj meg egy csoportnevet!");
      return;
    }

    if (selectedSkillIds.length === 0) {
      setError("Válassz legalább egy skillt!");
      return;
    }

    const payload = {
      chatName: groupName,
      chatPic: avatars[avatarIndex],
      skillIds: selectedSkillIds,
      userId: currentUserId,
    };

    try {
      const resp = await fetch("http://localhost:3001/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Ismeretlen hiba történt.");
      }

      setCreatedChatId(data.chatId);
      setSuccess("Csoport sikeresen létrehozva! 🎉");
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const closeModal = () => setShowModal(false);

  return (
    <>
      {/* 🔵 TELJES OLDAL KÉK HÁTTÉRREL */}
      <div className="page-blue">
        <Header />

        {/* kártya a header alatt */}
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

                    {/* csak az aktuális avatar látszik */}
                    <button
                      type="button"
                      className="avatar-circle avatar-circle--active"
                    >
                      <img
                        src={avatars[avatarIndex]}
                        alt="Group avatar"
                      />
                    </button>

                    <button
                      type="button"
                      className="avatar-nav-btn"
                      onClick={handleNextAvatar}
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Group name</label>
                  <input
                    className="text-input"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Frontend study buddies"
                  />
                </div>

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

              {/* JOBB OLDAL - SKILLEK */}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                </div>

                {searchTerm && filteredSkills.length > 0 && (
                  <div className="skills-suggestions">
                    {filteredSkills.map((skill) => (
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
            <button className="btn-primary" onClick={closeModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
