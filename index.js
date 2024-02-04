const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('Form'));

const mongoURI = "mongodb://srikanth-rl:%23Srikanth2205@atlas-sql-65bf97f7eba2d94282cbe05b-get7d.a.query.mongodb.net/login-db?ssl=true&authSource=admin&directConnection=true";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("DB connected..."))
    .catch(err => console.error("Err in DB connection:", err));

const db = mongoose.connection;

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
        try {
            const email = req.body.email;
            const password = req.body.password;
            const user = await User.findOne({ email });
            if (user) {
                if (user.password === password) {
                    console.log("User logged in..", user);
                    return res.redirect('home.html');
                } else {
                    return res.status(401).send("Incorrect password. Enter the Right password...");
                }
            } else {
                console.log("User not registered");
                return res.redirect('index.html');
            }
        } catch (error) {
            console.error("Error occurred:", error);
            res.status(500).send("An error occurred while processing your request.");
        }
    });

app.post("/sign_up", async(req, res) => {
    try {
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
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send("An error occurred while processing your request.");
    }
});

app.get("/", (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*"
    });
    return res.redirect('index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));