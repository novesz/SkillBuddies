import { useRef } from "react";

const PRESETS = [
  "/avatars/BB.png",
  "/avatars/BC.png",
  "/avatars/BD.png",
  "/avatars/GS.png",
  "/avatars/OD.png",
  "/avatars/PB.png",
  "/avatars/PC.png",
  "/avatars/RB.png",
  "/avatars/RD.png",
  "/avatars/YC.png",
  "/avatars/YS.png",
];

export default function AvatarPicker({ value, onChange }) {
  const stripRef = useRef(null);

  const scrollBy = (dx) => {
    stripRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <section className="avatar-section card">
      <div className="avatar-title">Profile picture</div>

      <div className="avatar-strip-wrap">
        <button
          className="nav-btn"
          onClick={() => scrollBy(-280)}
          aria-label="Previous"
        >
          ‹
        </button>

        <div className="avatar-strip" ref={stripRef}>
          {PRESETS.map((src) => (
            <button
              key={src}
              type="button"
              className={`preset ${value === src ? "active" : ""}`}
              style={{ backgroundImage: `url(${src})` }}
              onClick={() => onChange(src)}
              aria-label="Choose avatar"
            />
          ))}
        </div>

        <button
          className="nav-btn"
          onClick={() => scrollBy(280)}
          aria-label="Next"
        >
          ›
        </button>
      </div>
    </section>
  );
}
