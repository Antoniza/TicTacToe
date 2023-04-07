const path = require("path");
const express = require("express");
const cors = require("cors");
const { request } = require("http");
const { parse } = require("querystring");

const app = express();
const server = require("http").Server(app);
const WebSocket = require("websocket").server;

app.set("PORT", process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

const webServer = new WebSocket({
  httpServer: server,
  autoAcceptConnections: false,
});

let usersConected = [];
let gameSets = [];

function boardCase(positions) {
  if (positions[0] == positions[1] && positions[0] == positions[2]) {
    if (positions[0] != "") {
      console.log("Win way: " + 1);
      return positions[0];
    } else {
      return 0;
    }
  } else if (positions[3] == positions[4] && positions[3] == positions[5]) {
    if (positions[3] != "") {
      console.log("Win way: " + 2);
      return positions[3];
    } else {
      return 0;
    }
  } else if (positions[6] == positions[7] && positions[6] == positions[8]) {
    if (positions[6] != "") {
      console.log("Win way: " + 3);
      return positions[6];
    } else {
      return 0;
    }
  } else if (positions[0] == positions[3] && positions[0] == positions[6]) {
    if (positions[0] != "") {
      console.log("Win way: " + 4);
      return positions[0];
    } else {
      return 0;
    }
  } else if (positions[1] == positions[4] && positions[1] == positions[7]) {
    if (positions[1] != "") {
      console.log("Win way: " + 5);
      return positions[1];
    } else {
      return 0;
    }
  } else if (positions[2] == positions[5] && positions[2] == positions[8]) {
    if (positions[2] != "") {
      console.log("Win way: " + 6);
      return positions[2];
    } else {
      return 0;
    }
  } else if (positions[0] == positions[4] && positions[0] == positions[8]) {
    if (positions[0] != "") {
      console.log("Win way: " + 7);
      return positions[0];
    } else {
      return 0;
    }
  } else if (positions[2] == positions[4] && positions[2] == positions[6]) {
    if (positions[2] != "") {
      console.log("Win way: " + 8);
      return positions[2];
    } else {
      return 0;
    }
  } else if (
    positions[1] != '' &&
    positions[2] != '' &&
    positions[3] != '' &&
    positions[4] != '' &&
    positions[5] != '' &&
    positions[6] != '' &&
    positions[7] != '' &&
    positions[8] != ''
  ) {
    console.log("Win way: DRAW");
    return 10;
  } else {
    return 0;
  }
}

webServer.on("request", (req) => {
  const connection = req.accept(null, req.origin);

  connection.on("message", (message) => {
    let data = JSON.parse(message.utf8Data);
    console.table(data);

    if (data.status == 201) {
      console.log("New User Conected || " + connection.remoteAddress);
      // usersConected.forEach((user) => {
      //   user.connection.sendUTF(data.username + " se ha unido al juego");
      // });
      usersConected.push({
        id: usersConected.length + 1,
        username: data.username,
        connection: connection,
      });
    } else if (data.status == 200) {
      connection.sendUTF(
        JSON.stringify({
          username: data.user,
          message: data.message,
          status: 200,
        })
      );
      gameSets[parseInt(data.room)].forEach((user) => {
        if (user.connection != undefined && user.connection != connection) {
          user.connection.sendUTF(
            JSON.stringify({
              username: data.user,
              message: data.message,
              status: 200,
            })
          );
        }
      });
    } else if (data.status == 205) {
      if (gameSets.length == 0) {
        gameSets.push([]);
        gameSets[0] = [
          {
            username: data.user,
            connection: connection,
          },
        ];
      } else {
        for (let i = gameSets.length - 1; i < gameSets.length; i++) {
          if (gameSets[i] != null) {
            if (gameSets[i].length == 1) {
              gameSets[i][1] = {
                username: data.user,
                connection: connection,
              };

              gameSets[i][2] = new Date();

              let card = Math.floor(Math.random() * 99);

              gameSets[i][0].connection.sendUTF(
                JSON.stringify({
                  room: i,
                  rival: gameSets[i][1].username,
                  card: card % 2 ? "X" : "O",
                  turn: card % 2 ? false : true,
                  status: 210,
                })
              );
              gameSets[i][1].connection.sendUTF(
                JSON.stringify({
                  room: i,
                  rival: gameSets[i][0].username,
                  card: card % 2 ? "O" : "X",
                  turn: card % 2 ? true : false,
                  status: 210,
                })
              );

              break;
            } else {
              gameSets.push([]);
              gameSets[i + 1] = [
                {
                  username: data.user,
                  connection: connection,
                },
              ];
              break;
            }
          }
        }
      }
      console.log("Salas: ");
      console.table(gameSets);

      console.log("Numero de salas: " + gameSets.length);
    } else if (data.status == 215) {
      console.log(boardCase(data.positions));
      let i = parseInt(data.room);
      for (let j = 0; j < 2; j++) {
        if (gameSets[i][j].connection != connection) {
          gameSets[i][j].connection.sendUTF(
            JSON.stringify({
              room: i,
              card: data.card,
              position: data.position,
              username: data.username,
              turn: true,
              status: 220,
            })
          );
          connection.sendUTF(
            JSON.stringify({
              room: i,
              card: data.card,
              position: data.position,
              turn: false,
              status: 220,
            })
          );
          if (
            boardCase(data.positions) != 0 &&
            boardCase(data.positions) != 10
          ) {
            if (gameSets[i][0].connection == connection) {
              gameSets[i][0].connection.sendUTF(
                JSON.stringify({
                  room: i,
                  cardWinner: boardCase(data.positions),
                  winner: true,
                  username: gameSets[i][1].username,
                  status: 225,
                })
              );
              gameSets[i][1].connection.sendUTF(
                JSON.stringify({
                  room: i,
                  cardWinner: boardCase(data.positions),
                  winner: false,
                  username: gameSets[i][0].username,
                  status: 225,
                })
              );
            } else {
              gameSets[i][0].connection.sendUTF(
                JSON.stringify({
                  room: i,
                  cardWinner: boardCase(data.positions),
                  winner: false,
                  username: gameSets[i][1].username,
                  status: 225,
                })
              );
              gameSets[i][1].connection.sendUTF(
                JSON.stringify({
                  room: i,
                  cardWinner: boardCase(data.positions),
                  winner: true,
                  username: gameSets[i][0].username,
                  status: 225,
                })
              );
            }
          }
          if(boardCase(data.positions) == 10){
            gameSets[i][0].connection.sendUTF(
              JSON.stringify({
                room: i,
                cardWinner: boardCase(data.positions),
                draw: true,
                username: gameSets[i][1].username,
                status: 230,
              })
            );
            gameSets[i][1].connection.sendUTF(
              JSON.stringify({
                room: i,
                cardWinner: boardCase(data.positions),
                draw: true,
                username: gameSets[i][0].username,
                status: 230,
              })
            );
          }
        }
      }
    } else if (data.status == 280) {
      if (data.room != undefined && gameSets[data.room] != null) {
        gameSets[data.room].forEach((user) => {
          if (user.connection != undefined && user.connection != connection) {
            user.connection.sendUTF(
              JSON.stringify({
                username: data.username,
                message:
                  "El jugador " + data.username + " ha abandonado el juego.",
                winner: true,
                status: 285,
              })
            );
          }
        });
        if (gameSets[data.room][0].connection == connection) {
          connection.sendUTF(
            JSON.stringify({
              username: gameSets[data.room][1].username,
              winner: false,
              status: 285,
            })
          );
        } else {
          connection.sendUTF(
            JSON.stringify({
              username: gameSets[data.room][0].username,
              winner: false,
              status: 285,
            })
          );
        }
        // gameSets.splice(data.room, 1);
      }
    }
  });
  connection.on("close", () => {
    let disconnectingUser = "";
    for (let i = 0; i < usersConected.length; i++) {
      if (usersConected[i].connection == connection) {
        disconnectingUser = usersConected[i].username;
        console.log(usersConected[i].username + " leave the game");
        usersConected.splice(i, 1);
        break;
      }
    }
  });
});

server.listen(app.get("PORT"), () => {
  console.log("SERVER ON FIRE IN : " + app.get("PORT"));
});

// app.use('/', () => {

// })
