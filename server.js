const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri);

// Define the schema and model for form submissions
const formSchema = new mongoose.Schema({
    name: String,
    email: String,
    company: String,
    services: String,
    phoneno: String,
    message: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const Form = mongoose.model("Form", formSchema);

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API endpoint to handle form submissions
app.post('/submitFormToMongoDB', async (req, res) => {
    const { name, email, company, services, phoneno, message } = req.body;

    try {
        const newForm = new Form({
            name,
            email,
            company,
            services,
            phoneno,
            message
        });

        const savedForm = await newForm.save();

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: ['teamgenzix@gmail.com', 'yerramsettydiwakar007@gmail.com'],
            subject: 'New Form Submission',
            text: `New form submission:
                Name: ${name}
                Email: ${email}
                Company: ${company}
                Services: ${services}
                Phoneno: ${phoneno}
                Message: ${message}
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(200).json({ success: true, data: savedForm });
    } catch (error) {
        console.error("Error saving form data to MongoDB:", error);
        res.status(500).json({ success: false, error: "Failed to save form data." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
