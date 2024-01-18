document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = {
      userId: document.getElementById("userId").value,
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      password: document.getElementById("password").value,
    };

    fetch("http://localhost:2000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Registration successful!");
        } else {
          alert("Registration failed. " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error during registration:", error);
        alert("An error occurred during registration. Please try again.");
      });
  });
