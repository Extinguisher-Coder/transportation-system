import { jwtDecode } from "jwt-decode";

export const checkTokenExpiration = () => {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const { exp } = jwtDecode(token); 
    const now = Date.now();

    const timeLeft = exp * 1000 - now;

    if (timeLeft <= 0) {
      localStorage.clear();
      window.location.href = "/";
    } else {
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/";
      }, timeLeft);
    }
  } catch (error) {
    console.error("Error decoding token", error);
    localStorage.clear();
    window.location.href = "/";
  }
};
