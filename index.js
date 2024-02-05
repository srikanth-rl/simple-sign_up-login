const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('Form'));

// mongoose.connect('mongodb://localhost:27017/users');
const mongoURI = "mongodb+srv://srikanth-rl:%23Srikanth2205@cluster0.f6c7vle.mongodb.net/"
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on('error', () => console.log("Err in DB connection..."));
db.once('open', () => console.log("DB connected..."));

const userSchema = new mongoose.Schema({
    name: String,
    phone_no: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema, 'newUser');

app.route('/login')
    .get((req, res) => {
        res.sendFile(__dirname + '/Form/login.html');
    })
    .post(async(req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email });
        if (user) {
            if (user.password === password) {
                console.log("User logged in..", { name: user.name, phone_no: user.phone_no, email: user.email, password: user.password });
                return res.redirect('home.html');
            } else {
                return res.status(401).send("Incorrect password. Enter the Right password...");
            }
        } else {
            console.log("User not registered");
            return res.redirect('signup.html');
        }
    });

app.post("/sign_up", async(req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const phno = req.body.phno;
    const pwd = req.body.password;
    const rePwd = req.body.rePassword;

    if (pwd !== rePwd) {
        return res.redirect('/');
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        return res.status(400).send("Sorry, your Email id already exists.");
    }

    const newUser = new User({
        name: name,
        phone_no: phno,
        email: email,
        password: pwd
    });

    await newUser.save();
    console.log("Record stored successfully..");
    return res.redirect('login.html');
});

// New route to handle email availability check
app.post("/checkEmail", async(req, res) => {
    const { email } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        res.json({ exists: true });
    } else {
        res.json({ exists: false });
    }
});

app.get("/", (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*"
    });
    return res.redirect('signup.html');
});

app.listen(3000);