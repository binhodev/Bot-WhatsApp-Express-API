const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const JsonFileAdapter = require("@bot-whatsapp/database/json");

const flowInitial = addKeyword("hi")
  .addAnswer("Hello 👋!!")
  .addAnswer("Welcome to be assistant 🤖.", { delay: 1200 });

const app = express();
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const main = async () => {
  const adapterDB = new JsonFileAdapter();
  const adapterFlow = createFlow([flowInitial]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  const checkJWT = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.AUTH0_JWKS_URI,
    }),

    audience: process.env.AUTH0_AUDIENCE,
    issuer: process.env.AUTH0_ISSUER,
    algorithms: ["RS256"],
  });

  app.use(bodyParser.json());

  app.use(checkJWT);

  app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
      res.status(401).send("Invalid token!");
    }
  });

  app.post("/sendmessage", async (req, res) => {
    const phone = req.body.phone;
    const message = req.body.message;
    const provider = await adapterProvider.getInstance();

    const response = await provider.sendMessage(`${phone}@s.whatsapp.net`, {
      text: message,
    });

    res.send({ data: response });
  });

  app.listen(8099, () => {
    console.log("API server running...");
  });

  QRPortalWeb();
};

main();
