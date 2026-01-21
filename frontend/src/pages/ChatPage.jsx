import { useState, useRef, useEffect } from "react";
import "../styles/ChatPage.css";
import Header from "../components/header/Header";
import axios from "axios";

export default function ChatPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groups, setGroups] = useState({});
  const [chats, setChats] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const chatEndRef = useRef(null);

  // 1️⃣ Bejelentkezett felhasználó ellenőrzése
  useEffect(() => {
    axios
      .get("http://localhost:3001/auth/status", { withCredentials: true })
      .then(res => {
        if (res.data.loggedIn) setCurrentUserId(res.data.userId);
        else setCurrentUserId(null);
      })
      .catch(err => console.error("Auth error:", err));
  }, []);

  // 2️⃣ Csak a saját chatek betöltése
  useEffect(() => {
    if (!currentUserId) return;

    axios
      .get(`http://localhost:3001/chats/users/${currentUserId}`)
      .then(res => {
        setChats(res.data);
        if (res.data.length > 0 && !currentGroup) setCurrentGroup(res.data[0].ChatID);
      })
      .catch(err => console.error("Chats load error:", err));
  }, [currentUserId]);

  // 3️⃣ Üzenetek betöltése a kiválasztott chathez
  useEffect(() => {
    if (!currentGroup || !currentUserId) return;

    axios
      .get(`http://localhost:3001/messages/${currentGroup}`)
      .then(res => {
        const formatted = res.data.map(msg => {
          const isMine = msg.UserID ? parseInt(msg.UserID) === parseInt(currentUserId) : false;
          return {
            text: msg.Content,
            MsgID: msg.MsgID,
            type: isMine ? "outgoing" : "incoming",
            username: msg.Username || (isMine ? "Te" : "Valaki"),
            UserID: msg.UserID || null
          };
        });

        setGroups(prev => ({
          ...prev,
          [currentGroup]: formatted
        }));
      })
      .catch(err => console.error("Messages load error:", err));
  }, [currentGroup, currentUserId]);

  // 4️⃣ Scroll az új üzenetekre
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groups, currentGroup]);

  // 5️⃣ Üzenet küldés vagy szerkesztés
  const sendMessage = () => {
    if (!newMessage.trim() || !currentUserId || !currentGroup) return;

    if (editingMsg) {
      // Edit üzenet
      axios
        .put(
          `http://localhost:3001/messages/edit/${editingMsg.MsgID}`,
          { Content: newMessage },
          { withCredentials: true }
        )
        .then(() => {
          setGroups(prev => ({
            ...prev,
            [currentGroup]: prev[currentGroup].map(msg =>
              msg.MsgID === editingMsg.MsgID ? { ...msg, text: newMessage } : msg
            )
          }));
          setEditingMsg(null);
          setNewMessage("");
        })
        .catch(err => console.error("Edit message error:", err));
    } else {
      // Új üzenet
      axios
        .post(
          "http://localhost:3001/messages/create",
          { ChatID: currentGroup, UserID: currentUserId, Content: newMessage },
          { withCredentials: true }
        )
        .then(res => {
          setGroups(prev => ({
            ...prev,
            [currentGroup]: [
              ...(prev[currentGroup] || []),
              { 
                text: newMessage, 
                MsgID: res.data.MsgID, 
                type: "outgoing", 
                username: "Te",
                UserID: currentUserId
              }
            ]
          }));
          setNewMessage("");
        })
        .catch(err => console.error("Send message error:", err));
    }
  };

  // 6️⃣ Üzenet törlés
  const deleteMessage = (msg) => {
    if (!window.confirm("Biztosan törölni szeretnéd az üzenetet?")) return;

    axios
      .delete(`http://localhost:3001/messages/delete/${msg.MsgID}`, { withCredentials: true })
      .then(() => {
        setGroups(prev => ({
          ...prev,
          [currentGroup]: prev[currentGroup].filter(m => m.MsgID !== msg.MsgID)
        }));
      })
      .catch(err => console.error("Delete message error:", err));
  };

  // 7️⃣ Edit kezdete
  const startEdit = (msg) => {
    setEditingMsg(msg);
    setNewMessage(msg.text);
  };

  return (
    <div className="chat-page">
      <Header />

      <div className="content">
        {/* CHAT LIST */}
        <div className="user-list">
          {chats.length === 0 ? (
            <p>Nincsenek chatek.</p>
          ) : (
            chats.map(chat => (
              <div
                key={chat.ChatID}
                className={`user-row ${chat.ChatID === currentGroup ? "active" : ""}`}
                onClick={() => setCurrentGroup(chat.ChatID)}
              >
                <img src={`/images/${chat.ChatPic}`} alt={chat.ChatName} className="chat-pic" />
                <span>{chat.ChatName}</span>
              </div>
            ))
          )}
        </div>

        {/* CHAT */}
        <div className="chat-container">
          <div className="chat-box">
            {groups[currentGroup]?.map(msg => (
              <div key={msg.MsgID} className={`message ${msg.type}`}>
                <span>{msg.text}</span>
                {msg.type === "outgoing" && (
                  <div className="message-actions">
                    <button onClick={() => startEdit(msg)}>Edit</button>
                    <button onClick={() => deleteMessage(msg)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />

            <form
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <div className="input-row">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={editingMsg ? "Üzenet szerkesztése..." : "Üzenet..."}
                />
                <button className="send-btn" type="submit">
                  {editingMsg ? "↑" : "↑"}
                </button>
              </div>
            </form>
          </div>

          <div className="right-panel">
            <button className="profile-btn" onClick={() => setMenuOpen(prev => !prev)}>
              ⚙️
            </button>

            {menuOpen && (
              <div className="settings-dropdown">
                <button>People</button>
                <button>Skills</button>
                <button>Leave</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
