// JavaScript for handling form submission and validation
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    var username = document.getElementById("user").value;
    var password = document.getElementById("password").value;
    if (username === "DeakinAdmin" && password === "admin") {
        // Redirect to the successful login route (replace with your desired route)
        window.location.href = "/dashboard"; 
    } else {
        document.getElementById("error-message").textContent = "Invalid username or password. Please try again.";
    }
});
