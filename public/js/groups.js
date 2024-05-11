const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        if (!token) {
            alert("You are not logged in!");
            document.location.href = "login.html";
        }
        else {
            const groupList = document.getElementById("group-list");
            const allGroups = await axios.get("https://group-chat-app.ashishkumar.store/get-all-groups", { headers: { "Authorization": token } });
            allGroups.data.message.forEach(group => {
                groupList.innerHTML += `<button type="button" id=${group.id} onclick="singleGroup(${group.id}, '${group.name}')">${group.name}</button>`;
            });
        }
    }
    catch (err) {
        alert(err.response.data.error);
        window.location.href = "login.html";
    }
});

document.getElementById("create-group-btn").addEventListener("click", () => {
    document.getElementById("createGroupDialog").classList.add("active");
});

document.getElementById("close").addEventListener("click", () => {
    document.getElementById("createGroupDialog").classList.remove("active");
});

async function singleGroup(id, name) {
    try {
        if (!token) {
            alert("You are not logged in!");
            document.location.href = "login.html";
        }
        else {
            localStorage.setItem("groupId", id);
            localStorage.setItem("groupName", name);
            window.location.href=`/group/${id}`;
        }
    }
    catch (err) {
        console.error(err);
    }
}

document.getElementById("createGroupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const groupName = document.getElementById("groupName").value;
    const members = document.getElementById("membersInput").value;
    let membersArray = members.split(",");
    try {
        if (!token) {
            alert("You are not logged in!");
            document.location.href = "login.html";
        }
        else {
            await axios.post("https://group-chat-app.ashishkumar.store/create-group", { name: groupName, members: membersArray }, { headers: { "Authorization": token } });
            window.location.reload();
        }
    }
    catch (err) {
        alert(err.response.data.error);
    }
});