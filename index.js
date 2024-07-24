const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Built-in middleware to parse JSON

const PORT = 4001; 
const HOST = '0.0.0.0';

const notion = new Client({ auth: "secret_ikhdEKg1fIelkdD5oVTTzZyipi0yYbholvwwxtXmjCg" });
const databaseId = "8554cd309ae54e36a5aa78b2766da7aa";

// Logging middleware to log request body
app.use((req, res, next) => {
    console.log('Request Body:', req.body);
    next();
});

app.post('/submitFormToNotion', async (req, res) => {
    const { name, email, company, services, phoneno, message } = req.body;

    // Validate required fields
    if (!name) {
        return res.status(400).json({ error: "Name is empty" });
    }
    if (!email) {
        return res.status(400).json({ error: "Email is empty" });
    }
    if (!company) {
        return res.status(400).json({ error: "Company is empty" });
    }
    if (!services) {
        return res.status(400).json({ error: "Services are empty" });
    }
    if (!message) {
        return res.status(400).json({ error: "Message is empty" });
    }

    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Company: { title: [{ text: { content: company } }] },
                Email: { email: email },
                Name: { rich_text: [{ text: { content: name } }] },
                Services: { rich_text: [{ text: { content: services } }] },
                Phoneno: { rich_text: [{ text: { content: phoneno } }] },
                Message: { rich_text: [{ text: { content: message } }] }
            }
        });

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error occurred while submitting to Notion.");
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Starting proxy at http://${HOST}:${PORT}`);
});
