import { useState, useRef, useEffect } from "react";
import "../styles/ChatPage.css";
import Header from "../components/header/Header";
import axios from "axios";

export default function ChatPage({ currentUserId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groups, setGroups] = useState({});
  const [chats, setChats] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  // 1️⃣ Chat lista lekérése backendből
  useEffect(() => {
    axios.get("http://localhost:3001/chats/all")
      .then(res => {
        setChats(res.data);
        if (res.data.length > 0) setCurrentGroup(res.data[0].ChatID);
      })
      .catch(err => {
        console.error("Hiba a chat lista lekérésekor:", err);
      });
  }, []);

  // 2️⃣ Üzenetek lekérése az aktuális chathez
  useEffect(() => {
    if (!currentGroup) return;

    axios.get(`http://localhost:3001/messages/${currentGroup}`)
      .then(res => {
        setGroups(prev => ({
          ...prev,
          [currentGroup]: res.data.map(msg => ({
            text: msg.Content,
            type: msg.Username === currentUserId ? "outgoing" : "incoming",
            MsgID: msg.MsgID,
          }))
        }));
      })
      .catch(err => {
        console.error("Hiba az üzenetek lekérésekor:", err);
        setGroups(prev => ({ ...prev, [currentGroup]: [] }));
      });
  }, [currentGroup, currentUserId]);

  // 3️⃣ Scroll mindig a legújabb üzenethez
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groups, currentGroup]);

  // 4️⃣ Üzenet küldése
  const sendMessage = () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !currentUserId || !currentGroup) return;

    axios.post("http://localhost:3001/messages/create", {
      ChatID: currentGroup,
      UserID: currentUserId,
      Content: trimmed
    })
    .then(res => {
      // UI frissítése
      setGroups(prev => ({
        ...prev,
        [currentGroup]: [...(prev[currentGroup] || []), {
          text: trimmed,
          type: "outgoing",
          MsgID: res.data.MsgID,
        }]
      }));
      setNewMessage("");
    })
    .catch(err => {
      console.error("Hiba az üzenet mentésekor:", err);
      alert("Hiba az üzenet mentésekor!");
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-page">
      <div className="header-container">
        <Header />
        <div className="right">
          <button className="profile-btn" onClick={() => setMenuOpen(!menuOpen)}>⚙️</button>
          {menuOpen && (
            <div className="dropdown">
              <button>People</button>
              <button>Skills</button>
              <button>Leave</button>
            </div>
          )}
        </div>
      </div>

      <div className="content">
        {/* Chat lista */}
        <div className="user-list">
          {chats.map(chat => (
            <div
              key={chat.ChatID}
              className={`user-row ${chat.ChatID === currentGroup ? "active" : ""}`}
              onClick={() => setCurrentGroup(chat.ChatID)}
            >
              <div className="dot">
                <img 
                  src={`/images/${chat.ChatPic}`} 
                  alt={chat.ChatName} 
                  style={{ width: "20px", height: "20px", borderRadius: "50%" }} 
                />
              </div>
              <span>{chat.ChatName}</span>
            </div>
          ))}
        </div>

        {/* Chat box */}
        <div className="chat-box">
          {currentGroup && (groups[currentGroup] || []).map((message) => (
            <div key={message.MsgID} className={`message ${message.type}`}>
              {message.text}
            </div>
          ))}
          <div ref={chatEndRef} />
          <form onSubmit={e => { e.preventDefault(); sendMessage(); }}>
            <div className="input-row">
              <input
                type="text"
                placeholder="Text here"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button className="send-btn" type="submit">↑</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
