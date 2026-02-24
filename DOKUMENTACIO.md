# SkillBuddies – Részletes tanulási dokumentáció

Ez a dokumentum **minden oldalt és fontosabb kódrészletet** bemutat magyarázatokkal, hogy megértsd és meg tudd tanulni.

---

# 1. Technológiai stack

| Réteg | Technológia | Rövid leírás |
|-------|-------------|--------------|
| **Frontend** | React (Vite) | Komponens alapú UI |
| | React Router | Útvonalak (/chat, /profile stb.) |
| | Axios | HTTP kérések |
| | CSS | Megjelenés |
| **Backend** | Node.js + Express | REST API, WebSocket |
| | MySQL | Adatbázis |
| | JWT | Bejelentkezés token |
| | WebSocket | Valós idejű chat |

---

# 2. App.jsx – Az alkalmazás gyökere

Az **App** az egész alkalmazás szülő komponense: itt van az útvonalak kezelése és a globális állapot (bejelentkezés).

## 2.1 Importok

```javascript
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
```

- **useState** – lokális állapot (pl. isLoggedIn, userId)
- **useEffect** – mellékhatás (pl. API hívás betöltéskor)
- **Routes, Route** – React Router: melyik URL melyik komponenst jeleníti meg

## 2.2 Állapotok (state)

```javascript
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [userId, setUserId] = useState(0);
const [groupFinderOpen, setGroupFinderOpen] = useState(false);
```

| State | Típus | Mire jó |
|-------|-------|---------|
| `isLoggedIn` | boolean | Be van-e jelentkezve a felhasználó |
| `userId` | number | Bejelentkezett felhasználó ID-ja |
| `groupFinderOpen` | boolean | Nyitva van-e a „Join by ID” modál |

## 2.3 Bejelentkezés ellenőrzése betöltéskor

```javascript
useEffect(() => {
  axios
    .get("http://localhost:3001/auth/status", { withCredentials: true })
    .then((response) => {
      setIsLoggedIn(response.data.loggedIn);
      if (response.data.loggedIn) {
        setUserId(response.data.userId ?? 0);
        fetch("http://localhost:3001/users/me/profile", { credentials: "include" })
          .then((r) => r.json())
          .then((data) => {
            setAvatarUrl(data.avatarUrl || DEFAULT_AVATAR);
          })
          .catch((err) => console.error("Profile load on init:", err));
      } else {
        setUserId(0);
        setAvatarUrl(DEFAULT_AVATAR);
      }
    })
    .catch((error) => {
      console.error("Auth status error:", error);
      setIsLoggedIn(false);
      setUserId(0);
      setAvatarUrl(DEFAULT_AVATAR);
    });
}, [setAvatarUrl]);
```

**Mi történik:**
1. `auth/status` lekérdezi a cookie alapján, be van-e jelentkezve.
2. `withCredentials: true` – a cookie elküldése kliensről szerverre.
3. Ha be van jelentkezve: `userId` beállítása, profil adatok (pl. avatar) lekérése.
4. Ha nincs bejelentkezve: `userId` 0, avatar alapértelmezett.

## 2.4 Útvonalak (Routes)

```javascript
<Routes>
  <Route path="/" element={<Home isLoggedIn={...} setIsLoggedIn={...} />} />
  <Route path="/login" element={<LoginPage ... />} />
  <Route path="/profile" element={
    <PrivateRoute isLoggedIn={isLoggedIn}>
      <Profile isLoggedIn={...} setIsLoggedIn={...} userId={userId} />
    </PrivateRoute>
  } />
  <Route path="/profile/:userId" element={
    <PrivateRoute isLoggedIn={isLoggedIn}>
      <Profile ... />
    </PrivateRoute>
  } />
  <Route path="/usersettings" element={
    <PrivateRoute isLoggedIn={isLoggedIn}>
      <UserSettings ... />
    </PrivateRoute>
  } />
  <Route path="/chat" element={
    <PrivateRoute isLoggedIn={isLoggedIn}>
      <ChatPage ... userId={userId} />
    </PrivateRoute>
  } />
  <Route path="/chat/join/:code" element={
    <PrivateRoute isLoggedIn={isLoggedIn}>
      <JoinByCodePage />
    </PrivateRoute>
  } />
</Routes>
```

- **path="/profile/:userId"** – példa dinamikus útvonalra: `:userId` URL-ből kiolvasható.
- **PrivateRoute** – védett oldal: ha nincs bejelentkezve, átirányít `/login`-ra.

