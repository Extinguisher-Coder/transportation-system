export const logout = (redirect = true) => {
  localStorage.clear();
  sessionStorage.clear();

  if (redirect) {
    window.location.replace("/");
  }
};
