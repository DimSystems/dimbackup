import * as discord from 'discord.js';

import backup from "dim-backup"


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

 })

client.on("messageCreate", async (msg) => {

 if(msg.guild.id == "1143713023870115891"){
  if(msg.author.id == "1076512386078474240"){

    
    if(msg.content == ">createspace"){
      backup.loadSpace("{\"name\":\"Dim 2\",\"channels\":{\"categories\":[{\"name\":\"memesz\",\"permissions\":[{\"roleName\":\"Goober\",\"allow\":\"1024\",\"deny\":\"0\"}],\"children\":[{\"type\":0,\"name\":\"areugay\",\"nsfw\":false,\"rateLimitPerUser\":0,\"parent\":\"memesz\",\"topic\":null,\"permissions\":[{\"roleName\":\"Goober\",\"allow\":\"1024\",\"deny\":\"0\"}],\"messages\":[{\"username\":\"goofyahhniga\",\"avatar\":\"https://cdn.discordapp.com/avatars/1076512386078474240/746c75728e3e9fbc0aef0af1b03e16a7.webp\",\"content\":\">createspace\",\"embeds\":[],\"files\":[],\"pinned\":false,\"sentAt\":\"2023-10-31T18:44:03.698Z\"},{\"username\":\"goofyahhniga\",\"avatar\":\"https://cdn.discordapp.com/avatars/1076512386078474240/746c75728e3e9fbc0aef0af1b03e16a7.webp\",\"content\":\">createspace\",\"embeds\":[],\"files\":[],\"pinned\":false,\"sentAt\":\"2023-10-31T18:39:17.655Z\"},{\"username\":\"goofyahhniga\",\"avatar\":\"https://cdn.discordapp.com/avatars/1076512386078474240/746c75728e3e9fbc0aef0af1b03e16a7.webp\",\"content\":\">createspace\",\"embeds\":[],\"files\":[],\"pinned\":false,\"sentAt\":\"2023-10-31T18:36:13.549Z\"},{\"username\":\"goofyahhniga\",\"avatar\":\"https://cdn.discordapp.com/avatars/1076512386078474240/746c75728e3e9fbc0aef0af1b03e16a7.webp\",\"content\":\">createspace\",\"embeds\":[],\"files\":[],\"pinned\":false,\"sentAt\":\"2023-10-31T18:34:36.396Z\"},{\"username\":\"goofyahhniga\",\"avatar\":\"https://cdn.discordapp.com/avatars/1168646421885501531/58b773507023ad76e2a592e761bd96b8.webp\",\"content\":\":wave: Hey @goofyahhniga!  \\n Welcome to **memesz**! \\n > Go check around this place, I'm sure there is alot to explore!\",\"embeds\":[],\"files\":[],\"pinned\":false,\"sentAt\":\"2023-10-30T20:23:39.773Z\"},{\"username\":\"goofyahhniga\",\"avatar\":\"https://cdn.discordapp.com/avatars/1168646213076254792/58b773507023ad76e2a592e761bd96b8.webp\",\"content\":\":pensive: Sad @goofyahhniga! Left **memesz**! \\n > Oh well, see you next time!\",\"embeds\":[],\"files\":[],\"pinned\":false,\"sentAt\":\"2023-10-30T20:22:49.964Z\"}],\"isNews\":false,\"threads\":[],\"oldId\":\"1168646021090398270\"}]}],\"others\":[]},\"id\":\"1168984794135007232\"}", msg.guild).then((db) => {
        client.destroy('works')
        process.exit(0)
  
      })
    }
      
  }
  
    
 } 


    
})


client.login(""); // You can use whatever method of entering a ID or Token you wish. Aslong as it works. ENV may be recommanded though 