---

# 3. PrivateRoute – Védett oldalak

```javascript
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}
```

**Működés:**
- Ha `isLoggedIn` hamis → `<Navigate to="/login" replace />` átirányít a login oldalra.
- Ha `isLoggedIn` igaz → visszaadja a `children`-t (pl. ChatPage, Profile).

---

# 4. Header és PfDropdown

## 4.1 Header.jsx

```javascript
const [open, setOpen] = useState(false);
const hambRef = useRef(null);
const { avatarUrl } = useUser();

useEffect(() => {
  const onDocClick = (e) => {
    if (hambRef.current && !hambRef.current.contains(e.target)) {
      setOpen(false);
    }
  };
  const onKey = (e) => e.key === "Escape" && setOpen(false);
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKey);
  return () => {
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onKey);
  };
}, []);
```

**Magyarázat:**
- **hambRef** – referencia a hamburger gombra; azt ellenőrizzük, hogy a kattintás azon belül van-e.
- Ha kívülre kattint a felhasználó → menü bezárása.
- Escape billentyű → szintén bezárás.
- **return () => ...** – a `useEffect` cleanup függvénye: eseménykezelők eltávolítása az unmount-kor.

## 4.2 PfDropdown – Avatar menü

```javascript
const togglePopup = () => {
  if (!open && profileRef.current) {
    const rect = profileRef.current.getBoundingClientRect();
    setPopupPosition({
      top: rect.bottom,
      left: rect.left - 70,
    });
  }
  setOpen((prev) => !prev);
};
```

- **getBoundingClientRect()** – az avatar képernyőbeli pozíciója.
- A popup az avatar alá kerül (`top: rect.bottom`).

```javascript
{isLoggedIn ? (
  <>
    <Link to="/usersettings">User settings</Link>
    <Link to="/profile">Profile</Link>
    <button onClick={handleLogout}>Log out</button>
  </>
) : (
  <>
    <Link to="/login">Login</Link>
    <Link to="/register">Register</Link>
  </>
)}
```

- Bejelentkezve: User settings, Profile, Log out.
- Nincs bejelentkezve: Login, Register.

---

# 5. ChatPage – A chat oldal részletesen

## 5.1 Állapotok

```javascript
const [currentUserId, setCurrentUserId] = useState(null);
const [chats, setChats] = useState([]);           // Chat lista
const [selectedChat, setSelectedChat] = useState(null);  // Kiválasztott chat ID
const [messagesMap, setMessagesMap] = useState({});      // { chatId: [üzenetek] }
const [messageInput, setMessageInput] = useState("");
const [chatFilter, setChatFilter] = useState("all");     // "all" | "private" | "group"
const [menuOpen, setMenuOpen] = useState(false);
const [peopleOpen, setPeopleOpen] = useState(false);
const [selectedUserProfile, setSelectedUserProfile] = useState(null);

const ws = useRef(null);           // WebSocket kapcsolat
const chatEndRef = useRef(null);   // Scroll a végére
const lastSendAt = useRef(0);      // Dupla Enter védelem
```

**messagesMap példa:**
```javascript
{
  3: [{ MsgID: 1, text: "Szia!", username: "Te", type: "outgoing" }, ...],
  5: [{ MsgID: 2, text: "Helló", username: "Herpaulus", type: "incoming" }, ...]
}
```

## 5.2 Chat lista betöltése

```javascript
const fetchChats = () => {
  if (!currentUserId) return;
  axios
    .get(`http://localhost:3001/chats/users/${currentUserId}`)
    .then((res) => {
      setChats(res.data);
      if (!selectedChat && res.data.length > 0) {
        setSelectedChat(res.data[0].ChatID);  // Első chat kiválasztása
      }
    })
    .catch(console.error);
};

