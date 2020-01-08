const express = require('express');
const app = express();
const morgan = require('morgan');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'UoftEngQs_mysql'
});

connection.connect((err) => {
    if(!err) console.log('database connected.');
    else console.log('db not connected \n Error : '+JSON.stringify(err,undefined,2));
});

app.use(bodyParser.urlencoded({entended: false}));

app.use(morgan('short'));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));

app.post('/user_create', (req, res) => {
    console.log("Creating a new user.");

    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const email = req.body.email;
    const discipline = req.body.discipline;
    const graduationYear = req.body.graduation_year;
    const password = req.body.password;

    const queryString = "INSERT INTO users (first_name, last_name, email, Major, graduation_year, password) VALUES (?, ?, ?, ?, ?, ?)"
    connection.query(queryString, [firstName, lastName, email, discipline, graduationYear, password], (err, results, fields) => {
        if (err) {
            console.log("Failed to insert new user: " + err);
            res.sendStatus(500);
            return;
        }
        
        console.log("Inserted a new user with id: ", results.insertId);
        res.render('home.ejs');
    });
});

app.post('/user_login', (req, res) => {
    console.log("Attempting to login user");

    const email = req.body.email;
    const password = req.body.password;

    const queryString = "SELECT password FROM users WHERE email = ?";
    connection.query(queryString, [email], (err, results, fields) => {
        if (results[0].password == password) {
            console.log("Successfully logged in user.");
            res.render('home.ejs');
        }
        else {
            console.log("wrong password");
            res.render('login_wrong.ejs');
        }
    });
});

app.get('/user/:id', (req, res) => {
    console.log("Fetching user with id: " + req.params.id);

    const userId = req.params.id;
    const queryString = "SELECT * FROM users WHERE id = ?";
    connection.query(queryString, [userId], (err, rows, fields) => {
        if (!err) {
            console.log("Fetched user successfully.");
            res.json(rows);
        }
        else {
            console.log("Something went wrong fetching user.");
        }
    });
});

app.get("/", (req, res) => {
    console.log("Responding to root route");
    res.render('index.ejs');
});

app.get("/users", (req, res) => {
    console.log("Fetching users.");

    const queryString = "SELECT * FROM users"
    connection.query(queryString, (err, rows, fields) => {
        if (!err) {
            console.log("Successfully fetched all users.");
            res.json(rows);
        }
        else {
            console.log("Failed to fetch all users.");
        }
    });
});

app.get("/classes", (req, res) => {
    const queryString = "SELECT * FROM classes"
    connection.query(queryString, (err, rows, fields) => {
        if (!err) {
            console.log("Successfully fetched all classes.");
            res.json(rows);
        }
        else {
            console.log("Failed to fetch all classes.");
        }
    });
});

app.get('/loadLogin', (req, res) => {
    res.render('login.ejs');
});

app.listen(1212, () => {
    console.log("Server is up and listening on 1212...");
});