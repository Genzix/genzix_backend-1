const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
const jsonParser = bodyParser.json();

const PORT = 4000;
const HOST = "localhost";

const notion = new Client({ auth: "secret_ikhdEKg1fIelkdD5oVTTzZyipi0yYbholvwwxtXmjCg" });
const databaseId = "8554cd309ae54e36a5aa78b2766da7aa";

app.post('/submitFormToNotion', jsonParser, async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const company = req.body.company;
    const services = req.body.services;
    const budget = req.body.budget;
    const message = req.body.message;

    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Company: { title: [{ text: { content:  company } }] },
                "Email": { email: email }, 
                'Name' : { rich_text: [{ text: { content: name } }] },
                'Services': { rich_text: [{ text: { content: services } }] },
                'Budget': { rich_text: [{ text: { content: budget } }] },
                'Message': { rich_text: [{ text: { content: message } }] }
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
