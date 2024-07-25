import * as discord from "discord.js";
import backup from "../src/index.js";

const client = new discord.Client({
    intents: [discord.IntentsBitField.Flags.GuildMessages, discord.IntentsBitField.Flags.Guilds, discord.IntentsBitField.Flags.MessageContent, discord.IntentsBitField.Flags.Guilds],
});

client.on("ready", async () => {
    console.log("Client Ready, starting process:");
    let gul2 = client.guilds.cache.get("");

    await backup.createSpace(gul2, "").then(async (ba) => {
        console.log("Creation Done :D");
        await backup.loadSpace(ba, gul2).then(() => {
            console.log("Loading Done :D");
            process.exit(0);
        });
  
    });

});


client.login(""); // You can use whatever method of entering a ID or Token you wish. Aslong as it works. ENV may be recommanded though 
