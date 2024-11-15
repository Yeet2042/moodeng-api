import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
var cors = require('cors')

// สร้างแอป Express และตั้งค่า
const app = express();
app.use(bodyParser.json());
app.use(cors())

// เชื่อมต่อกับฐานข้อมูล SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// สร้างตาราง teams ถ้ายังไม่มี
db.run(
  `CREATE TABLE IF NOT EXISTS teams (
    name TEXT PRIMARY KEY,
    score INTEGER DEFAULT 0
  )`,
  (err) => {
    if (!err) {
      // เพิ่มทีมเริ่มต้นเมื่อเริ่มต้นเซิร์ฟเวอร์ (ODD และ PEA)
      db.run(`INSERT OR IGNORE INTO teams (name, score) VALUES ('ODD', 0), ('PEA', 0)`);
    }
  }
);

// GET: ดึงคะแนนของทั้งสองทีม
app.get('/score', (req: Request, res: Response) => {
  db.all('SELECT * FROM teams', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST: เพิ่มคะแนนให้กับทีมที่ระบุ
app.post('/score', (req: Request, res: Response) => {
  const { team } = req.body;

  console.log(team);
  

  // ตรวจสอบว่ามีทีมที่ระบุหรือไม่
  if (!team || (team !== 'ODD' && team !== 'PEA')) {
    res.status(400).json({ error: 'Invalid team name' });
    return;
  }

  // เพิ่มคะแนนให้กับทีมที่ระบุ
  db.run(
    `UPDATE teams SET score = score + 1 WHERE name = ?`,
    [team],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // ส่งคะแนนใหม่กลับไป
      db.get('SELECT * FROM teams WHERE name = ?', [team], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// ตั้งค่าให้แอปฟังที่พอร์ต 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
