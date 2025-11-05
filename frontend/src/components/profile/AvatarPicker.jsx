import { useRef } from "react";

const PRESETS = [
  "/avatars/cat.png",
  "/avatars/dog.png",
  "/avatars/bunny.png",
  "/avatars/snake.png",
];

export default function AvatarPicker({ value, onChange }) {
  const fileRef = useRef(null);

  return (
    <section className="avatar-section card">
      <div className="avatar-title">Profile picture</div>

      <div className="avatar-row">
        <button
          className="avatar-circle"
          aria-label="Change profile picture"
          onClick={() => fileRef.current?.click()}
          title="Click to upload"
          style={{
            backgroundImage: value ? `url(${value})` : "none",
          }}
        >
          {!value && <span className="avatar-plus">+</span>}
        </button>

        <div className="avatar-grid">
          {PRESETS.map((src) => (
            <button
              key={src}
              type="button"
              className={`preset ${value === src ? "active" : ""}`}
              style={{ backgroundImage: `url(${src})` }}
              onClick={() => onChange(src)}
              aria-label="Choose preset"
            />
          ))}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file); // előnézethez
          onChange(url);
          // TODO: feltöltés a backendre, majd kapott URL-t onChange(url)-lal menteni
        }}
      />
    </section>
  );
}
