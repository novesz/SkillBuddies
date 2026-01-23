const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;


const JWT_SECRET = process.env.JWT_SECRET;
const server = require('http').createServer(app);
const WebSocket = require("ws");  
const wss = new WebSocket.Server({ server });



// Middleware


app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true 
    }
));
// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME, 
    port: process.env.DB_PORT
});
const hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};
//websocket
const clients = new Map(); 
// userId -> Set of sockets

wss.on("connection", (ws, req) => {
  try {
    const cookies = req.headers.cookie; // <-- this is where the cookie is
    console.log("Cookies received:", cookies);

    if (!cookies) return ws.close(4001, "No cookies sent");

    const token = cookies.split("; ").find(c => c.startsWith("token="))?.split("=")[1];
    if (!token) return ws.close(4002, "No token found");

    const decoded = jwt.verify(token, JWT_SECRET);
    ws.userId = decoded.userId;

    // add socket to clients map
    if (!clients.has(ws.userId)) clients.set(ws.userId, new Set());
    clients.get(ws.userId).add(ws);

    ws.on("close", () => {
      clients.get(ws.userId).delete(ws);
      if (clients.get(ws.userId).size === 0) clients.delete(ws.userId);
    });

    console.log("✅ WS connected for user:", ws.userId);
  } catch (err) {
    console.error("❌ WS connection error:", err.message);
    ws.close(4003, "Invalid token");
  }
});




// WebSocket message broadcast function
function broadcastToChat(chatId, payload) {
  console.log("Broadcasting to chat:", chatId, payload);

  const sql = "SELECT UserID FROM uac WHERE ChatID = ?";

  db.query(sql, [chatId], (err, rows) => {
    if (err) return console.error("WS broadcast error:", err);

    rows.forEach(({ UserID }) => {
      const sockets = clients.get(UserID);
      if (!sockets) return;

      sockets.forEach(ws => {
        if (ws.readyState === WebSocket .OPEN) {
          console.log("Sending WS to user:", UserID);
          ws.send(JSON.stringify(payload));
        }
      });
    });
  });
}


// Test route
app.get('/', (req, res) => {
    res.json('Server is running');
}); 
//users 
app.get('/users/all', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});
//login
function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ loggedIn: false });
  }
}

  
app.get("/auth/status", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ loggedIn: true, userId: decoded.userId });
  } catch {
    res.json({ loggedIn: false });
  }
});

  
app.post("/login", async (req, res) => {
  const { Email, Password } = req.body;

  // 1. Get user by email
  db.query("SELECT * FROM users WHERE Email = ?", [Email], async (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (results.length === 0) return res.status(401).json({ message: "Invalid email or password" });

      const user = results[0];

      try {
          // 2. Compare password with bcrypt
          const match = await bcrypt.compare(Password, user.Password);
          if (!match) return res.status(401).json({ message: "Invalid email or password" });

          // 3. Password is correct → generate JWT
          const token = jwt.sign(
              { userId: user.UserID },
              process.env.JWT_SECRET,
              { expiresIn: "7d" }
          );

          // 4. Set cookie
          res.cookie("token", token, {
              httpOnly: true,
              sameSite: "lax",
              secure: false // set to true in production (HTTPS)
          });

          res.json({ loggedIn: true });
      } catch (error) {
          console.error("Error comparing passwords:", error);
          res.status(500).json({ message: "Internal server error" });
      }
  });
});
  
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ loggedIn: false });
});

