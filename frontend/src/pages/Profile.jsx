import { useState } from "react";
import AvatarPicker from "../components/profile/AvatarPicker.jsx";
import SkillManager from "../components/profile/SkillManager.jsx";
import PasswordPanel from "../components/profile/PasswordPanel.jsx";
import "../styles/Profile.css";

export default function Profile() {
  const [user, setUser] = useState({
    name: "Eszter",
    email: "eszter@example.com",
    avatarUrl: "",       // kezdetben üres → monogram/placeholder
    skills: ["guitar", "math", "C#", "JavaScript"],
  });

  return (
    <main className="profile-wrap">
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
                u.skills.includes(s) ? u : { ...u, skills: [...u.skills, s] }
              )
            }
            onRemove={(s) =>
              setUser((u) => ({ ...u, skills: u.skills.filter(x => x !== s) }))
            }
          />
        </div>

        <PasswordPanel
          onSubmit={async ({ current, next }) => {
            // TODO: hívd a backend /api/users/change-password endpointot
            console.log("change password", { current, next });
          }}
        />

        <div className="logout-row">
          <button
            className="btn btn-ghost-danger"
            type="button"
            onClick={() => {
              // TODO: töröld a tokent / cookie-t és navigate("/")
              console.log("logout");
            }}
          >
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}
