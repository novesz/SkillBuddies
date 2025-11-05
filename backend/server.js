const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME, 
    port: process.env.DB_PORT
});

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
app.get('/login/', (req, res) => {
    const sql = "SELECT * FROM users where Email = ? AND Password = ?";
    const values = [req.body.email, req.body.password];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
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
app.post('/users/create', (req, res) => {
    const sql = "INSERT INTO users (Username, Email, Password, rankID) VALUES (?, ?, ?, ?)";
    const values = [req.body.name, req.body.email, req.body.password, req.body.rank || 1];
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
    const sql = "INSERT INTO Tickets (UserID, Descr, Text) VALUES (?, ?, ?)";
    const values = [req.body.UserID, req.body.Descr, req.body.Text];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error creating ticket:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Ticket created successfully', TicketID: results.insertId });
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
        res.status(201).json({ message: 'Message created successfully', MsgID: results.insertId });
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
    const sql = "SELECT msgs.MsgID, msgs.Content, msgs.SentAt, users.Username FROM msgs JOIN users ON msgs.UserID = users.UserID WHERE msgs.ChatID = ? ORDER BY msgs.SentAt ASC";
    db.query(sql, [req.params.chatId], (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});
// Start server
app.listen(3001, () => {
    console.log(`Server is running on port 3001`);
});