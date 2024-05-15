const authToken = localStorage.getItem("token");
const socket = io({ auth: { token: authToken } });

socket.on("auth-error", () => {
  alert("Authentication error: You are not logged in!");
  window.location.href = "/login";
});

document.getElementById("create-group-btn").addEventListener("click", () => {
  document.getElementById("createGroupDialog").classList.add("active");
});

document.getElementById("close").addEventListener("click", () => {
  document.getElementById("createGroupDialog").classList.remove("active");
});

document.getElementById("createGroupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    if (!authToken) {
      alert("You are not logged in!");
      window.location.href = "/login";
      return;
    }
    const name = e.target.groupName.value;
    const members = e.target.membersInput.value;
    let membersArray = members.split(",");
    const group = {
      name: name,
      members: membersArray,
    };
    socket.emit("create-group", group);
  } catch (err) {
    console.error(err);
  }
});

socket.on("user-not-found", () => {
  alert("User not found!");
});

socket.on("group-created", () => {
  window.location.reload();
});

socket.emit("get-groups", async (groups) => {
  try {
    console.log(groups);
    if (!authToken) {
      alert("You are not logged in!");
      window.location.href = "/login";
    } else {
      const groupList = document.getElementById("group-list");
      groups.forEach((group) => {
        groupList.innerHTML += `<button type="button" id=${group.id} onclick="singleGroup(${group.id}, '${group.groupName}')">${group.groupName}</button>`;
      });
    }
  } catch (err) {
    alert(err.response.data.error);
    window.location.href = "/login";
  }
});

async function singleGroup(id, name) {
  try {
    if (!authToken) {
      alert("You are not logged in!");
      window.location.href = "/login";
    } else {
      localStorage.setItem("groupId", id);
      localStorage.setItem("groupName", name);
      window.location.href = `/group/${id}`;
    }
  } catch (err) {
    console.error(err);
  }
}
