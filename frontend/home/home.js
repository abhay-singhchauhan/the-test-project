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

async function fetchUser(e) {
  if (e.target.classList.contains("userName")) {
    try {
      console.log("what can i do nothing is happening");
      const response = await fetch(
        `http://localhost:2000/api/profile/${e.target.innerText}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: localStorage.getItem("token"),
          },
        }
      );

      const data = await response.json();
      let str = `<button id="gobackbutton">click here to go back</button>
<div> Name :- ${data.user.name}</div>
<div> Phone :- ${data.user.phone}</div>`;

      document.getElementById("userInfo").innerHTML = str;
      document.getElementById("userInfo").style.display = "block";
      console.log(data);
    } catch (error) {
      console.log("Fetch error:", error);
    }
  }
}

document.getElementById("gobackbutton").addEventListener("click", (e) => {
  console.log("its commin");
  document.getElementById("userInfo").style.display = "none";
});

document.getElementById("inviteUserDiv").addEventListener("click", fetchUser);

async function fetchInvites() {
  try {
    console.log("what can i do nothing is happening");
    const response = await fetch("http://localhost:2000/api/invite-details", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: localStorage.getItem("token"),
      },
    });

    const data = await response.json();
    data.invites.reverse();
    console.log(data);
    displayInvites(data.invites);
  } catch (error) {
    console.log("Fetch error:", error);
  }
}
fetchInvites();
function displayInvites(data) {
  let str = "";
  data.map((ele) => {
    str += ` <div class="invite" ><h5>${ele.roomName}</h5> <button class="acceptInviteButton" id="${ele.id}">Accept</button></div>`;
  });
  document.getElementById("friendReq").innerHTML = str;
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

document.getElementById("friendReq").addEventListener("click", async (e) => {
  if (e.target.classList.contains("acceptInviteButton")) {
    try {
      const response = await fetch("http://localhost:2000/api/accept-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ id: e.target.id }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Success:", data);
        e.target.parentElement.remove();
        addToTheList(data);
        joinTheRoom(data);
      } else {
        console.error("Error:", data);

        alert("Failed to accept invite: " + data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);

      alert("Failed to accept invite. Please try again later.");
    }
  }
});

function addToTheList(data) {
  let roomsDiv = document.getElementById("rooms");
  let childDiv = document.createElement("div");
  childDiv.setAttribute("id", data.room.id);
  childDiv.setAttribute("class", "room");
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

document
  .getElementById("searchInput")
  .addEventListener("input", getUsersToInvite);

async function getUsersToInvite() {
  const inputVal = document.getElementById("searchInput").value;
  if (inputVal.trim() !== "") {
    try {
      const response = await fetch(
        `http://localhost:2000/api/users-for-invite?inputVal=${inputVal}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: localStorage.getItem("token"),
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        document.getElementById("inviteUserDiv").style.display = "block";
        displayUsers(data.users);
        console.log("Success:", data);
      } else {
        console.error("Error:", data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  } else {
    document.getElementById("inviteUserDiv").style.display = "none";
  }
}

function displayUsers(data) {
  let str = "";
  data.map((ele) => {
    str += `<div id="${ele.id}">
  <p class="userName">${ele.userId}</p>
  <button class="inviteButton">Invite</button>
</div>`;
  });
  document.getElementById("inviteUserDiv").innerHTML = str;
}

const sendInvite = async (e) => {
  if (e.target.classList.contains("inviteButton")) {
    try {
      let userId = e.target.parentElement.id;

      let roomId = document.getElementById("groupTopH4").innerText;

      const response = await fetch("http://localhost:2000/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ userId, roomId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        console.log("Success:", data);
      } else {
        alert(data.message);
        console.error("Error:", data);
      }
    } catch (error) {
      alert(error);
      console.error("Fetch error:", error);
    }
  }
};

document.getElementById("inviteUserDiv").addEventListener("click", sendInvite);

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
