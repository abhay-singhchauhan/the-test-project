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
- before starting the server add '{force: true}' inside the parameter of sync function present in 83rd line of index.js file, it'll help us to copy the db table structure locally, please remove 
  this after running it once.


## Clone the Repository

1. Open a terminal or command prompt.
2. clone the repository.
3. run "npm i" command to install all the dependencies.
4. run "npm run start" to start the server
