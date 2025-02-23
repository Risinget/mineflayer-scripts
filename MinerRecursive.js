const mineflayer = require("mineflayer");
const {
  pathfinder,
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");
const config = require("./config.json");

const bot = mineflayer.createBot(config);
const mcData = require("minecraft-data")(bot.version);

bot.loadPlugin(pathfinder);
let isMining = false; // Controla si el bot debe seguir minando

bot.on("chat", (username, message) => {
  if (message === "start") {
    isMining = true; // Permite que el bot comience o continúe minando
    findAndMineDiamonds();
  } else if (message === "stop") {
    isMining = false; // Detiene el proceso de minería
    bot.pathfinder.stop(); // Detiene el movimiento actual del bot
  }
});


let minedDiamonds = 0; // Contador global para los diamantes minados

function findAndMineDiamonds() {
    if (!isMining) {
    console.log("Minería detenida por el usuario.");
    return; // Salir si la minería ha sido detenida
    }



  if (minedDiamonds >= 64) {
    console.log("Objetivo alcanzado: 64 diamantes minados.");
    isMining = false; // Opcional: Detiene automáticamente la minería al alcanzar el objetivo
    return;
  }

  const diamondOreId = mcData.blocksByName.ancient_debris.id;
  const target = bot.findBlock({
    matching: diamondOreId,
    maxDistance: 125,
  });

  if (target) {
    const goal = new GoalNear(
      target.position.x,
      target.position.y,
      target.position.z,
      1
    );
    bot.pathfinder.setGoal(goal);

    bot.once("goal_reached", async () => {
      const bestTool = await bot.pathfinder.bestHarvestTool(target);
      if (bestTool) {
        await bot.equip(bestTool, "hand");
      }

      await bot.dig(target); // Usa await para asegurar que se complete el picado
      console.log("Mined a diamond ore.");
      minedDiamonds += 1; // Incrementa el contador de diamantes minados
      console.log(`Total de diamantes minados: ${minedDiamonds}`);

      findAndMineDiamonds(); // Llama recursivamente para buscar y minar el siguiente diamante
    });
  } else {
    console.log("No diamond ore found within range. Trying again...");
    setTimeout(findAndMineDiamonds, 1000); // Espera 1 segundo antes de intentar nuevamente
  }
}