//users avatar skills profile
app.get("/users/me/profile", authMiddleware, (req, res) => {
  const userId = req.userId;

  const sqlUser = `
    SELECT u.Username, u.Email, p.URL AS avatarUrl
    FROM users u
    LEFT JOIN pictures p ON p.PicID = u.PfpID
    WHERE u.UserID = ?
  `;

  const sqlSkills = `
    SELECT s.Skill
    FROM skills s
    JOIN uas ON uas.SkillID = s.SkillID
    WHERE uas.UserID = ?
    ORDER BY s.Skill
  `;

  db.query(sqlUser, [userId], (err, userRows) => {
    if (err) {
      console.error("DB error (user):", err);
      return res.status(500).json({ error: "DB error (user)" });
    }
    if (userRows.length === 0) return res.status(404).json({ error: "Nincs ilyen felhasználó." });

    db.query(sqlSkills, [userId], (err, skillRows) => {
      if (err) {
        console.error("DB error (skills):", err);
        return res.status(500).json({ error: "DB error (skills)" });
      }

      res.json({
        name: userRows[0].Username,
        email: userRows[0].Email,
        avatarUrl: userRows[0].avatarUrl || "",
        skills: skillRows.map((r) => r.Skill),
      });
    });
  });
});


//users save

app.put("/users/me/profile", authMiddleware, (req, res) => {
  const userId = req.userId;
  const { avatarUrl, skills } = req.body;

  // DEBUG: mit kap a backend
  console.log("SAVE PROFILE userId:", userId);
  console.log("SAVE PROFILE avatarUrl:", avatarUrl);
  console.log("SAVE PROFILE skills:", skills);

  if (!Array.isArray(skills)) {
    return res.status(400).json({ error: "skills must be an array" });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("BEGIN TRANSACTION ERROR:", err);
      return res.status(500).json({ error: "Tranzakció indítási hiba.", details: err.message });
    }

    const saveSkillsPart = () => {
      const deleteSkillsSql = "DELETE FROM uas WHERE UserID = ?";
      db.query(deleteSkillsSql, [userId], (err) => {
        if (err) {
          console.error("Skillek törlési hiba:", err);
          return db.rollback(() =>
            res.status(500).json({ error: "Skillek törlési hiba.", details: err.message })
          );
        }

        if (skills.length === 0) {
          return db.commit((err) => {
            if (err) {
              console.error("Commit hiba:", err);
              return db.rollback(() =>
                res.status(500).json({ error: "Commit hiba.", details: err.message })
              );
            }
            return res.json({ message: "Profile saved" });
          });
        }

        const lookupSql = "SELECT SkillID, Skill FROM skills WHERE Skill IN (?)";
        db.query(lookupSql, [skills], (err, rows) => {
          if (err) {
            console.error("Skill lookup hiba:", err);
            return db.rollback(() =>
              res.status(500).json({ error: "Skill lookup hiba.", details: err.message })
            );
          }

          const skillIds = rows.map((r) => r.SkillID);

          if (skillIds.length !== skills.length) {
            return db.rollback(() =>
              res.status(400).json({ error: "Van olyan skill, ami nincs benne a skills táblában." })
            );
          }

          const insertValues = skillIds.map((id) => [userId, id]);
          const insertSql = "INSERT INTO uas (UserID, SkillID) VALUES ?";

          db.query(insertSql, [insertValues], (err) => {
            if (err) {
              console.error("Skill insert hiba:", err);
              return db.rollback(() =>
                res.status(500).json({ error: "Skill insert hiba.", details: err.message })
              );
            }

            db.commit((err) => {
              if (err) {
                console.error("Commit hiba:", err);
                return db.rollback(() =>
                  res.status(500).json({ error: "Commit hiba.", details: err.message })
                );
              }
              res.json({ message: "Profile saved" });
            });
          });
        });
      });
    };

    // ---- Avatar mentés: pictures + users.PfpID ----
    if (!avatarUrl) {
      return saveSkillsPart();
    }

    const findPicSql = "SELECT PicID FROM pictures WHERE URL = ? LIMIT 1";
    db.query(findPicSql, [avatarUrl], (err, rows) => {
      if (err) {
        console.error("Picture lookup hiba:", err);
        return db.rollback(() =>
          res.status(500).json({ error: "Picture lookup hiba.", details: err.message })
        );
      }

      const setUserPic = (picId) => {
        const updateUserSql = "UPDATE users SET PfpID = ? WHERE UserID = ?";
        db.query(updateUserSql, [picId, userId], (err) => {
          if (err) {
            console.error("PfpID mentési hiba:", err);
            return db.rollback(() =>
              res.status(500).json({ error: "Pfp mentési hiba.", details: err.message })
            );
          }

          // utána skillek
          saveSkillsPart();
        });
      };

      if (rows.length > 0) {
        return setUserPic(rows[0].PicID);
      }

      const insertPicSql = "INSERT INTO pictures (URL) VALUES (?)";
      db.query(insertPicSql, [avatarUrl], (err, result) => {
        if (err) {
          console.error("Picture insert hiba:", err);
          return db.rollback(() =>
            res.status(500).json({ error: "Picture insert hiba.", details: err.message })
          );
        }

        setUserPic(result.insertId);
      });
    });
  });
});



