# Chat Room App

## Local Deployment Guidelines

Welcome to the local deployment guidelines for Chat Room App]. This document provides step-by-step instructions to set up and run the project on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js: [Download and Install Node.js](https://nodejs.org/)
- npm (Node Package Manager): Comes with Node.js installation.
- Git: [Download and Install Git](https://git-scm.com/)
- mySQL: [Download and Install mySQL](https://dev.mysql.com/downloads/installer/)


### .env file guide

 Please make a .env file in the root directory and add follwing key and values to it.

- DB_PASSWORD = "****"
- JWT_KEY = "****"

### Few Pointers to setup database locally

- In DB_PASSWORD please add the password of your root mySQL server, you can add any key in JWT_KEY.
- Make sure that you've made one database with the name "abhimaan-assignment" in your root mySQL server.


### Clone the Repository

1. Open a terminal or command prompt.
2. clone the repository.
3. run "npm i" command to install all the dependencies.
4. run "npm run start" to start the server

### accessing the frontend part of the app

- After starting the server go to the following links to access differect pages
  1. Home Page - http://www.localhost:2000/frontend/home/home.html
  2. Signup Page - http://www.localhost:2000/frontend/signup/signup.html
  3. Login Page - http://www.localhost:2000/frontend/login/login.html




## Table Structure

- Command to create users table
  
  CREATE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255) NOT NULL UNIQUE,
  deviceId VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL UNIQUE,
  availCoins INT NOT NULL DEFAULT 150,
  password VARCHAR(255) NOT NULL,
  isPrime BOOLEAN NOT NULL DEFAULT true
);


- Command to create tokens table

  CREATE TABLE tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tokenId VARCHAR(255) NOT NULL,
  isValid BOOLEAN NOT NULL DEFAULT true
);


- Command to create rooms table

  CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uniqueRoomId VARCHAR(255) NOT NULL,
  roomPassword VARCHAR(255) NOT NULL,
  creator INT NOT NULL
);


- Command to create invites table

  CREATE TABLE invites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roomId INT NOT NULL,
  userId INT NOT NULL,
  roomName VARCHAR(255) NOT NULL,
  isActive BOOLEAN DEFAULT true,
  FOREIGN KEY (roomId) REFERENCES rooms(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);


- Command to create roomuser table

  CREATE TABLE roomuser (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  roomId INT NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(id),
  FOREIGN KEY (roomId) REFERENCES Rooms(id)
);



## API end points details

### registration api  "http://www.localhost:2000/api/register"
 - Rquest body - {
      userId: some value,
      name: some value,
      phone: some value,
      password: some value,
    }

### login api "/api/login"
 - Request body - {
      phone: some value,
      password: some value,
    }

### api to create new room "http://www.localhost:2000/api/chatrooms"
 - Request body - {
      roomId: some value,
      password: some value,
    }
 - headers - {
      authorization: JWT_TOKEN
   }

### api to join a room "http://www.localhost:2000/api/joinroom"
- Request body - { room_id: some value, password: some value }
- headers - {
      authorization: JWT_TOKEN
   }

### api to get details of all the room of which user is part "http://www.localhost:2000/api/getRooms"
- headers - {
      authorization: JWT_TOKEN
   }
   
### api to get token which user can further use to authenticate itself while connecting to the rooms "http://www.localhost:2000/api/changechat"
- Request body - {groupId: some value}

### api to send a invite to a user "http://www.localhost:2000/api/invite"
- Request body - { userId: some value, roomId: some value }
- headers - {
      authorization: JWT_TOKEN
   }

### api to accept the invite "http://www.localhost:2000/api/accept-invite"
- Request body - { id: some value }
- headers - {
      authorization: JWT_TOKEN
   }

### to get the list of all the user with the matching userId to the query "http://www.localhost:2000/api/users-for-invite?inputVal=abcd"
- headers - {
      authorization: JWT_TOKEN
   }

### to get all the invite requrest that clint has got "http://www.localhost:2000/api/invite-details"
- headers - {
      authorization: JWT_TOKEN
   }

### to get user detail of a perticular user "http://www.localhost:2000/api/profile/:userId"
- headers - {
      authorization: JWT_TOKEN
   }
