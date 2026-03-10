# Snapshot before refactor (Admin panel + DataSet + cleanup)

**Dátum:** 2026-02-24 (vagy aktuális)

## Változtatások összefoglalva
- **DataSet.sql** – bővítve minta adatokkal (új userek, ticketek, chatek, üzenetek, adminok).
- **Backend** – `/auth/status` visszaadja a `rankID`-t; `/checkAdmin` javítva (rankID >= 2).
- **Navbar** – „Admin panel” link csak rank >= 2 esetén; a főoldali gomb eltávolítva a Header-ből.
- **AdminPanelDownload** – Telepítési útmutató mindenkinek; letöltés mindenkinek (vizsga doc); api client használat.
- **Spaghetti** – Rank és api központi használat; duplikátumok csökkentése.

## Ha vissza kell állni
- Git: `git checkout -- <file>` a módosított fájlokra, vagy `git stash` / korábbi commit.
- DataSet: a régi DataSet.sql tartalma a git history-ban marad; új minta adatokat lehet külön branch-en tartani.

## Módosított fájlok (lista)
- `DataSet.sql` – új userek (4,5,6), ticketek, msgs, uac, uas
- `backend/server.js` – auth/status + rankID, checkAdmin (req.userId, rankID >= 2)
- `frontend/src/App.jsx` – api, userRank a contextbe, setUserRank
- `frontend/src/context/UserContext.jsx` – userRank, setUserRank
- `frontend/src/components/header/Header.jsx` – api, userRank → Navbar, Admin gomb eltávolítva
- `frontend/src/components/header/Navbar.jsx` – Admin panel link ha userRank >= 2
- `frontend/src/pages/AdminPanelDownload.jsx` – telepítési útmutató + letöltés mindenkinek
- `frontend/src/App.css` – .admin-panel-page stílusok
