let webSocket = null;

function sendData(event) {
  event.preventDefault();
  event.stopPropagation();
  let messageInput = event.target.message;

  if (messageInput.value != "") {
    let data = JSON.stringify({
      message: messageInput.value,
      status: 200,
      user: localStorage.getItem("username"),
      action: "Conversando...",
      room: localStorage.getItem("room"),
    });
    doSend(data);
    messageInput.value = "";
  }
}

function login(event) {
  event.preventDefault();
  event.stopPropagation();
  let userName = event.target.user;
  let data = JSON.stringify({
    username: userName.value,
    status: 201,
    action: "Iniciando sesión",
  });
  doSend(data);
  localStorage.setItem("username", userName.value);
  document.getElementById("login").style.display = "none";
  document.getElementById("lobby").style.display = "flex";
  document.getElementById("username").innerHTML =
    localStorage.getItem("username");
}

function fillSpace(event) {
  event.preventDefault();
  event.stopPropagation();
  let space = event.target;

  if (space.classList.contains("emptyCard")) {
    space.classList.remove("emptyCard");
    space.classList.add("fullCard");
    space.dataset.card = localStorage.getItem("rivalInfo") == "X" ? "O" : "X";

    let table = document.querySelectorAll(".imgBoard");
    let positions = [];
    table.forEach((element) => {
      positions.push(element.dataset.card);
    });

    let data = JSON.stringify({
      room: localStorage.getItem('room'),
      status: 215,
      action: "Jugada de " + localStorage.getItem("username"),
      username: localStorage.getItem("username"),
      position: space.id,
      positions: positions,
      card: localStorage.getItem("rivalInfo") == "X" ? "O" : "X",
    });
  
    doSend(data);
  } else {
    document.getElementById("alert").style.display = "flex";
    document.getElementById("alert-message").innerHTML = "Casilla ocupada.";
  }
}

document.getElementById("return-winner-button").addEventListener("click", () => {
  endGame();
});

document.getElementById("return-loser-button").addEventListener("click", () => {
  endGame();
});

document.getElementById("draw-button-yes").addEventListener("click", () => {
  document.getElementById('draw-message').style.display = "none";
  restartBoard();
  rivalLoadImages({card: localStorage.getItem('rivalInfo')});
});

document.getElementById("draw-button-no").addEventListener("click", () => {
  document.getElementById('draw-message').style.display = "none";
  let gameData = {
    room: localStorage.getItem("room"),
    username: localStorage.getItem("username"),
    status: 280,
    action: "Rechazo de revancha",
  };

  localStorage.removeItem("room");

  doSend(JSON.stringify(gameData));
});

function endGame(){
  document.getElementById("game-set").style.display = "none";
  document.getElementById("winner-message").style.display = "none";
  document.getElementById("loser-message").style.display = "none";
  reloadHistory();
  loadHistory();
  restartBoard();
  handleLoading(true);
  setTimeout(() => {
    handleLoading(false);
    document.getElementById("lobby").style.display = "flex";
  }, 5000);
}

function init() {
  wsConnect();
  if (localStorage.getItem("username")) {
    document.getElementById("principal-container").style.display = "none";
    let redirectMessage = document.getElementById("redirecting");
    redirectMessage.innerHTML = "Reconectando...";

    handleLoading(true);
    setTimeout(() => {
      let data = JSON.stringify({
        username: localStorage.getItem("username"),
        status: 201,
        action: "Iniciando sesión",
      });
      doSend(data);
      document.getElementById("principal").style.display = "none";
      handleLoading(false);
      document.getElementById("lobby").style.display = "flex";
      document.getElementById("username").innerHTML =
        localStorage.getItem("username");
      loadHistory();
    }, 5000);
  }
}

document.getElementById("fast-message1").addEventListener("click", () => {
  let data = JSON.stringify({
    message: "Buena suerte.",
    status: 200,
    user: localStorage.getItem("username"),
    action: "Conversando...",
    room: localStorage.getItem("room"),
  });
  doSend(data);
});

document.getElementById("fast-message2").addEventListener("click", () => {
  let data = JSON.stringify({
    message: "Buena jugada.",
    status: 200,
    user: localStorage.getItem("username"),
    action: "Conversando...",
    room: localStorage.getItem("room"),
  });
  doSend(data);
});

document.getElementById("fast-message3").addEventListener("click", () => {
  let data = JSON.stringify({
    message: "Buena partida.",
    status: 200,
    user: localStorage.getItem("username"),
    action: "Conversando...",
    room: localStorage.getItem("room"),
  });
  doSend(data);
});

document.getElementById("fast-message4").addEventListener("click", () => {
  let data = JSON.stringify({
    message: "Gracias.",
    status: 200,
    user: localStorage.getItem("username"),
    action: "Conversando...",
    room: localStorage.getItem("room"),
  });
  doSend(data);
});

document.getElementById("fast-message5").addEventListener("click", () => {
  let data = JSON.stringify({
    message: "Igualmente.",
    status: 200,
    user: localStorage.getItem("username"),
    action: "Conversando...",
    room: localStorage.getItem("room"),
  });
  doSend(data);
});

