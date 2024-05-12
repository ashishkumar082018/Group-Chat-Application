const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const socket = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
dotenv.config();
app.use(cors(
    { origin: ["http://localhost:3000", 'http://127.0.0.1:5500'] }
));

const views = require("./routes/viewRoute");
const user = require("./routes/userRoute");
const groups = require("./routes/groupRoute");
const error = require("./controllers/errorController");
const database = require("./utils/database");
const User = require("./models/userModel");
const Message = require("./models/messagesModel");
const Group = require("./models/groupModel");
const GroupMember = require("./models/groupMemberModel");
const authenticateSocket = require("./middlewares/authSocket");
const messagesSocket = require("./sockets/messageSocket");
const groupsSocket = require("./sockets/groupSoket");

app.use(views);
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
        server.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
        console.log("Database connected");

    io.on("connection", async (socket) => {
        socket.on("message", (message) => {
            authenticateSocket(socket, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    messagesSocket.postMessages(socket, message);
                }
            });
        });
        
        authenticateSocket(socket, (err) => {
            if (err) {
                console.log(err);
            } else {
                socket.on("create-group", (groupData) => {
                    groupsSocket.createGroup(io, socket, groupData);
                })
                socket.on("get-groups", (cb) => {
                    groupsSocket.getAllGroups(socket, cb);
                })
                socket.on("get-messages", () => {
                    messagesSocket.getAllMessages(socket);
                })
                socket.on("user-left", () => {
                    socket.broadcast.emit("user-left", { username: socket.user.name });
                })
                socket.on("get-group-members", (groupId) => {
                    socket.join(groupId);
                    groupsSocket.getGroupMembers(socket, groupId);
                    groupsSocket.getGroupMessages(socket, groupId);
                    socket.on("post-group-message", (message) => {
                        groupsSocket.postMessages(socket, message, groupId);
                    });
                });
            }
        })
        socket.on("disconnect", () => {
        });
    })
})
.catch(err => console.error(err));