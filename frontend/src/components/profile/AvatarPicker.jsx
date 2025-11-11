import React, { useRef, useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";

const PRESETS = [
  "/avatars/BB.png","/avatars/BC.png","/avatars/BD.png",
  "/avatars/GS.png","/avatars/OD.png","/avatars/PB.png",
  "/avatars/PC.png","/avatars/RB.png","/avatars/RD.png",
  "/avatars/YC.png","/avatars/YS.png",
];

export default function AvatarPicker() {
  const { avatarUrl, setAvatarUrl } = useUser();
  const [pending, setPending] = useState(avatarUrl);
  const listRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // görgethetőség figyelése
  const updateArrows = () => {
    const el = listRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateArrows); ro.disconnect(); };
  }, []);

  const scrollByAmount = (dir) => {
    const el = listRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const onSave = () => setAvatarUrl(pending);
  const onCancel = () => setPending(avatarUrl);

  return (
    <section className="avatar-section card">
      <div className="avatar-title">Profile picture</div>

      <div className="avatar-strip-wrap">
        <button
          type="button"
          className="nav-btn"
          aria-label="Scroll left"
          onClick={() => scrollByAmount(-1)}
          disabled={!canLeft}
        >‹</button>

        <div className="avatar-strip" ref={listRef}>
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

        <button
          type="button"
          className="nav-btn"
          aria-label="Scroll right"
          onClick={() => scrollByAmount(1)}
          disabled={!canRight}
        >›</button>
      </div>

      <div className="row-right" style={{ marginTop: 10 }}>
        <button className="btn" type="button" onClick={onCancel} disabled={pending === avatarUrl}>
          Cancel
        </button>
        <button className="btn btn-primary" type="button" onClick={onSave} disabled={pending === avatarUrl}>
          Save
        </button>
      </div>
    </section>
  );
}
