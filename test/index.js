import * as discord from 'discord.js';

import backup from "../src/index.js"
import path from "path";
import url from "url";
//import fs from "fs";
import data from './backups/1265871133685583872.json' assert { type: 'json' };



const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let backups = `${__dirname}/backups`;
const client = new discord.Client({
  intents: [discord.IntentsBitField.Flags.GuildMessages, discord.IntentsBitField.Flags.Guilds, discord.IntentsBitField.Flags.MessageContent, discord.IntentsBitField.Flags.Guilds],
});

// client.on('ready', async () => {
//   const channel = await client.channels.fetch("1147499631966703736");

//   if (!channel || !channel.isTextBased()) {
//     console.error('Invalid channel provided.');
//     process.exit(1);
//   }
// let guild = await client.guilds.cache.get("1092499647857164379")


// //   client.destroy();
// //   process.exit(0);
// });

 client.on('ready', async () => {


  console.log("mee")

  let gul = client.guilds.cache.get("")
  let gul2 = client.guilds.cache.get("")
  let content;
   // bye bye :(
  //onst backup2 = await backup.clearServer(gul);

  let da = JSON.stringify(data);



  await backup.loadSpace(da, gul);

  process.exit(0);
 // const backup2 = await backup.createSpace(msg.guild, "1174077625879244892");
 })

client.login(""); // You can use whatever method of entering a ID or Token you wish. Aslong as it works. ENV may be recommanded though 
