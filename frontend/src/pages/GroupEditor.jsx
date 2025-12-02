import React, { useState, useEffect } from "react";
import "../styles/GroupEditor.css";
import Header from "../components/header/Header";

export default function GroupEditor() {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);

  const avatars = [
    "/avatars/BB.png","/avatars/BC.png","/avatars/BD.png",
    
  ];

  // 🔹 DB-ből jövő összes skill
  const [allSkills, setAllSkills] = useState([]); // [{ SkillID, Skill }, ...]
  // 🔹 Ehhez a csoporthoz kiválasztott skillek ID-i
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  // 🔹 Keresőmező tartalma
  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Popup (modal) a sikeres mentéshez
  const [showModal, setShowModal] = useState(false);
  const [createdChatId, setCreatedChatId] = useState(null);

  // TODO: bejelentkezett user ID (később context / JWT)
  const currentUserId = 8; // csak példa

  // 🔹 Skillek lekérése az adatbázisból
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

  const handlePrevAvatar = () => {
    setAvatarIndex((prev) => (prev === 0 ? avatars.length - 1 : prev - 1));
  };

  const handleNextAvatar = () => {
    setAvatarIndex((prev) => (prev === avatars.length - 1 ? 0 : prev + 1));
  };

  // 🔹 A kiválasztott skillek objektumai
  const selectedSkills = allSkills.filter((s) =>
    selectedSkillIds.includes(s.SkillID)
  );

  // 🔹 Keresési találatok (ami még nincs kiválasztva)
  const filteredSkills = allSkills
    .filter((s) =>
      s.Skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((s) => !selectedSkillIds.includes(s.SkillID))
    .slice(0, 6); // max 6 javaslat

  const handleAddSkill = (skillId) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev : [...prev, skillId]
    );
    setSearchTerm("");
  };

  const handleRemoveSkill = (idToRemove) => {
    setSelectedSkillIds((prev) => prev.filter((id) => id !== idToRemove));
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSkills.length > 0) {
        handleAddSkill(filteredSkills[0].SkillID);
      }
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
      setError("Válassz legalább egy skillt a csoporthoz!");
      return;
    }

    const payload = {
      chatName: groupName,
      chatPic: avatars[avatarIndex],
      // description: jelenlegi adatbázisban nincs mező rá, ezért nem küldjük
      skillIds: selectedSkillIds,
      userId: currentUserId,
    };

    try {
      const resp = await fetch("http://localhost:3001/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Ismeretlen hiba a csoport létrehozásakor.");
      }

      setCreatedChatId(data.chatId);
      setSuccess("Csoport sikeresen létrehozva! 🎉");
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    // ha akarod, itt át is navigálhatsz a csoport oldalára:
    // navigate(`/group/${createdChatId}`);
  };

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <h2>Create group</h2>
            <p>Set up a new group and add the skills you want to share or learn.</p>
          </div>

          <div className="profile-grid">
            {/* BAL OLDAL – csoport adatok */}
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

                  <div className="avatar-list">
                    {avatars.map((src, index) => (
                      <button
                        key={src}
                        type="button"
                        className={
                          "avatar-circle" +
                          (index === avatarIndex ? " avatar-circle--active" : "")
                        }
                        onClick={() => setAvatarIndex(index)}
                      >
                        <img src={src} alt="Group avatar" />
                      </button>
                    ))}
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

              <div className="field">
                <label className="field-label">Group name</label>
                <input
                  className="text-input"
                  placeholder="e.g. Frontend study buddies"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label">Description</label>
                <textarea
                  className="text-area"
                  rows={3}
                  placeholder="Short description of your group..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </section>

            {/* JOBB OLDAL – skillek kereséssel */}
            <section className="profile-section">
              <h3 className="section-title">Group skills</h3>

              {/* Kiválasztott skillek chipként */}
              <div className="skills-chips">
                {selectedSkills.map((skill) => (
                  <span key={skill.SkillID} className="skill-chip">
                    {skill.Skill}
                    <button
                      type="button"
                      className="skill-chip-remove"
                      onClick={() => handleRemoveSkill(skill.SkillID)}
                      aria-label={`Remove ${skill.Skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {selectedSkills.length === 0 && (
                  <p className="skills-empty">
                    No skills yet. Start typing to search…
                  </p>
                )}
              </div>

              {/* Kereső input */}
              <div className="skills-input-row">
                <input
                  className="text-input"
                  placeholder="Search skills…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>

              {/* Javaslatok a keresés alapján */}
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
          {success && !showModal && <p className="form-success">{success}</p>}

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

      {/* Popup modal a sikeres mentéshez */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Group created</h3>
            <p>Your group has been created successfully. 🎉</p>
            <button className="btn-primary" onClick={closeModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