document.getElementById("fast-message6").addEventListener("click", () => {
  let data = JSON.stringify({
    message: "De nada.",
    status: 200,
    user: localStorage.getItem("username"),
    action: "Conversando...",
    room: localStorage.getItem("room"),
  });
  doSend(data);
});

document.onkeydown = function (e) {
  tecla = document.all ? e.keyCode : e.which;
  if (tecla == 116) {
    if (
      confirm(
        "¿Seguro que quieres refrescar la página?\nSi abandonas una partida perderas automaticamente"
      ) == true
    ) {
      let gameData = {
        room: localStorage.getItem("room"),
        username: localStorage.getItem("username"),
        status: 280,
        action: "Recargando...",
      };

      localStorage.removeItem("room");

      doSend(JSON.stringify(gameData));
      return true;
    } else {
      return false;
    }
  }
};

function loadHistory() {
  let h = JSON.parse(localStorage.getItem("history"));
  let history = document.getElementById("history-container");

  if (h.username == localStorage.getItem("username")) {
    h.history.forEach((item) => {
      let historyItem = document.createElement("div");
      historyItem.classList.add("history-item");

      let winnerContainer = document.createElement("div");
      winnerContainer.classList.add("winner");

      let loserContainer = document.createElement("div");
      loserContainer.classList.add("loser");

      let winnerHistoryItemTitle = document.createElement("h3");
      winnerHistoryItemTitle.innerHTML = "Ganador";

      let loserHistoryItemTitle = document.createElement("h3");
      loserHistoryItemTitle.innerHTML = "Perdedor";

      let winner = document.createElement("span");
      winner.id = "winner-user";
      winner.innerHTML = item.winner;

      let loser = document.createElement("span");
      loser.id = "loser-user";
      loser.innerHTML = item.loser;

      winnerContainer.appendChild(winnerHistoryItemTitle);
      winnerContainer.appendChild(winner);

      loserContainer.appendChild(loserHistoryItemTitle);
      loserContainer.appendChild(loser);

      historyItem.appendChild(winnerContainer);
      historyItem.appendChild(loserContainer);

      history.appendChild(historyItem);
    });
  }
}

function restartBoard() {
  let boardItem = document.querySelectorAll(".fullCard");

  let area = document.getElementById("messages");
  let chatItem = document.querySelectorAll(".messages-item");

  boardItem.forEach((element) => {
    element.classList.remove("fullCard");
    element.classList.add("emptyCard");
    element.removeAttribute('data-card');
    element.setAttribute('data-card', '');
  });

  chatItem.forEach((message) => {
    area.removeChild(message);
  });
}

function reloadHistory() {
  let history = document.getElementById("history-container");

  let childs = document.querySelectorAll(".history-item");

  childs.forEach((child) => {
    history.removeChild(child);
  });
}

// * WEB SOCKET SETTINGS

function wsConnect() {
  // webSocket = new WebSocket("ws://192.168.2.12:5000");
  webSocket = new WebSocket("ws://" + window.location.host);

  webSocket.addEventListener("open", (evt) => {
    onOpen(evt);
  });

  webSocket.addEventListener("close", (evt) => {
    onClose(evt);
  });

  webSocket.addEventListener("message", (evt) => {
    onMessage(evt);
  });

  webSocket.addEventListener("error", (evt) => {
    onError(evt);
  });
}

function onOpen(evt) {}

function onClose(evt) {
  alert("Te has deconectado del servidor");
  window.location.reload();
}

