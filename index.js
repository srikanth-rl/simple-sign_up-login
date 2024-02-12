const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const sendVerificationEmail = require('./Form/mail.js'); // Import sendVerificationEmail function from mail.js

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
// Middleware to check if the user is authenticated


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('Form'));
app.use(session({
    secret: 'secret', // Change this to a random string
    resave: true,
    saveUninitialized: true
}));

// Your other middleware and routes...

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        // If session contains user data, proceed to the next middleware
        next();
    } else {
        // If user is not logged in, redirect to the login page
        res.redirect('/login.html');
    }
}

// Route for home page, accessible only to authenticated users
app.get("/home.html", isAuthenticated, (req, res) => {
    // Serve the home page here
    res.sendFile(__dirname + '/Form/home.html');
});

// Login route
app.post("/login", (req, res) => {
    // Check user credentials and set session if authenticated
    const { email, password } = req.body;
    // Assuming you have a User model
    if (email === "user@example.com" && password === "password") {
        req.session.user = { email: email }; // Store user data in session
        res.redirect('/home.html'); // Redirect to home page after successful login
    } else {
        res.status(401).send("Incorrect email or password");
    }
});

// Logout route
app.get("/logout", (req, res) => {
    req.session.destroy(); // Destroy session to log out user
    res.redirect('/login.html'); // Redirect to login page after logout
});

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
app.post("/signup", async(req, res) => {
    try {
        const { name, email, phno, password, rePassword } = req.body;

        if (password !== rePassword) {
            return res.status(400).send("Passwords do not match");
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send("Sorry, your Email id already exists.");
        }

        const newUser = new User({
            name: name,
            phone_no: phno,
            email: email,
            password: password
        });

        await newUser.save();
        console.log("Record stored successfully..");
        res.redirect('/login');
    } catch (error) {
        console.error('Error signing up:', error);
        return res.status(500).send("An error occurred during signup.");
    }
});


app.post("/checkEmail", async(req, res) => {
    const { email } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        res.json({ exists: true });
    } else {
        res.json({ exists: false });
    }
});

app.post('/forgotPassword', async(req, res) => {
    const { email } = req.body;
    try {
        await sendVerificationEmail(email);
        res.status(200).send('Verification email sent successfully.');
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).send('Failed to send verification email.');
    }
});

app.get("/login.html", (req, res) => {
    res.sendFile(__dirname + '/Form/login.html');
});

app.get("/", (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*"
    });
    return res.redirect('signup.html');
});
app.post("/resetPassword", async(req, res) => {
    const { verificationCode, newPassword } = req.body;
    const email = req.session.resetEmail; // Assuming you stored the email in the session during the forgot password process

    try {
        // Find the user by email
        const user = await User.findOne({ email: email });

        // Check if user exists
        if (!user) {
            return res.status(404).send("User not found.");
        }

        // Check if verification code matches
        // For simplicity, let's assume the verification code is stored in the user document
        if (user.verificationCode !== verificationCode) {
            return res.status(401).send("Invalid verification code.");
        }

        // Update the user's password
        user.password = newPassword;

        // Save the updated user document
        await user.save();

        // Clear the verification code from the user document
        user.verificationCode = undefined;
        await user.save();

        // Optional: You can also invalidate the user's session here if you want to force them to log in again with the new password

        res.status(200).send("Password updated successfully.");
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Failed to reset password. Please try again later.');
    }
});

app.listen(3000, () => {
    console.log('Server is running...');
});