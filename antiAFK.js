const mineflayer = require("mineflayer");
const config = require("./config.json");
// Configura aquí los detalles de tu bot
const bot = mineflayer.createBot(config)

// El bot ha entrado al servidor
bot.once("spawn", () => {
  console.log("El bot ha entrado al servidor.");

  // Función para realizar una acción simple y evitar el AFK
  const antiAFK = () => {
    // Hace que el bot rote ligeramente para evitar ser detectado como AFK
    let yaw = bot.entity.yaw + Math.PI / 4;
    let pitch = bot.entity.pitch + Math.PI / 4;
    bot.look(yaw, pitch, false);

    // O podrías hacer que el bot se mueva ligeramente
    // bot.setControlState('forward', true);
    // setTimeout(() => bot.setControlState('forward', false), 1000);

    console.log("Realizando acción anti-AFK.");
  };

  // Ejecutar la función antiAFK cada 10 minutos
  setInterval(antiAFK, 1000 * 10 * 1);
});

// Manejo de errores
bot.on("error", (err) => console.log(err));