function onMessage(evt) {
  let area = document.getElementById("messages");
  let messageContainer = document.createElement("div");

  messageContainer.classList.add("messages-item");
  let data = JSON.parse(evt.data);

  if (data.status == 200) {
    if (data.username == localStorage.getItem("username")) {
      messageContainer.classList.add("me");
    } else {
      messageContainer.classList.add("rival");
    }

    let messageUser = document.createElement("div");
    messageUser.classList.add("message-user");
    messageUser.innerHTML = data.username;

    let messageContent = document.createElement("div");
    messageContent.classList.add("message");
    messageContent.innerHTML = data.message;

    messageContainer.appendChild(messageUser);
    messageContainer.appendChild(messageContent);

    chatScroll();

    area.appendChild(messageContainer);
  } else if (data.status == 210) {
    handleLoadingGame(false);
  
    gameStarted(data, true);
    localStorage.setItem("room", data.room);
    setTimeout(() => {
      document.getElementById("game-set").style.display = "flex";
      gameStarted(data, false);
    }, 5000);
    document.getElementById("player1").innerHTML =
      localStorage.getItem("username") +
      " (" +
      (data.card == "O" ? "X" : "O") +
      ")";
    document.getElementById("player2").innerHTML =
      data.rival + " (" + data.card + ")";
    rivalLoadImages(data);
    localStorage.setItem("rivalInfo", data.card);
    localStorage.setItem("rivalName", data.rival);
    document.getElementById("starting-me").innerHTML =
      localStorage.getItem("username");
    document.getElementById("starting-rival").innerHTML = data.rival;

    if(data.turn){
      document.getElementById("waiting-message").style.display = "none";
    }else{
      document.getElementById("waiting-message").style.display = "flex";
      document.getElementById("waiting-msg").innerHTML = "Es el turno del jugador " + data.rival + " (" + localStorage.getItem('rivalInfo') + ")...";
    }
  } else if (data.status == 220) {
  
    if (data.card == "O") {
      document.getElementById(data.position).src = "./images/o.png";
      document.getElementById(data.position).classList.remove("emptyCard");
      document.getElementById(data.position).classList.add("fullCard");
      document.getElementById(data.position).dataset.card = data.card;
    } else {
      document.getElementById(data.position).src = "./images/x.png";
      document.getElementById(data.position).classList.remove("emptyCard");
      document.getElementById(data.position).classList.add("fullCard");
      document.getElementById(data.position).dataset.card = data.card;
    }

    if(data.turn){
      document.getElementById("waiting-message").style.display = "none";
    }else{
      document.getElementById("waiting-message").style.display = "flex";
      document.getElementById("waiting-msg").innerHTML = "Es el turno del jugador " + localStorage.getItem('rivalName') + " (" + localStorage.getItem('rivalInfo') + ")...";
    }
  } else if (data.status == 225) {
    winnerAndLoser(data);
  } else if (data.status == 230) {
    console.table(data);
    document.getElementById('draw-message').style.display = "flex";
    document.getElementById("waiting-message").style.display = "none";
  } else if (data.status == 285) {
  
    winnerAndLoser(data);
  }
}

function onError(evt) {

}

function doSend(message) {
  webSocket.send(message);
  return message;
}

window.addEventListener("load", init, false);

function chatScroll() {
  let chat = document.getElementById("messages");
  chat.scrollTop = chat.scrollHeight;
}

// document.getElementById("newGame-button").addEventListener("click", () => {
//   let data = JSON.stringify({
//     message: "Buena partida.",
//     status: 205,
//     user: localStorage.getItem("username"),
//     action: "Buscando partida...",
//   });
//   doSend(data);
//   document.getElementById("lobby").style.display = "none";
//   handleLoadingGame(true);
//   setTimeout(() => {
//     handleLoadingGame(false);
//     document.getElementById("game-set").style.display = "flex";
//     chatScroll();
//   }, 2000);
// });

document.getElementById("newGame-button").addEventListener("click", () => {
  let data = JSON.stringify({
    status: 205,
    user: localStorage.getItem("username"),
    action: "Buscando partida...",
  });
  doSend(data);
  document.getElementById("lobby").style.display = "none";
  handleLoadingGame(true);
});

function handleLoadingGame(state) {
  let container = document.getElementById("loading-game");
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

function gameStarted(data, visible) {
  if (visible) {
    document.getElementById("game-started").style.display = "flex";
  } else {
    document.getElementById("game-started").style.display = "none";
  }
}

function rivalLoadImages(data) {
  let table = document.querySelectorAll(".imgBoard");
  table.forEach((element) => {
    if (data.card == "O") {
      element.src = "./images/x.png";
      element.setAttribute('data-card', '');
    } else if (data.card == "X") {
      element.src = "./images/o.png";
      element.setAttribute('data-card', '');
    }
  });
}

function winnerAndLoser(data) {
  document.getElementById('draw-message').style.display = "none";
  if (data.winner) {
    document.getElementById("winner-message").style.display = "flex";
    if(data.message != undefined){
      document.getElementById("winner-msg").innerHTML = data.message;
    }

    document.getElementById("waiting-message").style.display = "none";
    if (localStorage.getItem("history") == null) {
      let historyData = {
        username: localStorage.getItem("username"),
        history: [
          {
            winner: localStorage.getItem("username"),
            loser: data.username,
          },
        ],
      };
      let history = JSON.stringify(historyData);
      localStorage.setItem("history", history);
    } else {
      let h = JSON.parse(localStorage.getItem("history"));
      if (h.username == localStorage.getItem("username")) {
        h.history.push({
          winner: localStorage.getItem("username"),
          loser: data.username,
        });
        localStorage.setItem("history", JSON.stringify(h));
      }
    }
  } else {
    document.getElementById("loser-message").style.display = "flex";

    if (localStorage.getItem("history") == null) {
      let historyData = {
        username: localStorage.getItem("username"),
        history: [
          {
            loser: localStorage.getItem("username"),
            winner: data.username,
          },
        ],
      };
      let history = JSON.stringify(historyData);
      localStorage.setItem("history", history);
    } else {
      let h = JSON.parse(localStorage.getItem("history"));
      if (h.username == localStorage.getItem("username")) {
        h.history.push({
          loser: localStorage.getItem("username"),
          winner: data.username,
        });
        localStorage.setItem("history", JSON.stringify(h));
      }
    }
  }
}
