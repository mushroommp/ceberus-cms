require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const users = require('./routes/api/users');
const auth = require('./routes/api/auth');
const token = require('./routes/api/token');
const admin = require('./routes/api/admin');
const config = require('config');
const cors = require('cors')

const app = express();

//Bodyparser Middleware
app.use(bodyParser.json());

app.use(cors());

//DB Config
const db = config.get('mongoURI');

//Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log("DB Error", err));

// Use Routes
app.use('/api/users', users)
app.use('/api/auth', auth)
app.use('/api/token', token)
app.use('/api/admin', admin)

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
