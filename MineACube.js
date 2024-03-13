const mineflayer = require("mineflayer");
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const { GoalNear } = require("mineflayer-pathfinder").goals;
const Vec3 = require("vec3");

const bot = mineflayer.createBot({
  host: "172.233.188.131",
  port: 25567,
  username: "username1234",
});

bot.loadPlugin(pathfinder);

bot.once("spawn", () => {
  const mcData = require("minecraft-data")(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  const start = new Vec3(351, 134, -337);
  const end = new Vec3(336, -59, -352);

  mineArea(start, end).then(() => {
    console.log("Área minada completamente.");
  });
});

async function mineArea(start, end) {
  // Asegurarse de que el inicio es menor que el fin para cada coordenada
  let minX = Math.min(start.x, end.x),
    maxX = Math.max(start.x, end.x),
    minY = Math.min(start.y, end.y),
    maxY = Math.max(start.y, end.y),
    minZ = Math.min(start.z, end.z),
    maxZ = Math.max(start.z, end.z);

  for (let y = maxY; y >= minY; y--) {
    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        const blockPos = new Vec3(x, y, z);
        await moveToBlock(blockPos);
        const block = bot.blockAt(blockPos);
        if (block && bot.canDigBlock(block)) {
          const bestTool = await bot.pathfinder.bestHarvestTool(block);
          if (bestTool) {
            await bot.equip(bestTool, "hand");
          }
          try {
            await bot.dig(block);
            console.log(
              `Bloque en ${blockPos} picado con ${
                bestTool ? bestTool.name : "sin herramienta"
              }.`
            );
          } catch (error) {
            console.log(`Error al picar bloque en ${blockPos}: ${error}`);
          }
        }
      }
    }
  }
}

async function moveToBlock(pos) {
  const goal = new GoalNear(pos.x, pos.y, pos.z, 1);
  await bot.pathfinder.goto(goal);
}
