const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require('path');

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

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
        // Save the form submission to MongoDB
        const newForm = new Form({
            name,
            email,
            company,
            services,
            phoneno,
            message
        });

        const savedForm = await newForm.save();

        // 1. Send notification email to team members
        const notificationMailOptions = {
            from: process.env.EMAIL_USER,
            to: ['teamgenzix@gmail.com', 'yerramsettydiwakar007@gmail.com', 'sri.angajala911@gmail.com', 'mudavathsrinunayak92@gmail.com'],
            subject: 'New Form Submission',
            text: `New form submission:
                Name: ${name}
                Email: ${email}
                Company: ${company}
                Services: ${services}
                Phone Number: ${phoneno}
                Message: ${message}
            `
        };

        transporter.sendMail(notificationMailOptions, (error, info) => {
            if (error) {
                console.error("Error sending notification email:", error);
            } else {
                console.log('Notification email sent:', info.response);
            }
        });

        // 2. Send thank-you email to the form submitter
        const thankYouMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank You for Your Submission 🌟',
            html: `
                <div style="font-family: Arial, sans-serif; color: #000000; max-width: 600px; margin: 0 auto; margin-top: 35px; padding: 20px; border: 1px solid #000000; border-radius: 10px; ">
                    <div style="text-align: center; border-radius: 50%; width: 100px; margin-top: 45px; height: 100px; display: flex; align-items: center; justify-content: center; border: 1px solid #000000; margin: 0 auto;">
                        <img src="cid:logo" alt="Genzix Logo" style="width: 100%; height: 100%; border-radius: 50%;" />
                    </div>
                    <h4 style="color: #000000; text-align: center; font-size: 20px; margin-top: 25px;">Thank You for Your Submission!</h4>
                    <p style="font-size: 16px; line-height: 1.6; color: #000000;">
                        Dear ${name},<br/><br/>
                        Thank you for reaching out to us! We appreciate your interest in Genzix and the services we offer. Our team is reviewing your message and will get back to you shortly.
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #000000;">
                        If you would like to connect with us directly on WhatsApp, feel free to click the button below. 📱
                    </p>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://wa.me/919381545215" style="border: 1px solid #000000; background-color: #FFCF96; color: #000000;  padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 15px; display: inline-block;">
                            Connect through WhatsApp
                        </a>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; margin-top: 20px; color: #000000;">
                        Best regards,<br/>
                        <strong>Team Genzix</strong>
                    </p>
                    <div style="text-align: center; margin-top: 20px;">
                        <p style="font-size: 14px; color: #000000;">Follow us on social media:</p>
                        <a href="https://www.instagram.com/genzix.in/" style="text-decoration: none; margin: 0 3px;">
                            <img src="https://img.icons8.com/material-outlined/24/000000/instagram-new.png" alt="Instagram" style="vertical-align: middle;" />
                        </a>
                        <a href="https://www.linkedin.com/company/genzix.in/about/" style="text-decoration: none; margin: 0 3px;">
                            <img src="https://img.icons8.com/material-outlined/24/000000/linkedin.png" alt="LinkedIn" style="vertical-align: middle;" />
                        </a>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, 'public', 'images', 'logo.png'),  // Path to your logo image
                    cid: 'logo'  // same CID as used in the email body
                }
            ]
        };
        
        transporter.sendMail(thankYouMailOptions, (error, info) => {
            if (error) {
                console.error("Error sending thank-you email:", error);
            } else {
                console.log('Thank-you email sent:', info.response);
            }
        });

        // Send success response back to the client
        res.status(200).json({ success: true, data: savedForm });
    } catch (error) {
        console.error("Error saving form data to MongoDB:", error);
        res.status(500).json({ success: false, error: "Failed to save form data." });
    }
});


// Root URL route to show a message in the browser
app.get('/', (req, res) => {
    res.send(`Server is running on http://localhost:${PORT}`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
