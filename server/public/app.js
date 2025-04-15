const socket = io("ws://localhost:3500"); // Connect to the WebSocket server

const activity = document.querySelector(".activity");
const msgInput = document.querySelector("input");

function sendMessage(e) {
  e.preventDefault();
  if (msgInput.value) {
    socket.emit("message", msgInput.value);
    msgInput.value = "";
  }
  msgInput.focus();
}

document.querySelector("form").addEventListener("submit", sendMessage);

// listen for messages
socket.on("message", (data) => {
  const li = document.createElement("li");
  li.textContent = data;
  document.querySelector("ul").appendChild(li);
});

msgInput.addEventListener("keydown", () => {
  socket.emit("activity", socket.id.substringg(0.5));
  let activityTimer;
  socket.on("activity", (id, data) => {
    activity.textContent = `${id} is typing...`;
  });
});

window.addEventListener("beforeunload", () => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.close(); // Gracefully close the WebSocket connection
  }
});
