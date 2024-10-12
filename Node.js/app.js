const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blockchain'
});

// Connect to the MySQL server
connection.connect((err) => {
  if (err) {
    return console.error('error connecting: ' + err.stack);
  }
  console.log('connected as id ' + connection.threadId);
});

// Signup route to handle new user signup
app.post("/api/signup", (req, res) => {
  const { name, email, password, role, company_name, company_location } = req.body;

  const sql = `INSERT INTO user (name, email, password, role, company_name, company_location) VALUES (?, ?, ?, ?, ?, ?)`;

  connection.query(sql, [name, email, password, role, company_name, company_location], (error, result) => {
    if (error) {
      return res.status(500).json({
        "message": "Signup failed",
        "error": error,
      });
    }
    res.status(200).json({
      "message": "Signup successful!",
      "userId": result.insertId,
    });
  });
});

// Login route to handle user login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM user WHERE email = ? AND password = ?`;

  connection.query(sql, [email, password], (error, result) => {
    if (error) {
      return res.status(500).json({
        "message": "An error occurred",
        "valid": null,
      });
    }

    if (result.length === 0) {
      res.status(400).json({
        "message": "Invalid credentials",
        "valid": false,
      });
    } else {
      res.status(200).json({
        "message": "Login successful",
        "valid": true,
        "data": result,
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on: http://localhost:${port}/api/`);
});
