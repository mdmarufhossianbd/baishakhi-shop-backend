require('dotenv').config();
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const app = express();

app.use(cors())


app.get('/', (req, res) => {
    res.send("Welcome to Baishakhi Shop")
})

app.listen(port, () => {
    console.log(`Baishakhi server is running on ${port}`);
})