useEffect(() => {
  fetchChats();
}, [currentUserId]);
```

- `currentUserId` változásakor (pl. bejelentkezés) újra lekérik a chatek listáját.

## 5.3 WebSocket – Valós idejű üzenetek

```javascript
useEffect(() => {
  if (!currentUserId) return;

  ws.current = new WebSocket("ws://localhost:3001");

  ws.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "NEW_MESSAGE") {
      const msg = {
        MsgID: data.msg.MsgID,
        text: data.msg.Content,
        username: data.msg.UserID === currentUserId ? currentUsername : `User ${data.msg.UserID}`,
        type: data.msg.UserID === currentUserId ? "outgoing" : "incoming",
        UserID: data.msg.UserID,
      };

      setMessagesMap((prev) => {
        const list = prev[data.msg.ChatID] || [];
        const isOwn = data.msg.UserID === currentUserId;
        const replaceTemp = isOwn && list.some((m) => m.MsgID < 0 && m.text === data.msg.Content);
        const next = replaceTemp
          ? list.map((m) => (m.MsgID < 0 && m.text === data.msg.Content ? msg : m))
          : [...list, msg];
        return { ...prev, [data.msg.ChatID]: next };
      });
    }
  };

  return () => ws.current?.close();  // Cleanup: bezárás unmount-kor
}, [currentUserId, currentUsername]);
```

**Magyarázat:**
- WebSocket-kapcsolat a szerverrel (`ws://localhost:3001`).
- `NEW_MESSAGE` esetén az üzenet hozzáadódik a megfelelő chathez.
- `replaceTemp` – optimista küldésnél a temp üzenetet lecseréljük a valódi adatra (MsgID alapján).
- `return () => ws.current?.close()` – komponens elhagyásakor a kapcsolat lezárása.

## 5.4 Üzenet küldés (optimista frissítés)

```javascript
const handleSend = () => {
  if (!messageInput.trim() || selectedChat == null || currentUserId == null) return;

  // Dupla Enter védelem
  const now = Date.now();
  if (now - lastSendAt.current < 400) return;
  lastSendAt.current = now;

  const text = messageInput.trim();
  const tempId = -Date.now();  // Negatív ID = még nincs az adatbázisban

  // 1. Azonnal megjelenítjük (optimista)
  setMessagesMap((prev) => ({
    ...prev,
    [selectedChat]: [
      ...(prev[selectedChat] || []),
      { MsgID: tempId, text, username: currentUsername, type: "outgoing", UserID: currentUserId },
    ],
  }));
  setMessageInput("");

  // 2. Küldjük a szervernek
  axios
    .post("http://localhost:3001/messages/create", { ChatID: selectedChat, UserID: currentUserId, Content: text }, { withCredentials: true })
    .then((res) => {
      const realId = res.data?.MsgID;
      if (realId) {
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat]: (prev[selectedChat] || []).map((m) =>
            m.MsgID === tempId ? { ...m, MsgID: realId } : m
          ),
        }));
      }
    })
    .catch((err) => {
      setMessagesMap((prev) => ({
        ...prev,
        [selectedChat]: (prev[selectedChat] || []).filter((m) => m.MsgID !== tempId),
      }));
      alert("Failed to send message.");
    });
};
```

**Optimista frissítés:** előbb megjelenítjük az üzenetet, utána küldjük a szervernek. Ha sikerül, a temp ID-t lecseréljük a valódi ID-ra; ha hiba történik, eltávolítjuk.

## 5.5 Privát chat megnyitása (Message gomb)

```javascript
const handleOpenPrivateChat = (e, otherUserId, otherUsername) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();  // Ne propagálódjon a kattintás
  }
  const uid = Number(otherUserId);
  if (!uid || uid === Number(currentUserId)) return;

  setPrivateChatLoading(true);

  axios
    .post("http://localhost:3001/chats/private", { otherUserId: uid }, { withCredentials: true })
    .then((res) => {
      const chatId = res.data.ChatID;
      const name = res.data.otherUsername || otherUsername || "Private";

      setChats((prev) => {
        if (prev.some((c) => c.ChatID === chatId)) return prev;  // Már benne van
        return [...prev, { ChatID: chatId, ChatName: name, MemberCount: 2 }];
      });
      setSelectedChat(chatId);
      setSelectedUserProfile(null);
      setPeopleOpen(false);
    })
    .catch((err) => alert(err.response?.data?.error || "Could not open chat."))
    .finally(() => setPrivateChatLoading(false));
};
```

- Backend létrehozza vagy megkeresi az 1–1 chatet.
- Hozzáadjuk a chat listához, ha még nincs benne.
- Kiválasztjuk az új chatet.

## 5.6 Szűrés (All / Private / Group)

```javascript
const filteredChats = chats.filter((chat) => {
  const count = chat.MemberCount ?? 0;
  if (chatFilter === "private") return count === 2;   // Privát = 2 tag
  if (chatFilter === "group") return count >= 3;      // Csoport = 3+ tag
  return true;  // All = mind
});
```

## 5.7 Backdrop – menü bezárása kattintásra

