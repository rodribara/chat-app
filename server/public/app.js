const socket = io("ws://localhost:3500"); // Connect to the WebSocket server

const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");

const activity = document.querySelector(".activity");
const usersList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");

function sendMessage(e) {
  e.preventDefault();
  if (msgInput.name && msgInput.value && chatroom.value) {
    socket.emit("message", { name: nameInput.value, text: msgInput.value });
    msgInput.value = ""; // Clear the input field
  }
  msgInput.focus();
}

function enterRoom(e) {
  e.preventDefault();
  if (nameInput.value && chatRoom.value) {
    socket.emit("enterRoom", { name: nameInput.value, room: chatRoom.value });
  }
}

document.querySelector(".form-msg").addEventListener("submit", sendMessage);
document.querySelector(".form-join").addEventListener("submit", enterRoom);
msgInput.addEventListener("keydown", () => {
  socket.emit("activity", nameInput.value);
});

// listen for messages
socket.on("message", (data) => {
  activity.textContent = "";
  const { name, text, time } = data;
  const li = document.createElement("li");
  li.className = "post";
  if (name === nameInput.value) li.className = "post post--left";
  if (name !== nameInput.value && name !== "Admin")
    li.className = "post post--right";
  if (name === "Admin") {
    li.innerHTML = `<div class="post__header ${
      name === nameInput.value ? "post__header--user" : "post__header--reply"
    } ">
    <span class="post__header--name">${name}</span>
    <span class="post__header--time">${time}</span>
    </div>
    <div class="post__text">${text}</div>`;
  } else {
    li.innerHTML = `<div class="post__text">${text}</div>`;
  }
  document.querySelector(".chat-display").appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

let activityTimer;
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing...`;
  clearTimeout(activityTimer); // Clear the previous timer
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 2000); // Clear the activity message after 2 seconds
});
socket.on("userList", ({ users }) => {
  showUsers(users);
});
socket.on("roomList", ({ rooms }) => {
  showUsers(users);
});
function showUsers(users) {
  usersList.textContent = "";
  if (users) {
    usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
    users.forEach((users, i) => {
      usersList.textContent += `${user.name}`;
      if (users.length > 1 && i !== users.length - 1) {
        usersList.textContent += ", ";
      }
    });
  }
}
function showRooms(rooms) {
  roomList.textContent = "";
  if (rooms) {
    roomList.innerHTML = `<em>Active Rooms:</em>`;
    rooms.forEach((room, i) => {
      roomList.textContent += `${room}`;
      if (rooms.length > 1 && i !== rooms.length - 1) {
        roomList.textContent += ", ";
      }
    });
  }
}

window.addEventListener("beforeunload", () => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.close(); // Gracefully close the WebSocket connection
  }
});
