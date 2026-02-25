# SkillBuddies - Fejlesztési Dokumentáció

Ez a dokumentum összefoglalja a legutóbbi fejlesztéseket és magyarázza a fontosabb technikai megoldásokat.

---

## Tartalomjegyzék

1. [Bejelentkezés (Authentication)](#1-bejelentkezés-authentication)
2. [Chat funkciók](#2-chat-funkciók)
3. [CSS javítások](#3-css-javítások)
4. [WebSocket kommunikáció](#4-websocket-kommunikáció)

---

## 1. Bejelentkezés (Authentication)

### Hogyan működik a bejelentkezés?

**Frontend (`LoginPage.jsx`):**
```javascript
axios.post("http://localhost:3001/login", 
  { Email: email, Password: password }, 
  { withCredentials: true }  // FONTOS: ez küldi a cookie-kat
)
```

**Backend (`server.js`):**
```javascript
app.post("/login", async (req, res) => {
  const { Email, Password } = req.body;
  
  // 1. Felhasználó keresése email alapján
  db.query("SELECT * FROM users WHERE Email = ?", [Email], async (err, results) => {
    // 2. Jelszó ellenőrzése bcrypt-tel
    const match = await bcrypt.compare(Password, user.Password);
    
    // 3. JWT token generálása
    const token = jwt.sign(
      { userId: user.UserID },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // 4. Cookie beállítása
    res.cookie("token", token, {
      httpOnly: true,    // JavaScript nem éri el (biztonság)
      sameSite: "lax",   // CSRF védelem
      secure: false      // HTTPS-hez true kell
    });
  });
});
```

### Fontos fogalmak:

| Fogalom | Magyarázat |
|---------|------------|
| **JWT (JSON Web Token)** | Titkosított token, ami tartalmazza a felhasználó ID-ját. 7 napig érvényes. |
| **bcrypt** | Jelszó hashelő algoritmus. Soha nem tároljuk a jelszót olvasható formában! |
| **httpOnly cookie** | Olyan cookie, amit JavaScript kódból nem lehet elérni - biztonságosabb. |
| **withCredentials: true** | Axios beállítás, ami biztosítja, hogy a cookie-k elküldődjenek a kéréssel. |

### Hibakeresés:

Ha nem tudsz bejelentkezni, ellenőrizd:
1. **MySQL fut-e?** - A `.env` fájlban a `DB_PORT=3307` helyes-e?
2. **CORS beállítás** - A backend `origin: 'http://localhost:5173'` egyezik-e a frontend URL-lel?
3. **JWT_SECRET** - A `.env` fájlban be van-e állítva?

---

## 2. Chat funkciók

### Üzenetküldés időbélyeggel és felhasználónévvel

**Backend - REST API (`/messages/create`):**
```javascript
app.post('/messages/create', (req, res) => {
  const { ChatID, UserID, Content } = req.body;

  // 1. Először lekérjük a felhasználó nevét
  db.query("SELECT Username FROM users WHERE UserID = ?", [UserID], (err, userRows) => {
    const username = userRows.length > 0 ? userRows[0].Username : `User ${UserID}`;

    // 2. Üzenet mentése az adatbázisba
    const sql = "INSERT INTO msgs (ChatID, UserID, Content) VALUES (?, ?, ?)";
    db.query(sql, [ChatID, UserID, Content], (err, results) => {
      
      // 3. WebSocket broadcast - elküldjük mindenkinek a chatben
      const message = {
        type: "NEW_MESSAGE",
        msg: {
          MsgID: results.insertId,
          ChatID,
          UserID,
          Username: username,        // Felhasználónév!
          Content,
          SentAt: new Date().toISOString()  // Időbélyeg!
        }
      };
      broadcastToChat(ChatID, message);
    });
  });
});
```

**Frontend - Idő formázás (`ChatPage.jsx`):**
```javascript
const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  
  if (isToday) {
    return `${hours}:${minutes}`;  // Ma: "14:32"
  }
  
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${month}.${day}. ${hours}:${minutes}`;  // Korábban: "02.24. 14:32"
};
```

### Privát chat megnyitása profilból

Amikor valaki profiljánál a "Message" gombra kattintasz:

**Profile.jsx:**
```javascript
const handleMessage = () => {
  axios.post("http://localhost:3001/chats/private", 
    { otherUserId: profileUserId },
    { withCredentials: true }
  )
  .then((res) => {
    // Navigate to chat page with the chat ID
    navigate("/chat", { state: { openChatId: res.data.ChatID } });
  });
};
```

**ChatPage.jsx - A bejövő chatId kezelése:**
```javascript
// 1. Kinyerjük a navigation state-ből
const incomingChatId = location.state?.openChatId;

// 2. Ha van ilyen chat, azt választjuk ki
useEffect(() => {
  if (incomingChatId && chats.length > 0) {
    const exists = chats.some((c) => c.ChatID === incomingChatId);
    if (exists && selectedChat !== incomingChatId) {
      setSelectedChat(incomingChatId);
    }
  }
}, [incomingChatId, chats]);
```

### Fontos fogalmak:

| Fogalom | Magyarázat |
|---------|------------|
| **navigate state** | React Router funkció, amivel adatot küldhetünk az új oldalnak URL paraméter nélkül |
| **useLocation()** | React Router hook, ami hozzáférést ad a navigation state-hez |
| **padStart(2, "0")** | String metódus: "9" → "09" (kitölti nullával 2 karakterre) |

---

## 3. CSS javítások

### Hamburger menü középre igazítása

**Probléma:** A 3 csík és az X nem volt középen a gombban.

**Megoldás (`Header.css`):**
```css
/* A 3 csík pozíciója zárt állapotban */
.sb-hamburger span:nth-child(1){ top: 12px; }
.sb-hamburger span:nth-child(2){ 
  top: 50%; 
  transform: translateX(-50%) translateY(-50%);  /* Középre! */
}
.sb-hamburger span:nth-child(3){ bottom: 12px; top: auto; }

/* X alakzat nyitott állapotban */
.sb-hamburger.is-open span:nth-child(1){ 
  top: 50%; 
  transform: translateX(-50%) translateY(-50%) rotate(45deg); 
}
.sb-hamburger.is-open span:nth-child(2){ opacity: 0; }
.sb-hamburger.is-open span:nth-child(3){ 
  top: 50%; 
  bottom: auto; 
  transform: translateX(-50%) translateY(-50%) rotate(-45deg); 
}
```

**Kulcs:** `translateY(-50%)` - ez tolja középre vertikálisan!

### Küldés gomb nyíl középre igazítása

**Probléma:** A → nyíl nem volt középen a körben.

**Megoldás (`ChatPage.css`):**
```css
.send-btn {
  /* ... egyéb stílusok ... */
  display: flex;
  align-items: center;      /* Vertikális közép */
  justify-content: center;  /* Horizontális közép */
}
```

### Fontos CSS fogalmak:

| Tulajdonság | Magyarázat |
|-------------|------------|
| `display: flex` | Flexbox layout bekapcsolása |
| `align-items: center` | Gyerekek függőlegesen középre |
| `justify-content: center` | Gyerekek vízszintesen középre |
| `transform: translateY(-50%)` | Felfelé tolja az elem magasságának felével |
| `top: 50%` | Az elem teteje a szülő közepénél van |

---

## 4. WebSocket kommunikáció

### Mi az a WebSocket?

A WebSocket egy kétirányú kommunikációs protokoll. Ellentétben a HTTP-vel (ahol a kliens kérdez, szerver válaszol), a WebSocket-tel a szerver is küldhet üzeneteket a kliensnek "magától".

### Hogyan működik a chatben?

**1. Kapcsolat létrehozása (Frontend):**
```javascript
const socket = new WebSocket("ws://localhost:3001");

socket.onopen = () => {
  console.log("Connected to WS server");
};
```

**2. Kapcsolat fogadása (Backend):**
```javascript
wss.on("connection", (ws, req) => {
  // Cookie-ból kinyerjük a JWT tokent
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;
  
  // Token ellenőrzése
  const decoded = jwt.verify(token, JWT_SECRET);
  ws.userId = decoded.userId;
  
  // Felhasználó socket-jének tárolása
  if (!clients.has(ws.userId)) clients.set(ws.userId, new Set());
  clients.get(ws.userId).add(ws);
});
```

**3. Üzenet broadcast (Backend):**
```javascript
function broadcastToChat(chatId, payload) {
  // Lekérjük a chat összes tagját
  db.query("SELECT UserID FROM uac WHERE ChatID = ?", [chatId], (err, rows) => {
    rows.forEach(({ UserID }) => {
      // Megkeressük a felhasználó socket-jeit
      const userSockets = clients.get(UserID);
      if (!userSockets) return;
      
      // Minden socket-re elküldjük az üzenetet
      userSockets.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(payload));
        }
      });
    });
  });
}
```

**4. Üzenet fogadása (Frontend):**
```javascript
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === "NEW_MESSAGE") {
    // Üzenet hozzáadása a megjelenített listához
    setMessagesMap((prev) => ({
      ...prev,
      [data.msg.ChatID]: [...(prev[data.msg.ChatID] || []), newMsg]
    }));
  }
};
```

### useRef vs useState

**Probléma:** A WebSocket callback-ben nem látjuk a legfrissebb `chatUsers` state-et.

**Megoldás: useRef használata:**
```javascript
// Ref létrehozása
const chatUsersRef = useRef([]);

