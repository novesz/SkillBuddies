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

  const ws = useRef(null);
  const chatEndRef = useRef(null);

  // --- Bejelentkezett felhasználó ---
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

  // --- Saját chatek ---
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

  // --- WebSocket ---
  useEffect(() => {
    if (!currentUserId) return;

    ws.current = new WebSocket("ws://localhost:3001");

    ws.current.onopen = () => {
      console.log("Connected to WS server");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_MESSAGE") {
        const msg = {
          MsgID: data.msg.MsgID,
          text: data.msg.Content,
          username:
            data.msg.UserID === currentUserId
              ? currentUsername
              : `User ${data.msg.UserID}`,
          type: data.msg.UserID === currentUserId ? "outgoing" : "incoming",
          UserID: data.msg.UserID,
        };

        setMessagesMap((prev) => ({
          ...prev,
          [data.msg.ChatID]: [...(prev[data.msg.ChatID] || []), msg],
        }));
      }
    };

    ws.current.onclose = () => console.log("WS disconnected");
    ws.current.onerror = (err) => console.error("WS error:", err);

    return () => ws.current?.close();
  }, [currentUserId, currentUsername]);

  // --- Üzenetek betöltése ---
  useEffect(() => {
    if (!selectedChat) return;

    axios
      .get(`http://localhost:3001/messages/${selectedChat}`)
      .then((res) => {
        const msgs = res.data.map((msg) => ({
          MsgID: msg.MsgID,
          text: msg.Content,
          type: msg.UserID === Number(currentUserId) ? "outgoing" : "incoming",
          username:
            msg.UserID === Number(currentUserId)
              ? currentUsername
              : msg.Username || `User ${msg.UserID}`,
          UserID: msg.UserID,
        }));
        setMessagesMap((prev) => ({ ...prev, [selectedChat]: msgs }));
      })
      .catch(console.error);
  }, [selectedChat, currentUserId, currentUsername]);

  // --- Chat users ---
  const loadChatUsers = (chatId) => {
    if (!chatId) return;

    axios
      .get(`http://localhost:3001/chats/chatUsers/${chatId}`)
      .then((res) => {
        console.log("CHAT USERS:", res.data);
        setChatUsers(res.data);
      })
      .catch((err) => {
        console.error("loadChatUsers error:", err);
      });
  };

  // --- Chat skills ---
  const loadChatSkills = (chatId) => {
    if (!chatId) return;
    axios
      .get("http://localhost:3001/groups")
      .then((res) => {
        const group = res.data.find((g) => g.ChatID === chatId);
        if (group && group.Skills) {
          setChatSkills(
            group.Skills.split(", ").map((skill, index) => ({
              SkillID: index,
              SkillName: skill,
            }))
          );
        } else {
          setChatSkills([]);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (selectedChat) {
      loadChatUsers(selectedChat);
      if (skillsOpen) loadChatSkills(selectedChat);
    }
  }, [selectedChat]);

  // --- Scroll ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedChat]);

  // --- Üzenet küldése ---
  const handleSend = () => {
    if (!messageInput.trim()) return;

    if (!editingMessage) {
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
        .then(() => {
          setMessageInput("");
        })
        .catch(console.error);
    } else {
      // edit üzenet
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
              m.MsgID === editingMessage.MsgID
                ? { ...m, text: messageInput }
                : m
            ),
          }));
          setEditingMessage(null);
          setMessageInput("");
        })
        .catch(console.error);
    }
  };

  const handleDelete = (msg) => {
    if (!window.confirm("Biztosan törölni szeretnéd az üzenetet?")) return;
    axios
      .delete(`http://localhost:3001/messages/delete/${msg.MsgID}`, {
        withCredentials: true,
      })
      .then(() => {
        setMessagesMap((prev) => ({
          ...prev,
          [selectedChat]: prev[selectedChat].filter((m) => m.MsgID !== msg.MsgID),
        }));
      })
      .catch(console.error);
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setMessageInput(msg.text);
  };

  // --- Leave chat ---
  const handleLeaveChat = async () => {
    if (!selectedChat) return;

    if (!window.confirm("Biztosan ki szeretnél lépni ebből a csoportból?")) return;

    try {
      await axios.delete(
        `http://localhost:3001/chats/leave/${selectedChat}`,
        { withCredentials: true }
      );

      // chat eltávolítása a listából
      setChats((prev) => prev.filter((c) => c.ChatID !== selectedChat));

      // kiválasztott chat nullázása
      setMessagesMap((prev) => {
        const copy = { ...prev };
        delete copy[selectedChat];
        return copy;
      });
      setSelectedChat(null);
      setMenuOpen(false);
      setPeopleOpen(false);
      setSkillsOpen(false);
    } catch (err) {
      console.error("Leave chat error:", err);
      alert("Nem sikerült kilépni a csoportból");
    }
  };

  // --- JSX ---
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
              <img
                src={chat.ChatPic ? `/images/${chat.ChatPic}` : "/images/default.png"}
                alt={chat.ChatName}
                className="chat-pic"
              />
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
                <small style={{ display: "block", fontSize: "10px", color: "#555" }}>
                  {msg.username}
                </small>

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
            <button className="profile-btn" onClick={() => setMenuOpen((prev) => !prev)}>
              
            </button>

            {menuOpen && (
              <div className="settings-dropdown">
                <button
                  onClick={() => {
                    setPeopleOpen((prev) => !prev);
                    setSkillsOpen(false);
                    if (!peopleOpen) loadChatUsers(selectedChat);
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

                <button onClick={handleLeaveChat}>Leave</button>
              </div>
            )}
          </div>

          {/* --- PEOPLE SIDEBAR --- */}
          {peopleOpen && (
            <div className={`people-sidebar ${peopleOpen ? "open" : ""}`}>
              <button
                className="close-people"
                onClick={() => setPeopleOpen(false)}
              >
                ✖
              </button>
              <h3>Users in this chat:</h3>
              <ul>
                {chatUsers.length === 0 && <li>Nincs felhasználó a chatben</li>}
                {chatUsers.map((user) => (
                  <li key={user.UserID} className="person-row">
                    <img
                      src={user.Avatar ? `/images/${user.Avatar}` : "/images/default.png"}
                      alt={user.Username}
                      className="person-avatar"
                    />
                    <span>
                      {Number(user.UserID) === Number(currentUserId)
                        ? `${currentUsername} (You)`
                        : user.Username}
                      {user.IsChatAdmin === 1 && " (Admin)"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* --- SKILLS SIDEBAR --- */}
          {skillsOpen && (
            <div className={`skills-sidebar ${skillsOpen ? "open" : ""}`}>
              <button className="close-skills" onClick={() => setSkillsOpen(false)}>
                ✖
              </button>
              <h3>Skills in this chat:</h3>
              <ul>
                {chatSkills.map((skill) => (
                  <li key={skill.SkillID} className="skill-row">
                    {skill.Skill || skill.SkillName}
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
