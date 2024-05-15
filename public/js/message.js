const form = document.querySelector("form");
const authToken = localStorage.getItem("token");
const socket = io({ auth: { token: authToken } });
const messagesList = document.getElementById("all-messages");
const onlineUsers = document.getElementById("online-users");
const imageInput = document.getElementById('image-input');

socket.emit("get-messages");

socket.on("auth-error", () => {
    alert("Authentication error: You are not logged in!");
    window.location.href = "/login";
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const messageContent = e.target.message.value;
        socket.emit("message", messageContent);
        e.target.message.value = "";
        const li = document.createElement("li");
        if (messageContent.startsWith("![Image]")) {
            li.innerHTML = "You" + ": " + `<img class="message-image" src="${messageContent.substring(9, messageContent.length - 1)}" alt="Image">`;
        } else {
            li.innerText = "You" + ": " + messageContent;
        }
        messagesList.appendChild(li);
        messagesList.scrollTop = messagesList.scrollHeight;
        if (messagesList.children.length > 10)
            messagesList.firstChild.remove();
    }
    catch (err) {
        console.log(err);
    }
});

imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    uploadImage(file);
});

async function uploadImage(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axios.post('http://localhost:3000/upload-image', formData, {
            headers: { "Authorization": authToken, "Content-Type": "multipart/form-data" }
        });
        const imageUrl = response.data.imageUrl;
        const messageInput = document.getElementById('message');
        messageInput.value += `![Image](${imageUrl})`;
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}


socket.on("message", (message) => {
    addMessageToList(message);
    if (messagesList.children.length > 10)
        messagesList.firstChild.remove();
});

function addMessageToList(message) {
    const li = document.createElement("li");
    if (message.messageContent.startsWith("![Image]")) {
        li.innerHTML = message.senderName + ": " + `<img class="message-image" src="${message.messageContent.substring(9, message.messageContent.length - 1)}" alt="Image">`;
    } else {
        li.innerText = message.senderName + ": " + message.messageContent;
    }
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight;
}

socket.on("all-messages", (allMessages) => {
    messagesList.innerHTML = "";
    allMessages.forEach((message) => {
        addMessageToList(message);
    });
});

socket.on("user-joined", (data) => {
    const li = document.createElement("li");
    li.innerText = `${data.username} has joined the chat`;
    onlineUsers.appendChild(li);
    onlineUsers.scrollTop = onlineUsers.scrollHeight;
});

socket.on("user-left", (data) => {
    const li = document.createElement("li");
    // console.log(data);
    li.innerText = `${data.username} has left the chat`;
    onlineUsers.appendChild(li);
    onlineUsers.scrollTop = onlineUsers.scrollHeight;
});

window.addEventListener("beforeunload", () => {
    socket.emit("user-left");
});
