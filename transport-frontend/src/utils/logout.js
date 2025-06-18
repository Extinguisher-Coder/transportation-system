export const logout = () => {
  // Remove token and user info from localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Optional: Clear other sensitive localStorage/sessionStorage items
  // sessionStorage.clear(); // Uncomment if you're using sessionStorage

  // Redirect to login page
  window.location.href = "/";
};
