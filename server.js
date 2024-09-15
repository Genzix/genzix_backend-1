const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

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
            to: email,  // Send to the form submitter
            subject: 'Thank You for Your Submission',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center;">
                        <img src="cid:logo" alt="Genzix Logo" style="width: 150px; height: auto; margin-bottom: 20px;" />
                    </div>
                    <h2 style="color: #4CAF50; text-align: center;">Thank You for Your Submission!</h2>
                    <p style="font-size: 16px; line-height: 1.6;">
                        Dear ${name},<br/><br/>
                        Thank you for reaching out to us! We appreciate your interest in Genzix and the services we offer. Our team is reviewing your message, and we will get back to you shortly.
                    </p>
                    <p style="font-size: 16px; line-height: 1.6;">
                        If you would like to connect with us directly on WhatsApp, feel free to click the button below.
                    </p>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://wa.me/yourwhatsappnumber" style="background-color: #25D366; color: white; padding: 12px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
                            Connect through WhatsApp
                        </a>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; margin-top: 40px;">
                        Best regards,<br/>
                        <strong>Diwakar</strong><br/>
                        Lead Generator, Genzix
                    </p>
                    <div style="text-align: center; margin-top: 20px;">
                        <p style="font-size: 14px; color: #777;">You can also contact us at <a href="mailto:teamgenzix@gmail.com" style="color: #4CAF50;">teamgenzix@gmail.com</a>.</p>
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
