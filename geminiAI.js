const mineflayer = require("mineflayer");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
require("dotenv/config");
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);


const config = require("./config.json");

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function chatAi(prompt) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Dame un comando para generar un cubo vacio en minecraft 5x5 de piedra, en texto plano sin nada adicional. ",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "`/fill ~-2 ~-2 ~-2 ~2 ~2 ~2 minecraft:stone hollow`\\n",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Dame un comando para generar un cubo vacio en minecraft 5x5 de piedra, en texto plano sin nada adicional.\\n\\ny también responderas preguntas según lo debido al usuario que pregunte. sin comillas ni nada de formatos MARKDOWN...",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "/fill ~-2 ~-2 ~-2 ~2 ~2 ~2 minecraft:stone hollow\\n",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "cuando se creo youtube, siempre responde muy resumido y directo, tampoco tan seco, siempre responde muy informativo sin con algunas palabras extra, por ejemplo: Youtube se creo en 2005 en fecha tal. por el creador xxxx.",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "YouTube se creó el 14 de febrero de 2005 por Chad Hurley, Steve Chen y Jawed Karim.\\n",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "para que sirve chatgpt",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "ChatGPT sirve para generar texto, traducir idiomas, escribir diferentes tipos de contenido creativo y responder preguntas de manera informativa.\\n",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Que es tunned model",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Un tuned model (modelo afinado)  es un modelo de lenguaje grande (como GPT) que ha sido entrenado adicionalmente en un conjunto de datos específico para mejorar su rendimiento en una tarea o dominio particular.  En esencia, se toma un modelo pre-entrenado y se le da un entrenamiento extra para que se especialice en algo.\\n",
          },
        ],
      },
    ],
  });
  const result = await chatSession.sendMessage(prompt);
  return result.response.text();
}

const bot = mineflayer.createBot(config);

bot.on("spawn", async () => {
  console.log("Bot has spawned");
});

bot.on("chat", async (username, message) => {
  console.log(`[${username}] ${message}`);
  if (message.startsWith("gemini")) 
  {
    bot.chat(await chatAi(message.replace("gemini", "")));
  }
});
bot.on("whisper", async (username, message) => {
  console.log(`[${username}] ${message}`);

  if (message.startsWith("gemini")) {
    let response = await chatAi(message.replace("gemini", "").trim());
    console.log(response);

    let msgFinal =
      "/msg " + username + " " + sanitizeMessage(truncateMessage(response));
    console.log(msgFinal);

    bot.chat(msgFinal);
  }
});

function truncateMessage(message, maxLength = 256) {
  return message.length > maxLength ? message.substring(0, maxLength) : message;
}
function sanitizeMessage(message) {
  // Permite caracteres ASCII imprimibles y vocales tildadas
  return message.replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑ]/g, "");
}

// final [18:24:06] [Server thread/INFO]: RisingetT3Q lost connection: Illegal characters in chat