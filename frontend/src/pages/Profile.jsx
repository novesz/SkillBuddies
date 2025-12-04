// Profile.jsx
import { useState, useEffect } from "react";
import AvatarPicker from "../components/profile/AvatarPicker.jsx";
import SkillManager from "../components/profile/SkillManager.jsx";
import PasswordPanel from "../components/profile/PasswordPanel.jsx";
import Header from "../components/header/Header.jsx";
import "../styles/Profile.css";

export default function Profile({isLoggedIn, setIsLoggedIn}) {
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatarUrl: "",
    skills: [],          // ⬅ ne legyen benne az üres string
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Ezt majd kiveszed localStorage-ből / contextből
  const userId = 8; // idegl. hardcode, hogy tudj tesztelni

  // profil betöltése belépéskor
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError("");
        const resp = await fetch(`http://localhost:3001/users/${userId}/profile`);
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Hiba a profil lekérésekor.");

        setUser({
          name: data.name || "",
          email: data.email || "",
          avatarUrl: data.avatarUrl || "",
          skills: data.skills || [],
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    loadProfile();
  }, [userId]);

  // Profil mentése (avatar + skillek)
  const handleSaveProfile = async () => {
    try {
      setError("");
      setMessage("");

      const resp = await fetch(`http://localhost:3001/users/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl: user.avatarUrl,
          skills: user.skills,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Hiba mentés közben.");

      setMessage("Profile saved successfully ✅");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <>
      <Header isLoggedIn = {isLoggedIn} setIsLoggedIn = {setIsLoggedIn}/>
      <main className="profile-wrap" >
        <section className="profile-card">
          <header className="profile-header">
            <h1>Profile</h1>
            <p className="muted">{user.email}</p>
          </header>

          <div className="profile-grid">
            <AvatarPicker
              value={user.avatarUrl}
              onChange={(url) => setUser((u) => ({ ...u, avatarUrl: url }))}
            />

            <SkillManager
              skills={user.skills}
              onAdd={(s) =>
                setUser((u) =>
                  u.skills.includes(s)
                    ? u
                    : { ...u, skills: [...u.skills, s] }
                )
              }
              onRemove={(s) =>
                setUser((u) => ({
                  ...u,
                  skills: u.skills.filter((x) => x !== s),
                }))
              }
            />
          </div>

          {/* Profil mentése */}
          <div className="row-right" style={{ marginTop: 16 }}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleSaveProfile}
            >
              Save profile
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}

          <PasswordPanel
            onSubmit={async ({ current, next }) => {
              // TODO: majd /change-password endpoint
              console.log("change password", { current, next });
            }}
          />

          <div className="logout-row">
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => {
                // TODO: token törlése + navigate("/")
                console.log("logout");
              }}
            >
              Log out
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
