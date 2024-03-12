const mineflayer = require("mineflayer");
const Vec3 = require('vec3')


let entityTrackName = 'zombie' //This word in lowercase ensure
let radiusToDetect = 5 //Default and bypass any suspicious
const bot = mineflayer.createBot({
  host: "172.233.188.131",
  port: 25567,
  username: "username1234",
});



bot.once("physicsTick", () => {
  console.log("Bot conectado y listo para la acción!");
  attackNearestZombie();
});

function equipBestSword() {
  // find swords in the inventory with 'sword'
  const swords = bot.inventory
    .items()
    .filter((item) => item.name.includes("sword"));

    // order by damage
  swords.sort((a, b) => {
    const getDamage = (item) => {
      // here for determine the best sword for future 
      return 0; // return default 0, and really it doest affect nothing
    };

    return getDamage(b) - getDamage(a);
  });

  if (swords.length > 0) {
    const bestSword = swords[0];
    bot.equip(bestSword, "hand", (err) => {
      if (err) {
        console.log("Error al equipar la espada:", err);
      } else {
        console.log("Espada equipada:", bestSword.name);
      }
    });
  } else {
    console.log("No se encontraron espadas en el inventario.");
  }
}

function attack(entiy){

      bot.attack(entiy);

}

function attackNearestZombie() {
  const intervalId = setInterval(() => {
    equipBestSword(); // ensure for equip best Sword


    const entityToTrack = bot.nearestEntity((entity) => {
    return (
        entity.name.toLowerCase() == entityTrackName &&
        entity.position.distanceTo(bot.entity.position) <= radiusToDetect
    ); // track entity name and && only radius default i recommend 5 
    });

    if (entityToTrack) {
      const entityToTrackPosition = new Vec3(
        entityToTrack.position.x,
        entityToTrack.position.y,
        entityToTrack.position.z
      );
      
      console.log(`There is an ${entityToTrack} nearby. I am attacking it`);
      bot.lookAt(entityToTrackPosition.offset(0, entityToTrack.height, 0), true, attack(entityToTrack));
    } else {
      console.log(`There is no ${entityToTrack} nearby.`);
    }
  }, 1000); // Repeat every second 
}
