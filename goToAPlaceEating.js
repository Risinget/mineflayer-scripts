const mineflayer = require("mineflayer");
const {
  pathfinder,
  Movements,
  goals: { GoalBlock },
} = require("mineflayer-pathfinder");
const moment = require('moment'); // Asegúrate de tener 'moment' instalado para manejar fechas y horas
const config = require("./config.json");

const bot = mineflayer.createBot(config);

bot.loadPlugin(pathfinder);

bot.once("spawn", () => {
  // Configura los movimientos basados en el mundo cargado
  const mcData = require("minecraft-data")(bot.version);
  const defaultMove = new Movements(bot, mcData);
  bot.pathfinder.setMovements(defaultMove);
});


bot.on('health', ()=>{
    console.log("mI vida: " + bot.health);
    console.log('mI cOMIDA: '+bot.food);


 if (bot.food < 14)
 {
   eatFood()
     .then(() => {
       setTimeout(checkHunger, 1000); // Revisa de nuevo después de comer
     })
     .catch((err) => {
       console.error("Error comiendo: ", err);
       setTimeout(checkHunger, 1000); // Intenta de nuevo si hubo un error
     });
 } else {
   setTimeout(checkHunger, 1000); // Sigue revisando el hambre cada segundo
 }
 
})


let lastGoal = null; // Variable para almacenar el último objetivo

bot.on("chat", (username, message) => {
  if (message.startsWith("goto ")) {
    const [_, x, y, z] = message.split(" ").map((v) => parseInt(v, 10));
    lastGoal = new GoalBlock(x, y, z); // Almacena el objetivo actual antes de moverse

    // Inicia el seguimiento del tiempo
    startTime = Date.now();
    bot.pathfinder.setGoal(lastGoal);
    checkHunger(); // Comienza la comprobación de hambre
  }
});

// Modificar la función eatFood para imprimir el mensaje cada vez que se invoca
async function eatFood() {
  const foodItem = bot.inventory.items().find((item) => item.name.includes('enchanted_golden_apple'));
  if (foodItem) {
    try {
      await bot.equip(foodItem, "hand");

      // Detiene el bot y guarda el objetivo actual si está en movimiento
      if (bot.pathfinder.isMoving()) {
        bot.pathfinder.setGoal(null);
      }

      await bot.consume();

      // Restablece el último objetivo almacenado para que el bot continúe su camino
      if (lastGoal) {
        bot.pathfinder.setGoal(lastGoal);
        // Si startTime es null, significa que el bot no está en camino a un objetivo
        if (startTime === null) {
          startTime = Date.now(); // Reinicia el contador de tiempo
        }
      }
    } catch (err) {
      console.log(`Error al comer: ${err.message}`);
    }
  }
}
function checkHunger() {
  if (
    bot.food < 20)
  {
    eatFood()
      .then(() => {
        setTimeout(checkHunger, 1000); // Revisa de nuevo después de comer
      })
      .catch((err) => {
        console.error("Error comiendo: ", err);
        setTimeout(checkHunger, 1000); // Intenta de nuevo si hubo un error
      });
  } else {
    setTimeout(checkHunger, 1000); // Sigue revisando el hambre cada segundo
  }
}

bot.on("goal_reached", (goal) => {
  const totalTime = (Date.now() - startTime) / 1000; // Tiempo total en segundos
  console.log(
    `[${moment().format("HH:mm:ss")}] ${goal.x}, ${goal.y}, ${
      goal.z
    } Tiempo Total: ${totalTime.toFixed(2)} segundos`
  );
  startTime = null; // Resetea el tiempo de inicio para el próximo objetivo
});