//user change password

app.post("/users/me/change-password", authMiddleware, (req, res) => {
  const userId = req.userId;
  const { current, next } = req.body;

  if (!current || !next) {
    return res.status(400).json({ error: "Hiányzó adatok." });
  }

  db.query("SELECT Password FROM users WHERE UserID = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (rows.length === 0) return res.status(404).json({ error: "Nincs ilyen felhasználó." });

    if (rows[0].Password !== current) {
      return res.status(401).json({ error: "A jelenlegi jelszó nem helyes." });
    }

    db.query("UPDATE users SET Password = ? WHERE UserID = ?", [next, userId], (err) => {
      if (err) return res.status(500).json({ error: "Jelszó frissítési hiba." });
      res.json({ message: "Password changed" });
    });
  });
});


//get user by ID
app.get('/users/:id', (req, res) => {
    const sql = "SELECT * FROM users where UserID = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});
app.post('/users/create', async (req, res) => {
    const sql = "INSERT INTO users (Username, Email, Password, rankID) VALUES (?, ?, ?, ?)";
    const hashed = await hashPassword(req.body.password)
    const values = [req.body.name, req.body.email, hashed, req.body.rank || 1];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'User created successfully', UserID: results.insertId });
    });
});
app.put('/users/change/:id', (req, res) => {
    const userId = req.params.id;
    const fields = req.body;
  
    // Build dynamic SQL query
    const updates = Object.keys(fields).map(field => `${field} = ?`).join(', ');
    const values = Object.values(fields);
    values.push(userId); // add userId to the end for WHERE clause
  
    const sql = `UPDATE users SET ${updates} WHERE UserID = ?`;
  
    db.query(sql, values, (err, results) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ message: 'User updated successfully' });
    });
  });
//users end
//reviews
app.get('/reviews/:id', (req, res) => {
    const sql = "SELECT reviews.Reviewee, reviews.Reviewer, reviews.Rating, reviews.Tartalom FROM reviews INNER JOIN users on users.UserID = reviews.Reviewee where reviews.reviewee = ?;";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});