```javascript
{(menuOpen || peopleOpen || skillsOpen || inviteCodeOpen || selectedUserProfile) && (
  <div className="chat-menu-backdrop" onClick={closeAllMenus} aria-hidden="true" />
)}
```

- Ha bármelyik menü nyitva van, egy láthatatlan réteg jelenik meg.
- Ha erre kattintasz, `closeAllMenus()` fut – nem vált chat, csak bezáródnak a menük.

---

# 6. Profile.jsx – Profil megtekintés és feedback

## 6.1 Állapotok és paraméterek

```javascript
const { userId: paramUserId } = useParams();   // URL: /profile/123 → paramUserId = "123"
const profileUserId = paramUserId ? parseInt(paramUserId, 10) : currentUserId;

const [profile, setProfile] = useState({
  username: "",
  avatarUrl: "/images/default.png",
  skills: [],
  reviews: [],
  avgRating: 0,
});

const [feedbackRating, setFeedbackRating] = useState(0);   // 1–5 csillag
const [feedbackText, setFeedbackText] = useState("");
const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

const isOwnProfile = profileUserId && currentUserId && Number(profileUserId) === Number(currentUserId);
const myReview = profile.reviews?.find((r) => Number(r.Reviewer) === Number(currentUserId)) || null;
```

**Példa:**
- `/profile` → saját profil (`profileUserId = currentUserId`).
- `/profile/5` → másik felhasználó profilja (`profileUserId = 5`).
- `myReview` – a bejelentkezett felhasználó már adott-e véleményt.

## 6.2 Profil betöltése

