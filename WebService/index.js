require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const moment = require('moment-timezone');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'khaeptho'
});

let data = {};

function saveDataToDB(){
    const now = moment().tz('Asia/Bangkok');
    const formattedDate = now.format('YYYY-MM-DD HH:mm:ss');
    let { water, humidity, temperature, moisture, motor } = data;
    water = parseFloat(water).toFixed(2);
    temperature = parseFloat(temperature).toFixed(2);
    humidity = parseFloat(humidity).toFixed(2);
    const query = 'INSERT INTO data (water, humidity, temperature, moisture, motor, time) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [water, humidity, temperature, moisture, motor, formattedDate];

    connection.query(query, values)
    .then(result => {
        console.log('Data inserted successfully');
    })
    .catch(err => {
        console.error(err);
    });
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.status(200).sendFile(__dirname + '/public/index.html');
    // res.status(200).sendFile(__dirname + '/public/pages/index/index.html');
});

app.get('/graph', (req, res) => {
    res.status(200).sendFile(__dirname + '/public/graph.html');
});

app.get('/database', async (req, res) => {
    const query = 'SELECT * FROM data ORDER BY id DESC LIMIT 7;';

    try{
        const result = await connection.query(query);
        const response = result[0];
        res.status(200).json(response);
    }catch(err){
        throw Error(err);
    }

})

app.get('/data', (req, res) => {
    // console.log(data)
    res.status(200).json(data);
});

let lastValues = {
    humidity: 0,
    temperature: 0,
};

app.post('/data', (req, res) => {
    const { water, humidity, temperature, moisture, motor } = req.body;
    data = { water, moisture, motor };

    if (humidity == null) {
        data.humidity = lastValues.humidity;
    } else {
        data.humidity = humidity;
        lastValues.humidity = humidity;
    }

    if (temperature == null) {
        data.temperature = lastValues.temperature;
    } else {
        data.temperature = temperature;
        lastValues.temperature = temperature;
    }

    console.log(data);
    res.status(200).json("OK");
});

// 60000 - 1 Minute
// 900000 - 15 Minutes
const updateDatabaseInterval = setInterval(saveDataToDB, 900000);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`); 
});