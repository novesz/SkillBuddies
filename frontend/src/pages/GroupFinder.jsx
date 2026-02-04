import React, { useState, useEffect } from "react";
import { useGroupFinder } from "../context/GroupFinderContext";
import "../styles/GroupFinder.css";

/**
 * Kisablak (modal) a képernyő közepén: "Join a group by Id!" – ID mező, Join gomb.
 * A navbar "Join by ID" gombja megnyitja; a háttér (pl. főoldal) látható marad.
 * Egyelőre nem küld semmit a szervernek; a piros hiba csak példaként / későbbi használatra.
 */
export default function GroupFinderModal() {
  const { close } = useGroupFinder();
  const [groupId, setGroupId] = useState("");
  const [error, setError] = useState(""); // pl. "Wrong ID!" – egyelőre nem töltjük fel logikával

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  const handleClose = (e) => {
    if (e?.target?.dataset?.backdrop !== undefined) close();
  };

  const handleJoin = (e) => {
    e.preventDefault();
    setError(""); // később: API hívás, sikeres / sikertelen → setError("Wrong ID!") vagy átirányítás
    // Egyelőre nem csinálunk semmit
  };

  return (
    <div
      className="groupfinder-backdrop"
      data-backdrop
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="groupfinder-title"
    >
      <div className="groupfinder-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="groupfinder-close"
          aria-label="Close"
          onClick={close}
        >
          ×
        </button>
        <h2 id="groupfinder-title" className="groupfinder-title">
          Join a group by Id!
        </h2>
        <form onSubmit={handleJoin}>
          <input
            type="text"
            className="groupfinder-input"
            placeholder="Group Id"
            value={groupId}
            onChange={(e) => {
              setGroupId(e.target.value);
              setError("");
            }}
            aria-label="Group Id"
          />
          {error && <p className="groupfinder-error">{error}</p>}
          <button type="submit" className="groupfinder-join">
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
