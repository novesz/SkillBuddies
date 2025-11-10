import { useState } from "react";
import { useUser } from "../../context/UserContext";

const PRESETS = [
  "/avatars/BB.png","/avatars/BC.png","/avatars/BD.png",
  "/avatars/GS.png","/avatars/OD.png","/avatars/PB.png",
  "/avatars/PC.png","/avatars/RB.png","/avatars/RD.png",
  "/avatars/YC.png","/avatars/YS.png",
];

export default function AvatarPicker() {
  const { avatarUrl, setAvatarUrl } = useUser();
  const [pending, setPending] = useState(avatarUrl); // lokális kiválasztás

  const onSave = () => {
    setAvatarUrl(pending);       // globális állapot + localStorage frissül
  };

  return (
    <section className="avatar-section card">
      <div className="avatar-title">Profile picture</div>

      <div className="avatar-strip">
        {PRESETS.map(src => (
          <button
            key={src}
            className={`preset ${pending === src ? "active" : ""}`}
            style={{ backgroundImage: `url(${src})` }}
            onClick={() => setPending(src)}
            aria-pressed={pending === src}
            title="Use this avatar"
          />
        ))}
      </div>

      <div className="row-right" style={{ marginTop: 10 }}>
        <button
          className="btn"
          type="button"
          onClick={() => setPending(avatarUrl)}
          disabled={pending === avatarUrl}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={onSave}
          disabled={pending === avatarUrl}
        >
          Save
        </button>
      </div>
    </section>
  );
}