//write review
app.post('/reviews/create', (req, res) => {
    const sql = "INSERT INTO reviews (Rating, Tartalom, Reviewer, Reviewee) VALUES (?, ?, ?, ?)";
    const values = [req.body.Rating, req.body.Tartalom, req.body.Reviewer, req.body.Reviewee];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error creating review:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        res.status(201).json({ message: 'Review created and linked to user successfully'});
    });
});
//edit review
app.put('/reviews/edit/', (req, res) => {
    const sql = "UPDATE reviews SET Rating = ?, Tartalom = ? WHERE Reviewer = ? AND Reviewee = ?";
    const values = [req.body.Rating, req.body.Tartalom, req.body.Reviewer, req.body.Reviewee];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error updating review:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }   
        res.json({ message: 'Review updated successfully' });
    });
});
//delete review
app.delete('/reviews/delete/', (req, res) => {
    const sql = "DELETE FROM reviews WHERE Reviewee = ? AND Reviewer = ?;";
    const values = [req.body.Reviewee, req.body.Reviewer];
    db.query(sql, values, (err, results) => {
        if(err){
            console.error('Error deleting review:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
    res.json({ message: 'Review deleted successfully' });
});
//reviews end
//skills
app.get('/skills/:id', (req, res) => {
    const sql = "SELECT skills.SkillID, skills.Skill FROM skills JOIN uas ON uas.SkillID = skills.SkillID JOIN users ON users.UserID = uas.UserID WHERE users.UserID = ?;";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching skills:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});
app.get('/skills', (req, res) => {
    const sql = "SELECT * FROM skills";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching skills:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});
//add skill to user
app.post('/users/addSkill', (req, res) => {
    const sql = "INSERT INTO uas (UserID, SkillID) VALUES (?, ?)";
    const values = [req.body.UserID, req.body.SkillID];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error adding skill to user:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Skill added to user successfully' });
    });
});
//skills end
//tickets
app.get('/tickets', (req, res) => {
    const sql = "SELECT * FROM Tickets";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tickets:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});
//tickets create
app.post('/tickets/create', (req, res) => {
    const sql = "INSERT INTO Tickets (Email, Text) VALUES (?, ?)";
    const values = [req.body.Email, req.body.Text];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error creating ticket:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Ticket created successfully', TicketID: results.insertId });
    });
});
//tickets Resolve
app.put('/tickets/resolve/:id', (req, res) => {
    const sql = "UPDATE tickets SET IsResolved = 1 WHERE TicketID = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error resolving ticket:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Ticket resolved successfully' });
    });
});

