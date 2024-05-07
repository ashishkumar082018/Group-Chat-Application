const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
dotenv.config();
app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:3000"]
}));

const messages = require("./routes/messageRoute");
const user = require("./routes/userRoute");
const database = require("./utils/database");
const rootDir = require('./utils/path');
const User = require("./models/userModel")
const error = require("./controllers/errorController");
const Messages = require("./models/messagesModel");

app.use(user);
app.use(messages);
app.use(error.error404);

User.hasMany(Messages);
Messages.belongsTo(User);

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