// Frissítés amikor változik
const loadChatUsers = (chatId) => {
  axios.get(`/chats/chatUsers/${chatId}`).then((res) => {
    setChatUsers(res.data);
    chatUsersRef.current = res.data;  // Ref is frissül!
  });
};

// WebSocket callback-ben a ref-et használjuk
socket.onmessage = (event) => {
  // chatUsersRef.current mindig a legfrissebb értéket adja
  const found = chatUsersRef.current.find((u) => u.UserID === senderUserId);
};
```

| Hook | Mikor használd? |
|------|-----------------|
| `useState` | Ha a változásnak újra kell renderelnie a komponenst |
| `useRef` | Ha csak tárolni akarsz értéket renderelés nélkül, vagy callback-ekben |

---

## Gyakori hibák és megoldások

### "ECONNREFUSED" - Adatbázis kapcsolat hiba
```
Error: connect ECONNREFUSED 127.0.0.1:3307
```
**Megoldás:** Indítsd el a MySQL szervert (XAMPP, MySQL Workbench stb.)

### "User 2" jelenik meg a felhasználónév helyett
**Ok:** A WebSocket üzenet nem tartalmazza a Username mezőt.
**Megoldás:** A backend-ben a broadcast előtt le kell kérni a felhasználónevet.

### Cookie nem küldődik
**Ok:** Hiányzik a `withCredentials: true` az axios kérésből.
**Megoldás:** Minden axios kéréshez add hozzá: `{ withCredentials: true }`

### CORS hiba
**Ok:** A backend origin beállítása nem egyezik a frontend URL-lel.
**Megoldás:** `server.js`-ben ellenőrizd: `origin: 'http://localhost:5173'`

---

## Hasznos parancsok

```bash
# Backend indítása
cd backend
npm run start

# Frontend indítása
cd frontend
npm run dev

# MySQL kapcsolat tesztelése
mysql -u root -p -P 3307
```

---

*Utolsó frissítés: 2026. február 24.*
