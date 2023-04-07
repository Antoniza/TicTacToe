document.getElementById("start-button").addEventListener("click", () => {
  document.getElementById("principal").style.display = "none";
  handleLoading(true);
  setTimeout(() => {
    handleLoading(false);
    document.getElementById("login").style.display = "flex";
  }, 2000);
});

document.getElementById("logOut-button").addEventListener("click", () => {
  localStorage.setItem("lastuser", localStorage.getItem("username"));
  localStorage.removeItem("username");
  window.location.reload();
});

document.getElementById("alert").addEventListener("click", () => {
  document.getElementById("alert").style.display = "none";
});

function handleLoading(state) {
  let container = document.getElementById("loading");
  if (state) {
    container.style.visibility = "visible";
    container.style.opacity = "1";
    container.style.display = "flex";
  } else {
    container.style.visibility = "hidden";
    container.style.opacity = "0";
    container.style.display = "none";
  }
}

if (localStorage.getItem("lastuser")) {
  let inputLogin = document.getElementById("user");
  inputLogin.value = localStorage.getItem("lastuser");
}

// window.onbeforeunload = function () {
//   return "¿Seguro que quieres refrescar la página?";
// };

function chatScroll() {
  let chat = document.getElementById("messages");
  chat.scrollTop = chat.scrollHeight;
}

