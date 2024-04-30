const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const User = require("./routes/userRoute");
const database = require("./util/database");
const rootDir = require('./util/path');

const app = express();
dotenv.config();
app.use(cors({
    origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
    credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static(path.join(rootDir, 'public')));

app.use(User);

database
    .sync({
       // force : true
    })
    
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
        console.log("Database connected");
    }).catch(err => console.log(err));