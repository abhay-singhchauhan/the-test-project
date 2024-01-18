const socket = io();
let user;
// console.log(window.location.origin);
// document.querySelectorAll("form")[0].addEventListener("submit", (e) => {
//   e.preventDefault();
//   console.log("hm");
//   socket.emit("joinRoom", { roomId: 1 });
// });

async function fetchData() {
  try {
    console.log("what can i do nothing is happening");
    const response = await fetch("http://localhost:2000/api/getRooms", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
    });

    const data = await response.json();
    data.reverse();
    console.log(data);
    displayRooms(data);
  } catch (error) {
    console.log("Fetch error:", error);
  }
}

function displayRooms(arr) {
  let str = "";
  arr.map((ele) => {
    str += ` <div class="room" id="${ele.id}"><h5>${ele.uniqueRoomId}</h5></div>`;
  });
  document.getElementById("rooms").innerHTML = str;
}
fetchData();

async function createRoom(e) {
  e.preventDefault();
  const requestBody = {
    roomId: document.querySelectorAll("input")[0].value,
    password: document.querySelectorAll("input")[1].value,
  };

  try {
    const response = await fetch("http://localhost:2000/api/chatrooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify(requestBody),
    });
    let data;
    if (!response.ok) {
      data = await response.json();
      alert(`${data.message}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    data = await response.json();
    user = data.user;
    addToTheList(data);
    joinTheRoom(data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function addToTheList(data) {
  let roomsDiv = document.getElementById("rooms");
  let childDiv = document.createElement("div");
  childDiv.setAttribute("id", data.room.id);
  childDiv.innerHTML = `<h5>${data.room.uniqueRoomId}</h5>`;
  roomsDiv.insertBefore(childDiv, roomsDiv.firstChild);
  console.log(data);
}

async function joinRoom(e) {
  e.preventDefault();
  const room_id = document.querySelectorAll("input")[2].value;
  const password = document.querySelectorAll("input")[3].value;

  try {
    const response = await fetch("http://localhost:2000/api/joinroom", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ room_id, password }),
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      console.error(`Error: ${errorMessage.message}`);
      alert(errorMessage.message);
    } else {
      const responseData = await response.json();
      console.log(responseData);
      user = responseData.user;
      addToTheList(responseData);
      joinTheRoom(responseData);
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    alert("Unexpected Error");
  }
}

document.getElementById("rooms").addEventListener("click", changeChat);
async function changeChat(e) {
  console.log(e.target.classList.contains("room"));
  if (e.target.classList.contains("room")) {
    const groupId = e.target.firstChild.innerText;

    try {
      const response = await fetch("http://localhost:2000/api/changeChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ groupId }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Success:", data);
        user = data.user;
        joinTheRoom(data);
      } else {
        console.error("Error:", data);

        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);

      alert("Fetch error: " + error.message);
    }
  }
}

document.querySelectorAll("form")[2].addEventListener("submit", (e) => {
  e.preventDefault();
  alert("he");
  let groupId = document.getElementById("groupTopH4").innerText;
  let message = document.getElementById("messageBox").value;
  socket.emit("messageSent", {
    groupId: groupId,
    senderName: user.name,
    message: message,
    senderId: user.id,
  });
});

document.querySelectorAll("form")[1].addEventListener("submit", joinRoom);

function joinTheRoom(data) {
  let id = document.getElementById("groupTopH4").innerText;
  if (id.trim() !== "") {
    socket.emit("leave", id);
  }
  socket.emit("joinRoom", {
    roomId: data.room.uniqueRoomId,
    tokenId: data.token.tokenId,
    userName: data.user.name,
  });
}

socket.on("joinedRoom", (room) => {
  document.getElementById("groupTopH4").innerText = room.roomName;
  document.getElementById("onlyMessages").innerHTML = "";
  document.getElementById("chatInside").style.display = "block";
  alert(room.message);
});

socket.on("takeMessage", (room) => {
  console.log("room");
  let str = "";
  if (room.senderId !== user.id) {
    str += `<div class="left">${room.senderName} :- ${room.message}<div/>`;
  } else {
    str += `<div class="right">Me :- ${room.message}<div/>`;
  }
  let div = document.createElement("div");
  div.innerHTML = str;
  document.getElementById("onlyMessages").appendChild(div);
});

socket.on("invalidAccess", (room) => {
  alert(room.message);
});

document.querySelectorAll("form")[0].addEventListener("submit", createRoom);
