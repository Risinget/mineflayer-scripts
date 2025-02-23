const mineflayer = require('mineflayer');
const config = require('./config.json');
// Crea un bot con las opciones de configuración.
const bot = mineflayer.createBot(config);

// Escucha el evento de chat y muestra los mensajes en consola.
bot.on('chat', (username, message) => {
  console.log(`${username}: ${message}`);
});
bot.on("message", (message) => {
  console.log(message.toAnsi());
});
// Permite escribir mensajes desde la consola y enviarlos al chat del servidor.
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
  bot.chat(line);
});
