const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
dotenv.config();
app.use(cors(
    { origin: ["https://group-chat-app.ashishkumar.store"] }
));

const messages = require("./routes/messageRoute");
const user = require("./routes/userRoute");
const groups = require("./routes/groupRoute");
const error = require("./controllers/errorController");
const database = require("./utils/database");
const User = require("./models/userModel");
const Message = require("./models/messagesModel");
const Group = require("./models/groupModel");
const GroupMember = require("./models/groupMemberModel");

app.use(messages);
app.use(user);
app.use(groups);
app.use(error.error404);

User.hasMany(Message);
Message.belongsTo(User);

Group.belongsToMany(User, { through: GroupMember });
User.belongsToMany(Group, { through: GroupMember });
Group.hasMany(Message);
Message.belongsTo(Group);

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