```javascript
useEffect(() => {
  if (!profileUserId) { setLoading(false); return; }
  setLoading(true);
  setError("");

  axios
    .get(`http://localhost:3001/users/${profileUserId}/public-profile`)
    .then((res) => {
      const data = res.data;
      setProfile({
        username: data.username || "User",
        avatarUrl: data.avatarUrl || "/images/default.png",
        skills: data.skills || [],
        reviews: data.reviews || [],
        avgRating: data.avgRating || 0,
      });

      const existing = (data.reviews || []).find((r) => Number(r.Reviewer) === Number(currentUserId));
      if (existing) {
        setFeedbackRating(existing.Rating || 0);
        setFeedbackText(existing.Content || "");
      } else {
        setFeedbackRating(0);
        setFeedbackText("");
      }
    })
    .catch((err) => setError(err.response?.data?.error || "Failed to load profile."))
    .finally(() => setLoading(false));
}, [profileUserId, currentUserId]);
```

## 6.3 Feedback küldés / szerkesztés

```javascript
const handleSubmitFeedback = (e) => {
  e.preventDefault();
  if (!profileUserId || !currentUserId || feedbackRating < 1) return;

  setFeedbackSubmitting(true);
  const payload = { Rating: feedbackRating, Content: feedbackText, Reviewee: profileUserId };
  const isEdit = !!myReview;

  const promise = isEdit
    ? axios.put("http://localhost:3001/reviews/edit", payload, { withCredentials: true })
    : axios.post("http://localhost:3001/reviews/create", payload, { withCredentials: true });

  promise
    .then(() => {
      if (!isEdit) { setFeedbackRating(0); setFeedbackText(""); }
      loadProfile();  // Újratöltés
    })
    .catch((err) => alert(err.response?.data?.error || "Could not submit feedback."))
    .finally(() => setFeedbackSubmitting(false));
};
```

- Ha van `myReview` → PUT (szerkesztés).
- Ha nincs → POST (új vélemény).

---

# 7. UserSettings.jsx – Beállítások

## 7.1 Profil betöltés (saját adatok)

```javascript
useEffect(() => {
  const loadProfile = async () => {
    try {
      const resp = await fetch("http://localhost:3001/users/me/profile", { credentials: "include" });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to load profile.");

      setUser({
        name: data.name || "",
        email: data.email || "",
        avatarUrl: data.avatarUrl || "",
        skills: Array.isArray(data.skills) ? data.skills : [],
      });
      setAvatarUrl(data.avatarUrl || "");
    } catch (err) {
      setError(err.message);
    }
  };
  loadProfile();
}, []);
```

- `users/me/profile` – auth szükséges (cookie), a saját adatok jönnek vissza.

## 7.2 Mentés

```javascript
const handleSaveProfile = async () => {
  const resp = await fetch("http://localhost:3001/users/me/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      avatarUrl: user.avatarUrl,
      skills: user.skills,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Failed to save.");
  setMessage("Profile saved successfully ✅");
  setAvatarUrl(user.avatarUrl);
};
```

---

# 8. JoinByCodePage – Csatlakozás kóddal

Útvonal: `/chat/join/:code` (pl. `/chat/join/BSF4WS`)

```javascript
const { code } = useParams();
const navigate = useNavigate();
const [status, setStatus] = useState("loading");
const [error, setError] = useState("");

useEffect(() => {
  const publicId = (code || "").trim().toUpperCase();
  if (!publicId) { setStatus("error"); setError("Invalid link."); return; }

  axios
    .post("http://localhost:3001/chats/joinByCode", { publicId }, { withCredentials: true })
    .then(() => {
      setStatus("ok");
      navigate("/chat", { replace: true });
    })
    .catch((err) => {
      setStatus("error");
      setError(err.response?.data?.error || "Could not join.");
      if (err.response?.status === 401) {
        navigate("/login?redirect=/chat/join/" + publicId);
      }
    });
}, [code, navigate]);
```

- `code` a URL-ből jön (`useParams`).
- Sikeres csatlakozás után átirányítás `/chat`-re.
- 401 esetén átirányítás loginra, `redirect` paraméterrel.

---

# 9. GroupFinder – Modal csatlakozáshoz

```javascript
const { close } = useGroupFinder();
const [code, setCode] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleJoin = (e) => {
  e.preventDefault();
  setError("");
  const publicId = code.trim().toUpperCase();
  if (!publicId) { setError("Please enter the group code."); return; }

  setLoading(true);
  axios
    .post("http://localhost:3001/chats/joinByCode", { publicId }, { withCredentials: true })
    .then(() => {
      window.dispatchEvent(new CustomEvent("chats-updated"));  // Chat lista frissítése
      close();
      navigate("/chat");
    })
    .catch((err) => setError(err.response?.data?.error || "Could not join."))
    .finally(() => setLoading(false));
};
```

**CustomEvent "chats-updated":** a ChatPage figyeli (`window.addEventListener("chats-updated", ...)`) és újra lekéri a chat listát.

---

# 10. Backend – Fontosabb végpontok

| Metódus | Útvonal | Auth | Leírás |
|---------|---------|------|--------|
| GET | `/auth/status` | Cookie | Bejelentkezés állapota |
| POST | `/login` | – | Bejelentkezés |
| POST | `/logout` | – | Kijelentkezés |
| GET | `/chats/users/:userId` | – | User chatjei (privátnál a másik felhasználó neve) |
| POST | `/chats/private` | ✓ | Privát chat létrehozás/keresés |
| POST | `/chats/joinByCode` | ✓ | Csatlakozás PublicID-val |
| GET | `/messages/:chatId` | – | Üzenetek listája |
| POST | `/messages/create` | – | Üzenet küldése |
| GET | `/users/:id/public-profile` | – | Publikus profil |
| POST | `/reviews/create` | ✓ | Vélemény írása |
| PUT | `/reviews/edit` | ✓ | Vélemény szerkesztése |

---

# 11. React fogalmak – Gyors emlékeztető

| Hook / elem | Mit csinál |
|-------------|------------|
| `useState(kezdő)` | Állapot + setter |
| `useEffect(fn, [deps])` | Mellékhatás (API, eseménykezelők); deps változásakor lefut |
| `useRef(kezdő)` | Mutable referencia (DOM, WebSocket, időbélyeg) |
| `useParams()` | URL paraméterek (pl. `:userId`) |
| `useNavigate()` | Programozott navigáció |
| `e.preventDefault()` | Alapértelmezett viselkedés kikapcsolása |
| `e.stopPropagation()` | Esemény továbbadásának megakadályozása |
| `{ withCredentials: true }` | Cookie küldése az API kéréssel |

---

# 12. Adatbázis – Fő táblák

| Tábla | Jelentés |
|-------|----------|
| `users` | Felhasználók |
| `chats` | Chatek (ChatName, PublicID) |
| `uac` | User–Chat (UserID, ChatID) – ki melyik chatben van |
| `msgs` | Üzenetek (ChatID, UserID, Content) |
| `reviews` | Vélemények (Reviewer, Reviewee, Rating, Content) |
| `uas` | User–Skill (UserID, SkillID) |

---

*Ha valamelyik részt részletesebben szeretnéd (pl. konkrét backend kód, SQL lekérdezések), jelezd, és bővíthetjük.*
