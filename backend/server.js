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
app.get('/users/:id', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});
app.post('/users/create', (req, res) => {
    const sql = "INSERT INTO users (Username, Email, Password) VALUES (?, ?, ?)";
    const values = [req.body.name, req.body.email, req.body.password];
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
    const sql = "SELECT reviews.ReviewID, reviews.Rating, reviews.Tartalom FROM reviews INNER JOIN uar ON uar.ReviewID = reviews.ReviewID INNER JOIN users on users.UserID = uar.UserID where users.UserID = ?;";
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
    const sql = "INSERT INTO reviews (Rating, Tartalom) VALUES (?, ?)";
    const values = [req.body.Rating, req.body.Tartalom];
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error creating review:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        const reviewId = results.insertId;
        const sqlUar = "INSERT INTO uar (UserID, ReviewID) VALUES (?, ?)";
        const valuesUar = [req.body.UserID, reviewId];
        db.query(sqlUar, valuesUar, (err, results) => {
            if (err) {
                console.error('Error linking review to user:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ message: 'Review created and linked to user successfully', ReviewID: reviewId });
        });
    });
});
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

//rank update
app.put('/users/updateRank/:id', (req, res) => {
    const sql = "UPDATE users SET userRank = ? WHERE UserID = ?";
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
// Start server
app.listen(3001, () => {
    console.log(`Server is running on port 3001`);
});