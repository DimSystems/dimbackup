# Dim Discord Bot's Open Sourrce Backup system
**Available and free for anybody to use on their discord bot**
Originally forked from [OutwalkStudios discord-backup](https://github.com/OutwalkStudios/discord-backup)

You can check that repository to learn more information regarding the backbone of this backup system. What it has rather than the original!

 it backups spaces (catagory only) and has been support for Forums, Stages (sort of) & some other stuff too

 how to use

 ```js
import backup from "dimbackup"

 client.on('ready', async () => {


  console.log("mee")

  let gul = client.guilds.cache.get("")
  let gul2 = client.guilds.cache.get("")
  let content;
   // you can also use the original create BUUT i haven't tested it yet.
const backup2 = await backup.createSpace(gui, "CategoryId")
  
  await backup.loadSpace(backup2, gul);

  // its as simple as that, just let dim backup do all the work and sit and relax while its restoring or creating a new backup

  process.exit(0);
 // ;
 })

client.login(""); // You can use whatever method of entering a ID or Token you wish. Aslong as it works. ENV may be recommanded though 

```

Why does dim backup exist?
- To make dim much more gym packed but to prevent raiding or harassement to members in a space (Which can be prevented with the easy to use space punishments). You can get a quick backup and you would come back from scratch

That's all

Want to visit our github page, [here](https://github.com/DimSystems/dimbackup)
changelog:
- bugfixes