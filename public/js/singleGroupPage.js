const token = localStorage.getItem("token");
const form = document.querySelector("form");
const socket = io({ auth: { token: token } });
const groupId = localStorage.getItem("groupId");
const groupName = localStorage.getItem("groupName");
const messagesList = document.getElementById("all-messages");
const navBar = document.getElementById("nav-bar");
const imageInput = document.getElementById('image-input');

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const message = e.target.message.value;
        socket.emit("post-group-message", message);
        e.target.message.value = "";
        const li = document.createElement("li");
        if (message.startsWith("![Image]")) {
            li.innerHTML = "You" + ": " + `<img class="message-image" src="${message.substring(9, message.length - 1)}" alt="Image">`;
        } else {
            li.innerText = "You" + ": " + message;
        }
        messagesList.appendChild(li);
        messagesList.scrollTop = messagesList.scrollHeight;
        if (messagesList.children.length > 10)
            messagesList.firstChild.remove();
    } catch (err) {
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
        const response = await axios.post('https://group-chat-app.ashishkumar.store/upload-image', formData, {
            headers: { "Authorization": token, "Content-Type": "multipart/form-data" }
        });
        const imageUrl = response.data.imageUrl;
        const messageInput = document.getElementById('message');
        messageInput.value += `![Image](${imageUrl})`;
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

socket.on("not-member", () => {
    alert("You are not part of this group!");
    window.location.href = "/";
});

socket.on("auth-error", () => {
    alert("Authentication error: You are not logged in!");
    window.location.href = "/login";
});

socket.emit("get-group-members", groupId);

socket.on("group-members", (members, isAdmin, emails) => {
    const memberList = document.getElementById("members");
    try {
        const allMembers = Object.keys(members).map(memberId => {
            return `<li onclick="showOptions(${memberId})" id="${memberId}">${members[memberId]}</li>`;
        }).join('');
        if (isAdmin) {
            const button = document.createElement("button");
            button.textContent = "Edit Group Settings";
            button.type = "button";
            button.id = "edit-group-settings";
            button.onclick = () => {
                document.getElementById("editGroupDialog").classList.add("active");
                const form = document.getElementById("editGroupForm");
                const groupNameInput = document.getElementById("groupName");
                const allMembersInput = document.getElementById("allMembers");
                groupNameInput.value = groupName; // Using the variable groupName instead of localStorage.getItem("groupName")
                allMembersInput.value = emails.join(", ");
                form.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const newGroupName = e.target.groupName.value;
                    const newMembers = e.target.allMembers.value.split(",").map(email => email.trim());
                    try {
                        await axios.put(`https://group-chat-app.ashishkumar.store/edit-group/${groupId}`, { name: newGroupName, members: newMembers }, { headers: { "Authorization": token } });
                        window.location.href = "/";
                    } catch (err) {
                        alert(err.response.data.error);
                    }
                });
            }
            navBar.appendChild(button);
        }
        memberList.innerHTML = allMembers;
    } catch (err) {
        console.log(err);
    }
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

socket.on("post-group-message", (message) => {
    addMessageToList(message);
    if (messagesList.children.length > 10)
        messagesList.firstChild.remove();
});

socket.on("get-group-messages", (allMessages) => {
    messagesList.innerHTML = "";
    allMessages.forEach((message) => {
        addMessageToList(message);
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        if (!token) {
            alert("You are not logged in!");
            document.location.href = "/login";
        }
        else {
            const li = document.createElement("li");
            li.innerHTML = `<a class="active" href="/group/${groupId}">${groupName}</a>`;
            navBar.appendChild(li);
        }
    }
    catch (err) {
        console.error(err);
    }
});

async function showOptions(userId) {
    const memberDialog = document.getElementById("memberDialog");
    memberDialog.classList.add("active");
    document.getElementById("delete-member").addEventListener("click", () => {
        deleteUser(userId);
    });
    document.getElementById("make-admin").addEventListener("click", () => {
        makeAdmin(userId);
    });
}

async function deleteUser(userId) {
    try {
        await axios.delete(`https://group-chat-app.ashishkumar.store/delete-member/${groupId}/${userId}`, { headers: { "Authorization": token } });
        document.location.reload();
    } catch (err) {
        alert(err.response.data.error);
    }
}

async function makeAdmin(userId) {
    try {
        await axios.put(`https://group-chat-app.ashishkumar.store/make-admin/${groupId}/${userId}`, {}, { headers: { "Authorization": token } });
        document.location.reload();
    } catch (err) {
        alert(err.response.data.error);
    }
}

document.getElementById("close").addEventListener("click", () => {
    document.getElementById("editGroupDialog").classList.remove("active");
});

document.getElementById("cancel").addEventListener("click", () => {
    document.getElementById("memberDialog").classList.remove("active");
});

document.getElementById("delete-group").addEventListener("click", async () => {
    try {
        await axios.delete(`https://group-chat-app.ashishkumar.store/delete-group/${groupId}`, { headers: { "Authorization": token } });
        window.location.href = "/";
    } catch (err) {
        alert(err.response.data.error);
    }
});
