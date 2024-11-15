"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var body_parser_1 = require("body-parser");
var sqlite3_1 = require("sqlite3");
var cors = require('cors');
// สร้างแอป Express และตั้งค่า
var app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(cors());
// เชื่อมต่อกับฐานข้อมูล SQLite
var db = new sqlite3_1.default.Database('./database.sqlite', function (err) {
    if (err) {
        console.error('Error connecting to SQLite database', err);
    }
    else {
        console.log('Connected to SQLite database');
    }
});
// สร้างตาราง teams ถ้ายังไม่มี
db.run("CREATE TABLE IF NOT EXISTS teams (\n    name TEXT PRIMARY KEY,\n    score INTEGER DEFAULT 0\n  )", function (err) {
    if (!err) {
        // เพิ่มทีมเริ่มต้นเมื่อเริ่มต้นเซิร์ฟเวอร์ (ODD และ PEA)
        db.run("INSERT OR IGNORE INTO teams (name, score) VALUES ('ODD', 0), ('PEA', 0)");
    }
});
// GET: ดึงคะแนนของทั้งสองทีม
app.get('/score', function (req, res) {
    db.all('SELECT * FROM teams', function (err, rows) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});
// POST: เพิ่มคะแนนให้กับทีมที่ระบุ
app.post('/score', function (req, res) {
    var team = req.body.team;
    console.log(team);
    // ตรวจสอบว่ามีทีมที่ระบุหรือไม่
    if (!team || (team !== 'ODD' && team !== 'PEA')) {
        res.status(400).json({ error: 'Invalid team name' });
        return;
    }
    // เพิ่มคะแนนให้กับทีมที่ระบุ
    db.run("UPDATE teams SET score = score + 1 WHERE name = ?", [team], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // ส่งคะแนนใหม่กลับไป
        db.get('SELECT * FROM teams WHERE name = ?', [team], function (err, row) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(row);
        });
    });
});
// ตั้งค่าให้แอปฟังที่พอร์ต 3000
var PORT = 3000;
app.listen(PORT, function () {
    console.log("Server is running on http://localhost:".concat(PORT));
});