//rank update
app.put('/users/updateRank/:id', (req, res) => {
    const sql = "UPDATE users SET rankID = ? WHERE UserID = ?";
    const values = [req.body.userRank, req.params.id];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'User updated successfully' });
    });
});
//tokens update
app.put('/users/updateTokens/:id', (req, res) => {
    const sql = "UPDATE users SET Tokens = Tokens + ? WHERE UserID = ?";
    const values = [req.body.Tokens, req.params.id];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'User updated successfully' });
    });
});
//new chat
app.post('/chats/create', (req, res) => {
    const sql = "INSERT INTO chats (ChatName, ChatPic) VALUES (?, ?)";
    const values = [req.body.ChatName, req.body.ChatPic];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error creating chat:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Chat created successfully', ChatID: results.insertId });
    });
});
//get all chats
app.get('/chats/all', (req, res) => {
    const sql = "SELECT * FROM chats";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching chats:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }   
        res.json(results);
    });
});
//get chats userenkent
app.get('/chats/users/:userId', (req, res) => {
    const sql = "SELECT chats.ChatID, chats.ChatName, chats.ChatPic FROM chats JOIN uac ON uac.ChatID = chats.ChatID WHERE uac.UserID = ?";
    db.query(sql, [req.params.userId], (err, results) => {
        if (err) {
            console.error('Error fetching chats:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }   
        res.json(results);
    });
});
//chat by ID
app.get('/chats/:chatId', (req, res) => {
    const sql = "SELECT * FROM chats WHERE ChatID = ?";
    db.query(sql, [req.params.chatId], (err, results) => {
        if (err) {
            console.error('Error fetching chat by ID:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });  
});

//get x random chats
app.get('/chats/random/:nr', (req, res) => {
    const nr = parseInt(req.params.nr, 10);
    const sql = "SELECT * FROM chats WHERE ChatID >= (SELECT FLOOR(RAND() * (SELECT MAX(ChatID) FROM chats))) ORDER BY RAND() LIMIT ?;";
    db.query(sql,[nr], (err, results) => {
        if (err) {
            console.error('Error fetching random chats:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});
//join chat
app.post('/chats/join', (req, res) => {
    const sql = "INSERT INTO uac (UserID, ChatID) VALUES (?, ?)";
    const values = [req.body.UserID, req.body.ChatID];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error joining chat:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }   
        res.status(201).json({ message: 'Joined chat successfully' });
    });
});
//leave chat
app.delete('/chats/leave/:id', (req, res) => {
    const sql = "DELETE FROM uac WHERE UserID = ? AND ChatID = ?";
    db.query(sql, [req.params.UserID, req.body.ChatID], (err, results) => {
        if (err) {
            console.error('Error leaving chat:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }   
        res.json({ message: 'Left chat successfully' });
    });
});
//make chat admin
app.put('/chats/makeAdmin', (req, res) => {
    const sql = "UPDATE uac SET IsChatAdmin = 1 WHERE UserID = ? AND ChatID = ?";
    const values = [req.body.UserID, req.body.ChatID];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error making chat admin:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }   
        res.status(201).json({ message: 'User made chat admin successfully' });
    });
});
//users by chat 
app.get('/chats/users/:chatId', (req, res) => {
    const sql = "SELECT * FROM uac WHERE uac.ChatID = 1;";
    db.query(sql, [req.params.chatId], (err, results) => {
        if (err) {
            console.error('Error fetching users by chat:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});
//edit chat info
app.put('/chats/edit/:id', (req, res) => {
    const chatId = req.params.id;
    const fields = req.body;
    // Build dynamic SQL query
    const updates = Object.keys(fields).map(field => `${field} = ?`).join(', ');
    const values = Object.values(fields);
    values.push(chatId); // add chatId to the end for WHERE clause
    const sql = `UPDATE chats SET ${updates} WHERE ChatID = ?`;
    db.query(sql, values, (err, results) => {
      if (err) {
        console.error('Error updating chat:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
        res.json({ message: 'Chat updated successfully' });
    });
  });
//delete chat
app.delete('/chats/delete/:id', (req, res) => {
    const sql = "DELETE FROM chats WHERE ChatID = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error deleting chat:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Chat deleted successfully' });
    });
});
// write message
app.post('/messages/create', (req, res) => {
  const sql = "INSERT INTO msgs (ChatID, UserID, Content) VALUES (?, ?, ?)";
  const values = [req.body.ChatID, req.body.UserID, req.body.Content];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error creating message:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const message = {
      type: "NEW_MESSAGE",
      msg: {
        MsgID: results.insertId,
        ChatID: req.body.ChatID,
        UserID: req.body.UserID,
        Content: req.body.Content,
        SentAt: new Date()
      }
    };

    broadcastToChat(req.body.ChatID, message);

    res.status(201).json({ message: 'Message created successfully' });
  });
});

//message edit
app.put('/messages/edit/:id', (req, res) => {
    const sql = "UPDATE msgs SET Content = ? WHERE MsgID = ?";
    const values = [req.body.Content, req.params.id];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error updating message:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Message updated successfully' });
    });
});
//message delete
app.delete('/messages/delete/:id', (req, res) => {
    const sql = "DELETE FROM msgs WHERE MsgID = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error deleting message:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }       
        res.json({ message: 'Message deleted successfully' });
    });
});
//get messages by chat
app.get('/messages/:chatId', (req, res) => {
    const sql = `
      SELECT msgs.MsgID, msgs.Content, msgs.SentAt, msgs.UserID, users.Username
      FROM msgs
      JOIN users ON msgs.UserID = users.UserID
      WHERE msgs.ChatID = ?
      ORDER BY msgs.SentAt ASC
    `;
    db.query(sql, [req.params.chatId], (err, results) => {
      if (err) {
        console.error('Error fetching messages:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(results);
    });
  });
// Start server


// Eszti szuro

app.get('/cards', (req, res) => {
    const sql = `
        SELECT 
            s.SkillID,
            s.Skill,
            COUNT(uas.UserID) AS UserCount
        FROM skills s
        LEFT JOIN uas ON uas.SkillID = s.SkillID
        GROUP BY s.SkillID, s.Skill
        ORDER BY s.Skill;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching cards:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        
        const cards = results.map(row => ({
            id: row.SkillID,
            title: row.Skill,          
            items: [row.Skill],        
            users: row.UserCount || 0 
        }));

        res.json(cards);
    });
});

app.post("/groups", (req, res) => {
  const { chatName, chatPic, skillIds, userId } = req.body;

  if (!chatName || !userId || !Array.isArray(skillIds) || skillIds.length === 0) {
    return res.status(400).json({ error: "Hiányzó adatok (chatName, userId, skillIds)." });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Tranzakció indítási hiba." });
    }

    // 1. chats insert
    const insertChatSql = "INSERT INTO chats (ChatName, ChatPic) VALUES (?, ?)";
    db.query(insertChatSql, [chatName, chatPic || null], (err, chatResult) => {
      if (err) {
        console.error("Chat insert hiba:", err);
        return db.rollback(() => {
          res.status(500).json({ error: "Hiba a csoport létrehozásakor." });
        });
      }

      const newChatId = chatResult.insertId;

      // 2. neededskills insert (több sor egyszerre)
      const neededValues = skillIds.map((skillId) => [newChatId, skillId]);
      const insertNeededSql = "INSERT INTO neededskills (ChatID, SkillID) VALUES ?";

      db.query(insertNeededSql, [neededValues], (err) => {
        if (err) {
          console.error("neededskills insert hiba:", err);
          return db.rollback(() => {
            res.status(500).json({ error: "Hiba a skillek mentésekor." });
          });
        }

        // 3. uac – a létrehozó legyen admin
        const insertUacSql = `
          INSERT INTO uac (UserID, ChatID, IsChatAdmin)
          VALUES (?, ?, 1)
        `;

        db.query(insertUacSql, [userId, newChatId], (err) => {
          if (err) {
            console.error("uac insert hiba:", err);
            return db.rollback(() => {
              res.status(500).json({ error: "Hiba a tag mentésekor." });
            });
          }

          db.commit((err) => {
            if (err) {
              console.error("Commit hiba:", err);
              return db.rollback(() => {
                res.status(500).json({ error: "Commit hiba." });
              });
            }

            res.status(201).json({
              message: "Csoport sikeresen létrehozva!",
              chatId: newChatId,
            });
          });
        });
      });
    });
  });
});

// Összes csoport lekérése a főoldalhoz
app.get("/groups", (req, res) => {
  const sql = `
    SELECT 
      c.ChatID,
      c.ChatName,
      c.ChatPic,
      c.CreatedAt,
      GROUP_CONCAT(DISTINCT s.Skill ORDER BY s.Skill SEPARATOR ', ') AS Skills,
      COUNT(DISTINCT u.UserID) AS MemberCount
    FROM chats c
    LEFT JOIN neededskills ns ON ns.ChatID = c.ChatID
    LEFT JOIN skills s ON ns.SkillID = s.SkillID
    LEFT JOIN uac u ON u.ChatID = c.ChatID
    GROUP BY c.ChatID, c.ChatName, c.ChatPic, c.CreatedAt
    ORDER BY c.CreatedAt DESC;
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Groups list hiba:", err);
      return res.status(500).json({ error: "Adatbázis hiba (groups list)." });
    }
    res.json(rows);
  });
});


// PUT /users/:id/avatar – profilkép mentése
app.put('/users/:id/avatar', (req, res) => {
  const userId = req.params.id;
  const { avatar } = req.body; // pl. "/avatars/cat.png"

  if (!avatar) {
    return res.status(400).json({ error: "Hiányzik az avatar." });
  }

  const sql = "UPDATE users SET Avatar = ? WHERE UserID = ?";

  db.query(sql, [avatar, userId], (err, result) => {
    if (err) {
      console.error("Hiba az avatar frissítésekor:", err);
      return res.status(500).json({ error: "Adatbázis hiba." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nincs ilyen felhasználó." });
    }

    return res.json({ message: "Avatar frissítve.", avatar });
  });
});

// GET /users/:id – 1 felhasználó adatai
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT UserID, Email, Avatar FROM users WHERE UserID = ?";

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Hiba user lekérdezésnél:", err);
      return res.status(500).json({ error: "Adatbázis hiba." });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "Nincs ilyen felhasználó." });
    }
    res.json(rows[0]);
  });
});

server.listen(3001, () => {
    console.log(`Server is running on port 3001`);
});

