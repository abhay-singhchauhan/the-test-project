async function login() {
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:2000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Login successful");

      localStorage.setItem("token", data.token);
      window.location.replace(
        "http://www.localhost:2000/frontend/home/home.html"
      );
      localStorage.setItem("token", data.token);
    } else {
      alert(data.error || "Login failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}
document.querySelector("button").addEventListener("click", login);
