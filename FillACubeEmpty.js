const mineflayer = require("mineflayer");
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const { GoalNear } = require("mineflayer-pathfinder").goals;
const Vec3 = require("vec3");
const config = require("./config.json");

const bot = mineflayer.createBot(config);

bot.loadPlugin(pathfinder);

bot.once("spawn", async () => {
  const mcData = require("minecraft-data")(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);
// Para mejorar picar 3x3
//   const start = new Vec3(343, 131, -331);
//   const end = new Vec3(348, 134, -328);

    // const start = new Vec3(348 ,150, -282);
    // const end = new Vec3(341, 153, -284);

     const start = new Vec3(-248, 115, -68);
     const end = new Vec3( -258, 114, -75);

  const blockName = "stone";
  const blockToPlace = bot.inventory
    .items()
    .find((item) => item.name === blockName);

  if (!blockToPlace) {
    console.log(
      `No se encontraron bloques de '${blockName}' en el inventario.`
    );
    return;
  }

  await bot.equip(blockToPlace, "hand");

  for (let y = start.y; y <= end.y; y++) {
    for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
      for (
        let z = Math.min(start.z, end.z);
        z <= Math.max(start.z, end.z);
        z++
      ) {
        const blockPos = new Vec3(x, y, z);
        await placeBlockAt(blockPos, y === end.y);
      }
    }
  }
  console.log("Área llenada completamente.");
});

async function placeBlockAt(pos, isLastLayer) {
  const maxRetries = 3; // Máximo número de reintentos después de un error de timeout
  const retryInterval = 100; // Tiempo de espera antes de reintentar en milisegundos

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Verifica si tiene bloques de piedra y los equipa si es necesario
      const blockToPlace = bot.inventory
        .items()
        .find((item) => item.name === "stone");
      if (!blockToPlace) {
        console.log(
          "No quedan bloques de 'stone' en el inventario para colocar."
        );
        return;
      }
      if (bot.heldItem === null || bot.heldItem.name !== blockToPlace.name) {
        await bot.equip(blockToPlace, "hand");
      }

      // Obtiene la posición del bot y calcula si necesita moverse o colocar el bloque directamente
      const blockBelow = bot.blockAt(pos.offset(0, -1, 0));
      const botPosition = bot.entity.position.floored();

      if (botPosition.equals(pos)) {
        // El bot está encima del bloque objetivo, debe saltar para colocar el bloque
        bot.setControlState("jump", true);
        await bot.waitForTicks(5);
        await bot.placeBlock(blockBelow, new Vec3(0, 1, 0));
        bot.setControlState("jump", false);
        console.log(`Bloque colocado mientras saltaba en ${pos}`);
        return;
      } else {
        // Mover al bot al lado del bloque objetivo
        const sidePos = findSidePosition(pos);
        await bot.pathfinder.goto(
          new GoalNear(sidePos.x, sidePos.y, sidePos.z, 1)
        );
        await bot.placeBlock(blockBelow, new Vec3(0, 1, 0));
        console.log(`Bloque colocado en ${pos}`);
        return;
      }
    } catch (error) {
      console.error(
        `Intento ${attempt + 1}: Error al colocar el bloque en ${pos}: ${error}`
      );
      if (attempt < maxRetries - 1) {
        console.log(`Reintentando en ${retryInterval}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
        // No hace 'return' para que el bucle pueda continuar y hacer otro intento
      } else {
        // Si se alcanza el número máximo de intentos, se sale de la función
        console.error(
          `No se pudo colocar el bloque después de ${maxRetries} intentos.`
        );
        return;
      }
    }
  }
}


function findSidePosition(pos) {
  const offsets = [
    new Vec3(1, 0, 0),
    new Vec3(-1, 0, 0),
    new Vec3(0, 0, 1),
    new Vec3(0, 0, -1),
  ];

  for (const offset of offsets) {
    const checkPos = pos.plus(offset);
    if (canStandAt(checkPos)) {
      return checkPos;
    }
  }
  // Por defecto, devuelve una posición al lado en el eje X
  return pos.plus(new Vec3(1, 0, 0));
}

function canStandAt(pos) {
  const blockAtPos = bot.blockAt(pos);
  const blockBelowPos = bot.blockAt(pos.offset(0, -1, 0));
  return (
    blockAtPos &&
    blockBelowPos &&
    blockAtPos.boundingBox === "empty" &&
    blockBelowPos.boundingBox === "block"
  );
}

async function moveToPosition(pos) {
  const goal = new GoalNear(pos.x, pos.y, pos.z, 1);
  await bot.pathfinder.goto(goal);
}