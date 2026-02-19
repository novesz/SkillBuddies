import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ChatPage.css";
import Header from "../components/header/Header";
import axios from "axios";

export default function ChatPage({ isLoggedIn, setIsLoggedIn, userId: propUserId = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(propUserId && Number(propUserId) ? Number(propUserId) : null);
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
  const [inviteCodeOpen, setInviteCodeOpen] = useState(false);
  const [chatFilter, setChatFilter] = useState("all"); // "all" | "private" | "group"
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [skillsWithMembers, setSkillsWithMembers] = useState({ needed: [], memberSkills: [] });
  const [privateChatLoading, setPrivateChatLoading] = useState(false);

  const ws = useRef(null);
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastSendAt = useRef(0);
  const [inputVisible, setInputVisible] = useState(true);
  const lastScrollTop = useRef(0);

  // --- Logged-in user: use userId from App when available, else fetch auth status ---
  useEffect(() => {
    const uid = propUserId && Number(propUserId);
    if (uid) setCurrentUserId(uid);
    axios
      .get("http://localhost:3001/auth/status", { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) {
          setCurrentUserId(res.data.userId ?? uid ?? null);
          setCurrentUsername(res.data.username || "You");
        }
      })
      .catch(console.error);
  }, [propUserId]);

  // --- Saját chatek (refetch pl. Join után) ---
  const fetchChats = () => {
    if (!currentUserId) return;
    axios
      .get(`http://localhost:3001/chats/users/${currentUserId}`)
      .then((res) => {
        setChats(res.data);
        if (!selectedChat && res.data.length > 0) setSelectedChat(res.data[0].ChatID);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchChats();
  }, [currentUserId]);

  useEffect(() => {
    const onChatsUpdated = () => { if (currentUserId) fetchChats(); };
    window.addEventListener("chats-updated", onChatsUpdated);
    return () => window.removeEventListener("chats-updated", onChatsUpdated);
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

  // --- Chat skills (needed + member skills) ---
  const loadChatSkills = (chatId) => {
    if (!chatId) return;
    axios
      .get(`http://localhost:3001/chats/${chatId}/skillsWithMembers`)
      .then((res) => {
        setSkillsWithMembers(res.data);
        setChatSkills(
          (res.data.needed || []).map((s) => ({ SkillID: s.SkillID, SkillName: s.Skill }))
        );
      })
      .catch(() => {
        setChatSkills([]);
        setSkillsWithMembers({ needed: [], memberSkills: [] });
      });
  };

  useEffect(() => {
    if (selectedChat) {
      loadChatUsers(selectedChat);
      if (skillsOpen) loadChatSkills(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    setInputVisible(true);
  }, [selectedChat]);

  // --- Scroll ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, selectedChat]);

  // --- Send message (optimistic update so it appears immediately) ---
  const handleSend = () => {
    if (!messageInput.trim() || selectedChat == null || currentUserId == null) return;
    // Prevent double send on Enter (form submit can fire twice in some browsers)
    const now = Date.now();
    if (now - lastSendAt.current < 400) return;
    lastSendAt.current = now;
    const text = messageInput.trim();

    if (!editingMessage) {
      const tempId = -Date.now();
      setMessagesMap((prev) => ({
        ...prev,
        [selectedChat]: [
          ...(prev[selectedChat] || []),
          { MsgID: tempId, text, username: currentUsername, type: "outgoing", UserID: currentUserId },
        ],
      }));
      setMessageInput("");

      axios
        .post(
          "http://localhost:3001/messages/create",
          { ChatID: selectedChat, UserID: currentUserId, Content: text },
          { withCredentials: true }
        )
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
          alert(err.response?.data?.error || "Failed to send message.");
        });
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
    if (!window.confirm("Are you sure you want to delete this message?")) return;
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

  // --- Csoport kód másolása ---
  const selectedChatData = chats.find((c) => c.ChatID === selectedChat);
  const inviteCode = selectedChatData?.PublicID || "";

  const handleCopyInviteCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode).then(
      () => alert("Code copied to clipboard: " + inviteCode),
      () => alert("Copy failed")
    );
  };

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atBottom = scrollHeight - scrollTop - clientHeight < 80;
    if (atBottom) setInputVisible(true);
    else {
      const delta = scrollTop - lastScrollTop.current;
      if (delta > 20) setInputVisible(true);
      else if (delta < -20) setInputVisible(false);
    }
    lastScrollTop.current = scrollTop;
  };

  const avatarUrl = (user) => {
    if (!user?.Avatar) return "/images/default.png";
    const u = user.Avatar;
    return u.startsWith("/") ? u : `/${u}`;
  };

  // --- Szűrt chat lista (privát = 2 tag, csoport = 3+) ---
  const filteredChats = chats.filter((chat) => {
    const count = chat.MemberCount ?? 0;
    if (chatFilter === "private") return count === 2;
    if (chatFilter === "group") return count >= 3;
    return true;
  });

  // --- Open private chat (Message button): create/find 1-1 chat, show it in list, switch to it ---
  const handleOpenPrivateChat = (e, otherUserId, otherUsername) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const uid = Number(otherUserId);
    if (!uid || uid === Number(currentUserId)) return;
    if (!currentUserId) {
      alert("Please log in to send a message.");
      return;
    }
    setPrivateChatLoading(true);

    axios
      .post(
        "http://localhost:3001/chats/private",
        { otherUserId: uid },
        { withCredentials: true }
      )
      .then((res) => {
        const chatId = res.data.ChatID;
        const name = res.data.otherUsername || otherUsername || "Private";
        setChats((prev) => {
          if (prev.some((c) => c.ChatID === chatId)) return prev;
          return [...prev, { ChatID: chatId, ChatName: name, MemberCount: 2 }];
        });
        setSelectedChat(chatId);
        setSelectedUserProfile(null);
        setPeopleOpen(false);
        setInviteCodeOpen(false);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.message || "Could not open chat.";
        alert(msg);
      })
      .finally(() => setPrivateChatLoading(false));
  };

  // --- Leave chat ---
  const handleLeaveChat = async () => {
    if (!selectedChat) return;

    if (!window.confirm("Are you sure you want to leave this group?")) return;

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
      alert("Could not leave the group");
    }
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setPeopleOpen(false);
    setSkillsOpen(false);
    setInviteCodeOpen(false);
    setSelectedUserProfile(null);
  };

  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === "Escape") closeAllMenus();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  // --- JSX ---
  return (
    <div className="chat-page">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <div className="content">
        {/* Backdrop: click outside menus closes them, does not select another chat */}
        {(menuOpen || peopleOpen || skillsOpen || inviteCodeOpen || selectedUserProfile) && (
          <div
            className="chat-menu-backdrop"
            onClick={closeAllMenus}
            aria-hidden="true"
          />
        )}

        {/* --- CHAT LIST --- */}
        <div className="user-list">
          <div className="chat-list-filters">
            <button
              type="button"
              className={chatFilter === "all" ? "filter-btn active" : "filter-btn"}
              onClick={() => setChatFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={chatFilter === "private" ? "filter-btn active" : "filter-btn"}
              onClick={() => setChatFilter("private")}
            >
              Private
            </button>
            <button
              type="button"
              className={chatFilter === "group" ? "filter-btn active" : "filter-btn"}
              onClick={() => setChatFilter("group")}
            >
              Group
            </button>
          </div>
          {filteredChats.map((chat) => (
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
              <span className="chat-row-name">{chat.ChatName}</span>
              <span className="chat-row-count" title="Member count">
                {chat.MemberCount != null ? ` (${chat.MemberCount})` : ""}
              </span>
            </div>
          ))}
        </div>

        {/* --- CHAT BOX (messages scrollable, input fixed at bottom, hides on scroll up) --- */}
        <div className="chat-container">
          <div className="chat-box">
            <div
              ref={messagesContainerRef}
              className="chat-messages"
              onScroll={handleMessagesScroll}
            >
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
            </div>

            <form
              className={`chat-input-bar ${!inputVisible ? "input-hidden" : ""}`}
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <div className="input-row">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                />
                <button type="submit" className="send-btn">
                  {editingMessage ? "↑" : "→"}
                </button>
              </div>
            </form>
          </div>

          {/* --- RIGHT PANEL (3 csík menü) --- */}
          <div className="right-panel">
            <button
              className="profile-btn menu-hamburger"
              onClick={() => setMenuOpen((prev) => !prev)}
              title="Menu"
              aria-label="Menu"
            >
              ☰
            </button>

            {menuOpen && (
              <div className="settings-dropdown">
                <button
                  onClick={() => {
                    setInviteCodeOpen((prev) => !prev);
                    setPeopleOpen(false);
                    setSkillsOpen(false);
                  }}
                >
                  Invite code
                </button>

                <button
                  onClick={() => {
                    setPeopleOpen((prev) => !prev);
                    setSkillsOpen(false);
                    setInviteCodeOpen(false);
                    if (!peopleOpen) loadChatUsers(selectedChat);
                  }}
                >
                  People
                </button>

                <button
                  onClick={() => {
                    setSkillsOpen((prev) => !prev);
                    setPeopleOpen(false);
                    setInviteCodeOpen(false);
                    if (!skillsOpen) loadChatSkills(selectedChat);
                  }}
                >
                  Skills
                </button>

                <button onClick={handleLeaveChat}>Leave</button>
              </div>
            )}
          </div>

          {/* --- INVITE CODE (csoport kód) --- */}
          {inviteCodeOpen && (
            <div className="invite-code-panel">
              <button className="close-invite-code" onClick={() => setInviteCodeOpen(false)}>
                ✖
              </button>
              <h3>Group code</h3>
              <p className="invite-code-desc">Share this code so others can join via Join by ID in the menu.</p>
              <div className="invite-code-value">{inviteCode || "—"}</div>
              <button
                type="button"
                className="invite-code-copy"
                onClick={handleCopyInviteCode}
                disabled={!inviteCode}
              >
                Copy
              </button>
            </div>
          )}

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
                {chatUsers.length === 0 && <li>No users in this chat</li>}
                {chatUsers.map((user) => (
                  <li
                    key={user.UserID}
                    className="person-row"
                    onClick={() => {
                      if (Number(user.UserID) !== Number(currentUserId)) {
                        setSelectedUserProfile(user);
                      }
                    }}
                  >
                    <img
                      src={avatarUrl(user)}
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

          {/* --- USER PROFILE MODULE (Message = open private chat) --- */}
          {selectedUserProfile && (
            <div className="user-profile-module" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="close-profile-module"
                onClick={() => setSelectedUserProfile(null)}
              >
                ✖
              </button>
              <img
                src={avatarUrl(selectedUserProfile)}
                alt={selectedUserProfile.Username}
                className="profile-module-avatar"
              />
              <h4>{selectedUserProfile.Username}</h4>
              <div className="profile-module-actions">
                <button
                  type="button"
                  className="profile-module-message-btn"
                  disabled={privateChatLoading}
                  onClick={(e) => handleOpenPrivateChat(e, selectedUserProfile.UserID, selectedUserProfile.Username)}
                >
                  {privateChatLoading ? "Opening…" : "Message"}
                </button>
                <button
                  type="button"
                  className="profile-module-view-btn"
                  onClick={() => {
                    const uid = selectedUserProfile.UserID;
                    setSelectedUserProfile(null);
                    navigate(`/profile/${uid}`);
                  }}
                >
                  View profile
                </button>
              </div>
            </div>
          )}

          {/* --- SKILLS SIDEBAR (csoport keresett + tagok skillei) --- */}
          {skillsOpen && (
            <div className={`skills-sidebar ${skillsOpen ? "open" : ""}`}>
              <button className="close-skills" onClick={() => setSkillsOpen(false)}>
                ✖
              </button>
              <h3>Skills needed in this group:</h3>
              <ul>
                {(skillsWithMembers.needed || []).map((s) => (
                  <li key={"n-" + s.SkillID} className="skill-row skill-needed">
                    {s.Skill}
                  </li>
                ))}
              </ul>
              <h3 className="skills-members-title">Members&apos; skills:</h3>
              <ul>
                {(skillsWithMembers.memberSkills || []).map((m) => (
                  <li key={"u-" + m.UserID} className="skill-member-block">
                    <strong>{m.Username}</strong>: {m.Skills && m.Skills.length ? m.Skills.join(", ") : "—"}
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
