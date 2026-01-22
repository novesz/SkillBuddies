import { useState, useEffect, useRef } from "react";
import "../styles/ChatPage.css";
import Header from "../components/header/Header";
import axios from "axios";

export default function ChatPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const chatEndRef = useRef(null);

  // --- FETCH CURRENT USER ---
  useEffect(() => {
    axios.get("http://localhost:3001/auth/status", { withCredentials: true })
      .then(res => res.data.loggedIn && setCurrentUserId(res.data.userId))
      .catch(console.error);
  }, []);

  // --- FETCH USER'S CHATS ---
  useEffect(() => {
    if (!currentUserId) return;
    axios.get(`http://localhost:3001/chats/users/${currentUserId}`)
      .then(res => {
        setChats(res.data);
        if (!selectedChat && res.data.length > 0) setSelectedChat(res.data[0].ChatID);
      })
      .catch(console.error);
  }, [currentUserId]);

  // --- FETCH MESSAGES FOR SELECTED CHAT ---
  useEffect(() => {
    if (!selectedChat || !currentUserId) return;

    axios.get(`http://localhost:3001/messages/${selectedChat}`)
      .then(res => {
        const msgs = res.data.map(msg => ({
          ...msg,
          text: msg.Content,
          type: msg.UserID === Number(currentUserId) ? "outgoing" : "incoming",
          username: msg.UserID === Number(currentUserId) ? "Te" : msg.Username || "Valaki"
        }));

        setMessagesMap(prev => ({ ...prev, [selectedChat]: msgs }));
      })
      .catch(console.error);
  }, [selectedChat, currentUserId]);

  // --- SCROLL TO BOTTOM ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedChat]);

  // --- SEND OR EDIT MESSAGE ---
  const handleSend = () => {
    if (!messageInput.trim() || !currentUserId || !selectedChat) return;

    if (editingMessage) {
      // Edit message
      axios.put(`http://localhost:3001/messages/edit/${editingMessage.MsgID}`, { Content: messageInput }, { withCredentials: true })
        .then(() => {
          setMessagesMap(prev => ({
            ...prev,
            [selectedChat]: prev[selectedChat].map(m => m.MsgID === editingMessage.MsgID ? { ...m, text: messageInput } : m)
          }));
          setEditingMessage(null);
          setMessageInput("");
        })
        .catch(console.error);
    } else {
      // Send new message
      axios.post("http://localhost:3001/messages/create", {
        ChatID: selectedChat,
        UserID: currentUserId,
        Content: messageInput
      }, { withCredentials: true })
      .then(res => {
        const newMsg = {
          MsgID: res.data.MsgID,
          text: messageInput,
          type: "outgoing",
          username: "Te",
          UserID: currentUserId
        };
        setMessagesMap(prev => ({
          ...prev,
          [selectedChat]: [...(prev[selectedChat] || []), newMsg]
        }));
        setMessageInput("");
      })
      .catch(console.error);
    }
  };

  // --- DELETE MESSAGE ---
  const handleDelete = (msg) => {
    if (!window.confirm("Biztosan törölni szeretnéd az üzenetet?")) return;

    axios.delete(`http://localhost:3001/messages/delete/${msg.MsgID}`, { withCredentials: true })
      .then(() => {
        setMessagesMap(prev => ({
          ...prev,
          [selectedChat]: prev[selectedChat].filter(m => m.MsgID !== msg.MsgID)
        }));
      })
      .catch(console.error);
  };

  // --- START EDIT ---
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
          {chats.map(chat => (
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
            {messagesMap[selectedChat]?.map(msg => (
              <div key={msg.MsgID} className={`message ${msg.type}`}>
                <span>{msg.text}</span>
                <small style={{ display: "block", fontSize: "10px", color: "#555" }}>{msg.username}</small>
                {msg.type === "outgoing" && (
                  <div className="message-actions">
                    <button onClick={() => handleEdit(msg)}>Edit</button>
                    <button onClick={() => handleDelete(msg)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />

            <form onSubmit={e => { e.preventDefault(); handleSend(); }}>
              <div className="input-row">
                <input
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder={editingMessage ? "Üzenet szerkesztése..." : "Írj üzenetet..."}
                />
                <button type="submit" className="send-btn">{editingMessage ? "↑" : "→"}</button>
              </div>
            </form>
          </div>

          {/* --- RIGHT PANEL --- */}
          <div className="right-panel">
            <button className="profile-btn" onClick={() => setMenuOpen(prev => !prev)}>⚙️</button>
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
