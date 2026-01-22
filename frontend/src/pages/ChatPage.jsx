import { useState, useEffect, useRef } from "react";
import "../styles/ChatPage.css";
import Header from "../components/header/Header";
import axios from "axios";

export default function ChatPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const [chatSkills, setChatSkills] = useState([]);

  const chatEndRef = useRef(null);

  // --- Bejelentkezett felhasználó ellenőrzése ---
  useEffect(() => {
    axios
      .get("http://localhost:3001/auth/status", { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) {
          setCurrentUserId(res.data.userId);
          setCurrentUsername(res.data.username || "Te");
        }
      })
      .catch(console.error);
  }, []);

  // --- Saját chatek betöltése ---
  useEffect(() => {
    if (!currentUserId) return;
    axios
      .get(`http://localhost:3001/chats/users/${currentUserId}`)
      .then((res) => {
        setChats(res.data);
        if (!selectedChat && res.data.length > 0) setSelectedChat(res.data[0].ChatID);
      })
      .catch(console.error);
  }, [currentUserId]);

  // --- Üzenetek betöltése ---
  useEffect(() => {
    if (!selectedChat || !currentUserId) return;

    axios
      .get(`http://localhost:3001/messages/${selectedChat}`)
      .then((res) => {
        const msgs = res.data.map((msg) => ({
          ...msg,
          text: msg.Content,
          type: msg.UserID === Number(currentUserId) ? "outgoing" : "incoming",
          username: msg.UserID === Number(currentUserId) ? currentUsername : msg.Username || "Valaki",
        }));
        setMessagesMap((prev) => ({ ...prev, [selectedChat]: msgs }));
      })
      .catch(console.error);
  }, [selectedChat, currentUserId, currentUsername]);

  // --- Chat felhasználók betöltése ---
  const loadChatUsers = (chatId) => {
    if (!chatId) return;
    axios
      .get(`http://localhost:3001/chats/users/${chatId}`)
      .then((res) => setChatUsers(res.data))
      .catch(console.error);
  };

  // --- Chat skillek betöltése (később backendből) ---
  const loadChatSkills = (chatId) => {
    if (!chatId) return;
    // ide lehet backend hívást tenni
    // pl: axios.get(`/chats/skills/${chatId}`).then(res => setChatSkills(res.data))
    // most mock adat
    setChatSkills([
      { SkillID: 1, SkillName: "React" },
      { SkillID: 2, SkillName: "Node.js" },
      { SkillID: 3, SkillName: "SQL" },
    ]);
  };

  // --- Betöltés selectedChat változásakor ---
  useEffect(() => {
    if (selectedChat) {
      loadChatUsers(selectedChat);
      if (skillsOpen) loadChatSkills(selectedChat);
    }
  }, [selectedChat]);

  // --- Scroll az új üzenetekre ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedChat]);

  // --- Üzenet küldése vagy szerkesztése ---
  const handleSend = () => {
    if (!messageInput.trim() || !currentUserId || !selectedChat) return;

    if (editingMessage) {
      axios
        .put(
          `http://localhost:3001/messages/edit/${editingMessage.MsgID}`,
          { Content: messageInput },
          { withCredentials: true }
        )
        .then(() => {
          setMessagesMap((prev) => ({
            ...prev,
            [selectedChat]: prev[selectedChat].map((m) =>
              m.MsgID === editingMessage.MsgID ? { ...m, text: messageInput } : m
            ),
          }));
          setEditingMessage(null);
          setMessageInput("");
        })
        .catch(console.error);
    } else {
      axios
        .post(
          "http://localhost:3001/messages/create",
          {
            ChatID: selectedChat,
            UserID: currentUserId,
            Content: messageInput,
          },
          { withCredentials: true }
        )
        .then((res) => {
          const newMsg = {
            MsgID: res.data.MsgID,
            text: messageInput,
            type: "outgoing",
            username: currentUsername,
            UserID: currentUserId,
          };
          setMessagesMap((prev) => ({
            ...prev,
            [selectedChat]: [...(prev[selectedChat] || []), newMsg],
          }));
          setMessageInput("");
        })
        .catch(console.error);
    }
  };

  // --- Üzenet törlése ---
  const handleDelete = (msg) => {
    if (!window.confirm("Biztosan törölni szeretnéd az üzenetet?")) return;

    axios
      .delete(`http://localhost:3001/messages/delete/${msg.MsgID}`, { withCredentials: true })
      .then(() => {
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat]: prev[selectedChat].filter((m) => m.MsgID !== msg.MsgID),
        }));
      })
      .catch(console.error);
  };

  // --- Edit kezdete ---
  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setMessageInput(msg.text);
  };

  return (
    <div className="chat-page">
      <Header />

      <div className="content">
        {/* --- CHAT LIST --- */}
        <div className="user-list">
          {chats.map((chat) => (
            <div
              key={chat.ChatID}
              className={`user-row ${chat.ChatID === selectedChat ? "active" : ""}`}
              onClick={() => setSelectedChat(chat.ChatID)}
            >
              <img src={`/images/${chat.ChatPic}`} alt={chat.ChatName} className="chat-pic" />
              <span>{chat.ChatName}</span>
            </div>
          ))}
        </div>

        {/* --- CHAT BOX --- */}
        <div className="chat-container">
          <div className="chat-box">
            {messagesMap[selectedChat]?.map((msg) => (
              <div key={msg.MsgID} className={`message ${msg.type}`}>
                <span>{msg.text}</span>
                <small style={{ display: "block", fontSize: "10px", color: "#555" }}>{msg.username}</small>

                {msg.type === "outgoing" && (
                  <div className="message-actions">
                    <button onClick={() => handleEdit(msg)}>✏️</button>
                    <button onClick={() => handleDelete(msg)}>🗑️</button>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <div className="input-row">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={editingMessage ? "Üzenet szerkesztése..." : "Írj üzenetet..."}
                />
                <button type="submit" className="send-btn">
                  {editingMessage ? "↑" : "→"}
                </button>
              </div>
            </form>
          </div>

          {/* --- RIGHT PANEL --- */}
          <div className="right-panel">
            <button className="profile-btn" onClick={() => setMenuOpen((prev) => !prev)}></button>
            {menuOpen && (
              <div className="settings-dropdown">
                <button
                  onClick={() => {
                    setPeopleOpen((prev) => !prev);
                    setSkillsOpen(false);
                  }}
                >
                  People
                </button>
                <button
                  onClick={() => {
                    setSkillsOpen((prev) => !prev);
                    setPeopleOpen(false);
                    if (!skillsOpen) loadChatSkills(selectedChat);
                  }}
                >
                  Skills
                </button>
                <button>Leave</button>
              </div>
            )}
          </div>

          {/* --- PEOPLE SIDEBAR --- */}
          {peopleOpen && (
            <div className="people-sidebar">
              <button className="close-people" onClick={() => setPeopleOpen(false)}>
                Close
              </button>
              <h3>Users in this chat:</h3>
              <ul>
                {chatUsers.map((user) => (
                  <li key={user.UserID} className="person-row">
                    <img
                      src={user.Avatar ? `/images/${user.Avatar}` : "/images/default.png"}
                      alt={user.Username}
                      className="person-avatar"
                    />
                    <span>
                      {user.UserID === currentUserId
                        ? `${currentUsername} (You)`
                        : user.Username || `UserID: ${user.UserID}`}
                      {user.IsChatAdmin ? " (Admin)" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* --- SKILLS SIDEBAR --- */}
          {skillsOpen && (
            <div className="skills-sidebar">
              <button className="close-skills" onClick={() => setSkillsOpen(false)}>
                Close
              </button>
              <h3>Skills in this chat:</h3>
              <ul>
                {chatSkills.map((skill) => (
                  <li key={skill.SkillID} className="skill-row">
                    {skill.SkillName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
