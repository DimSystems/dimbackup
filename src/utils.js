import {
    ChannelType,
    GuildFeature,
    GuildDefaultMessageNotifications,
    GuildExplicitContentFilter,
    GuildVerificationLevel,
    GuildSystemChannelFlags,
    OverwriteType,
    GuildPremiumTier
} from "discord.js";
import axios from "axios";

const MAX_BITRATE_PER_TIER = {
    [GuildPremiumTier.None]: 64000,
    [GuildPremiumTier.Tier1]: 128000,
    [GuildPremiumTier.Tier2]: 256000,
    [GuildPremiumTier.Tier3]: 384000
};

/* gets the permissions for a channel */
export function fetchChannelPermissions(channel) {
    const permissions = [];

    channel.permissionOverwrites.cache
        .filter((permission) => permission.type == OverwriteType.Role)
        .forEach((permission) => {
            const role = channel.guild.roles.cache.get(permission.id);
            if (role) {
                permissions.push({
                    roleName: role.name,
                    allow: permission.allow.bitfield.toString(),
                    deny: permission.deny.bitfield.toString()
                });
            }
        });

    return permissions;
}

/* fetches the voice channel data that is necessary for the backup */
export function fetchVoiceChannelData(channel) {
    return {
        type: channel.type,
        name: channel.name,
        bitrate: channel.bitrate,
        userLimit: channel.userLimit,
        parent: channel.parent ? channel.parent.name : null,
        permissions: fetchChannelPermissions(channel)
    };
}

export async function getThreadStuff(channel, options, limiter){
    const fullThreadD = [];
    const fetchOptions = {parentId: channel.id};
    let isDone = false;

    const threadCount = isNaN(options.maxThreadsPerChannel) ? 10 : options.maxThreadsPerChannel;
    let lasttid;
    let isnolast;
   
    //const fetched = await limiter.schedule({ id: `getThreadStuff::channel.threads.fetch::${channel.id}` }, async () => await channel.threads.fetch(fetchOptions));
      
//console.log(channel);

   // const activeThreads = await channel.threads.fetchActive();
    // Fetch archived threads
    //const archivedThreads = await channel.threads.fetchArchived();

    // Combine active and archived threads
    //const allThreads = await channel.threads.fetch(fetchOptions);

    //console.log(allThreads)
   // if(allThreads.length == 0) return fullThreadD;
       // lasttid = fetched.threads.last().id;
      // console.log(allThreads); 

     // console.log(channel.threads.cache);

     if(channel.threads.cache.size == 0) return [];

       await Promise.all(channel.threads.cache.map(async (thread) => {

        if(fullThreadD.find(x => x.name == thread.name)){
            return;
        }

            if (fullThreadD.length == channel.threads.cache.size) {
                isDone = true;
                return;
            }

            const threadData = {
                type: thread.type,
                name: thread.name,
                tags: [],
                messages: [],
                id: thread.id,
                //emoji: thread.defaultReactionEmoji,
                //sort: thread.defaultSortOrder,
                archived: thread.archived,
                autoArchiveDuration: thread.autoArchiveDuration,
                locked: thread.locked,
                rateLimitPerUser: thread.rateLimitPerUser,
         
            };

            //console.log(thread.appliedTags)
           
            thread.appliedTags.length > 0 ? thread.appliedTags.forEach(async (tag) => {
               // const tagData = tag;
    
                const tagD = channel.availableTags.find(t => t.id === tag);

                if(tagD !== null){

                const tagM = {
                    name: tagD.name,
                    emoji: tagD.emoji,
                    //mod: tagD.name,
                };

                threadData.tags.push(tagM);
                }
            }) : 0;
      
            try {
                threadData.messages = await fetchChannelMessages(thread, options, limiter);
            } catch {
            }
           // console.log(threadData);
            fullThreadD.push(threadData)
        }))
    
       // console.log(fullThreadD);
    return fullThreadD;
}
/* fetches the messages from a channel */
export async function fetchChannelMessages(channel, options, limiter) {
    const messages = [];

    const messageCount = isNaN(options.maxMessagesPerChannel) ? 10 : options.maxMessagesPerChannel;
    const fetchOptions = { limit: 100 };

    let lastMessageId;
    let fetchComplete = false;

    while (!fetchComplete) {
        if (lastMessageId) fetchOptions.before = lastMessageId;

        const fetched = await limiter.schedule({ id: `fetchChannelMessages::channel.messages.fetch::${channel.id}` }, () => channel.messages.fetch(fetchOptions));
        if (fetched.size == 0) break;

        if(fetched.size !== 1){
        lastMessageId = fetched.last().id;
        }

        await Promise.all(fetched.map(async (message) => {
            if (!message.author || messages.length >= messageCount) {
                fetchComplete = true;
                return;
            }

            /* dont save messages that are too long */
            if (message.cleanContent.length > 2000) return;

            const files = await Promise.all(message.attachments.map(async (attachment) => {
                if (attachment.url && ["png", "jpg", "jpeg", "jpe", "jif", "jfif", "jfi"].includes(attachment.url.split(".").pop())) {
                    if (options.saveImages && options.saveImages == "base64") {
                        const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
                        const buffer = Buffer.from(response.data, "binary").toString("base64");

                        return { name: attachment.name, attachment: buffer };
                    }
                }

                return { name: attachment.name, attachment: attachment.url };
            }));

            messages.push({
                username: message.author.username,
                avatar: message.author.displayAvatarURL(),
                content: message.cleanContent,
                embeds: message.embeds,
                files: files,
                pinned: message.pinned,
                sentAt: message.createdAt.toISOString()
            });
        }));
    }

    return messages;
}

// export async function fetchForumData(channel, options, limiter){
//     const channelData = {
//         name: channel.name,
//         guidelines: channel
//         permissions: fetchChannelPermissions(channel),
//         messages: [],
//         topic: channel.topic,
//         threads: [],
    
//     };

// }

/* fetches the text channel data that is necessary for the backup */
export async function fetchTextChannelData(channel, options, limiter) {
    const channelData = {
        type: channel.type,
        name: channel.name,
        nsfw: channel.nsfw,
        rateLimitPerUser: channel.type !== ChannelType.GuildVoice || channel.type !== ChannelType.GuildStageVoice ? channel.rateLimitPerUser : undefined,
        parent: channel.parent ? channel.parent.name : null,
        topic: channel.topic,
        permissions: fetchChannelPermissions(channel),
        messages: [],
        isNews: channel.type == ChannelType.GuildNews,
        threads: [],
        tags: [],
        defaultEmoji: channel.type == ChannelType.GuildForum ? channel.defaultReactionEmoji : "NULL",
        autoarchived: channel.defaultAutoArchiveDuration,
        formlayout: channel.defaultForumLayout,
        sortorder: channel.defaultSortOrder,
        threadslomo: channel.defaultThreadRateLimitPerUser,
        //slomo: channel.rateLimitPerUser
    };

   if(channel.type == ChannelType.GuildForum){ 

    channel.availableTags.length > 0 ? channel.availableTags.forEach(async (tag) => {
            const tagData = {
                emoji: tag.emoji,
                name: tag.name,
                moderated: tag.moderated
            } 

            channelData.tags.push(tagData);
        }) : 0;
   }

//    const activeThreads = await channel.threads.fetchActive();
//    // Fetch archived threads
//    const archivedThreads = await channel.threads.fetchArchived();

   channelData.threads = await getThreadStuff(channel, options, limiter);

    try {
        if(channel.type !== ChannelType.GuildForum){
        channelData.messages = await fetchChannelMessages(channel, options, limiter);
        }
        //channel.type == ChannelType.GuildForum ? console.log(channelData) : 0;
        return channelData;
    } catch {
        return channelData;
    }
}

/* creates a category for the guild */
export async function loadCategory(categoryData, guild, limiter) {
    const category = await limiter.schedule({ id: `loadCategory::guild.channels.create::${categoryData.name}` }, () => guild.channels.create({ name: categoryData.name, type: ChannelType.GuildCategory }));
    const finalPermissions = [];

    categoryData.permissions.forEach((permission) => {
        const role = guild.roles.cache.find((role) => role.name == permission.roleName);
        if (role) {
            finalPermissions.push({
                id: role.id,
                allow: BigInt(permission.allow),
                deny: BigInt(permission.deny)
            });
        }
    });

    await limiter.schedule({ id: `loadCategory::category.permissionOverwrites.set::${category.name}` }, () => category.permissionOverwrites.set(finalPermissions));
    return category;
}

/* creates a channel and returns it */
export async function loadChannel(channelData, guild, category, options, limiter) {

    const loadMessages = async (channel, messages, previousWebhook) => {
        const webhook = previousWebhook || await limiter.schedule({ id: `loadMessages::channel.createWebhook::${channel.name}` }, () => channel.createWebhook({ name: "MessagesBackup", avatar: channel.client.user.displayAvatarURL() }));
        if (!webhook) return;

        messages = messages.filter((message) => (message.content.length > 0 || message.embeds.length > 0 || message.files.length > 0)).reverse();
        messages = messages.slice(messages.length - options.maxMessagesPerChannel);

        for (let message of messages) {
            if (message.content.length > 2000) continue;
            try {
                const sent = await limiter.schedule({ id: `loadMessages::webhook.send::${channel.name}` }, () => webhook.send({
                    content: message.content.length ? message.content : undefined,
                    username: message.username,
                    avatarURL: message.avatar,
                    embeds: message.embeds,
                    files: message.files,
                    allowedMentions: options.allowedMentions,
                    threadId: channel.isThread() ? channel.id : undefined
                }));

                if (message.pinned && sent) await limiter.schedule({ id: `loadMessages::sent.pin::${channel.name}` }, () => sent.pin());
            } catch (error) {
                /* ignore errors where it request entity is too large */
                if (error.message == "Request entity too large") return;
                console.error(error);
            }
        }

        return webhook;
    }; 

    const nocomarray = [ChannelType.GuildVoice, ChannelType.GuildText];

    if(!nocomarray.includes(channelData.type) && !guild.features?.includes('COMMUNITY')){
        console.warn("Your serrver doesn't have community! Basically only voice & text only")
        channelData.ftype = channelData.type;
        channelData.type == ChannelType.GuildStageVoice ? channelData.type = ChannelType.GuildVoice : 
        channelData.type = ChannelType.GuildText;
    }

    const createOptions = { name: channelData.name, type: null, parent: category, ftype: null };
    //createOptions.rateLimitPerUser = channelData.slomo;

    if (channelData.type == ChannelType.GuildText || channelData.type == ChannelType.GuildNews) {
        createOptions.topic = channelData.topic;
        createOptions.nsfw = channelData.nsfw;
        createOptions.rateLimitPerUser = channelData.rateLimitPerUser;
        createOptions.type = channelData.isNews && guild.features.includes(GuildFeature.News) ? ChannelType.GuildNews : ChannelType.GuildText;
    }
    else if (channelData.type == ChannelType.GuildForum){
       // console.log(channelData.defaultEmoji)
        createOptions.rateLimitPerUser = channelData.rateLimitPerUser;
        createOptions.topic = channelData.topic;
        createOptions.type = ChannelType.GuildForum;
        createOptions.nsfw = channelData.nsfw;
        createOptions.defaultThreadRateLimitPerUser = channelData.threadslomo;
        createOptions.defaultSortOrder = channelData.sortorder;
        createOptions.defaultReactionEmoji = channelData.defaultEmoji;
        createOptions.defaultForumLayout = channelData.formlayout;
        createOptions.defaultAutoArchiveDuration = channelData.autoarchived;
        createOptions.availableTags = channelData.tags;
    }

    else if (channelData.type == ChannelType.GuildVoice) {
        let bitrate = channelData.bitrate;
        const bitrates = Object.values(MAX_BITRATE_PER_TIER);

        while (bitrate > MAX_BITRATE_PER_TIER[guild.premiumTier]) {
            bitrate = bitrates[guild.premiumTier];
        }

        createOptions.bitrate = bitrate;
        
        !createOptions.ftype == ChannelType.GuildStageVoice ? createOptions.userLimit = channelData.userLimit :
        createOptions.userLimit = 99;
        createOptions.type = ChannelType.GuildVoice;
    } else if(channelData.type == ChannelType.GuildStageVoice) {
        let bitrate = channelData.bitrate;
        const bitrates = Object.values(MAX_BITRATE_PER_TIER);

        while (bitrate > MAX_BITRATE_PER_TIER[guild.premiumTier]) {
            bitrate = bitrates[guild.premiumTier];
        }

        createOptions.bitrate = bitrate;
        if(channelData.userLimit > 99){
            console.warn("Your user limit YES even on stage mode can't work, since discord doesn't allow us to make it higher, you may have to increase manually in channel settings.");
        }
        createOptions.userLimit = 99;
        createOptions.type = ChannelType.GuildStageVoice;
    }

    // add channel tag


    const channel = await limiter.schedule({ id: `loadChannel::guild.channels.create::${channelData.name}` }, () => guild.channels.create(createOptions));
    const finalPermissions = [];

    channelData.permissions.forEach((permission) => {
        const role = guild.roles.cache.find((role) => role.name == permission.roleName);
        if (role) {
            finalPermissions.push({
                id: role.id,
                allow: BigInt(permission.allow),
                deny: BigInt(permission.deny)
            });
        }
    });

    await limiter.schedule({ id: `loadChannel::channel.permissionOverwrites.set::${channel.name}` }, () => channel.permissionOverwrites.set(finalPermissions));


    // if(channelData.type == ChannelType.GuildForum){
    //    // channel.setRateLimitPerUser(channelData.threadslomo);
    // }

    if (channelData.type == ChannelType.GuildText || channelData.type == ChannelType.GuildForum) {
        let webhook;
        let e = []
    
        // transitioningn from guild forum to text
        if(channelData.ftype == ChannelType.GuildForum){
            channel.send("# WARNING | Your server kinda has no community and we are trying to backup a forum! Don't worry, we will create threads and leave it as it is. We can not control community so its rceommanded to turn it on and load this again");
        } else {

        if (channelData.messages.length > 0) {
            webhook = await loadMessages(channel, channelData.messages);
        }
    }
        

        if (channelData.threads.length > 0) {
           // console.log(channelData.threads);
            channelData.threads.forEach(async (threadData) => {



                if(channelData.type == ChannelType.GuildForum){
                webhook = await limiter.schedule({ id: `loadMessages::channel.createWebhook::${channel.name}` }, () => channel.createWebhook({ name: "MessagesBackup", avatar: channel.client.user.displayAvatarURL() }));
                 if (!webhook) return;
                let edMsg = threadData.messages[threadData.messages.length-1];
                //console.log(edMsg);
                edMsg.content = `This thread has been backed up by Dim | This message was from ${edMsg.username}! Here is the starting message \n \n ${threadData.messages[threadData.messages.length-1].content}`;
                const thread = await limiter.schedule({ id: `loadChannel::channel.threads.create::${threadData.id}` }, () => channel.threads.create({ name: threadData.name, message: edMsg, autoArchiveDuration: threadData.autoArchiveDuration, archived: threadData.archived, locked: threadData.locked, rateLimitPerUser: threadData.rateLimitPerUser }));
                let tagFD = [];
                threadData.tags.forEach((tag) => {
                    const tagF = channel.availableTags.find(t => t.name === tag);

                    //console.log(tagF);
                    if(typeof tagF !== "undefined"){
                        tagFD.push(tagF.id);
                    } // cant find the original or the original wasn't created 
                    else {
                        console.warn("bad news, can't set it as the original TAG wasn't found (We have to get the old tag id for us to get the name, blame discord :( ) You may have to set it");
                    }
                })
                await thread.setAppliedTags(tagFD);
                await loadMessages(thread, threadData.messages, webhook);
               } else {
                webhook = await limiter.schedule({ id: `loadMessages::channel.createWebhook::${channel.name}` }, () => channel.createWebhook({ name: "MessagesBackup", avatar: channel.client.user.displayAvatarURL() }));
                let edMsg = threadData.messages[threadData.messages.length-1];
                //console.log(edMsg);
                edMsg.content = `This thread has been backed up by Dim | This message was from ${edMsg.username}! Here is the starting message \n \n ${threadData.messages[threadData.messages.length-1].content}`;
                const thread = await limiter.schedule({ id: `loadChannel::channel.threads.create::${threadData.id}` }, () => channel.threads.create({ name: threadData.name, message: edMsg, autoArchiveDuration: threadData.autoArchiveDuration, archived: threadData.archived, locked: threadData.locked, rateLimitPerUser: threadData.rateLimitPerUser }));
                if (webhook) await loadMessages(thread, threadData.messages, webhook);}
            });
        }
    }

    return channel;
}

/* delete all roles, channels, emojis, etc of a guild */
export async function clearGuild(guild, limiter) {
    const roles = guild.roles.cache.filter((role) => !role.managed && role.editable && role.id != guild.id);
    roles.forEach(async (role) => await limiter.schedule({ id: `clearGuild::role.delete::${role.id}` }, () => role.delete().catch((error) => console.error(`Error occurred while deleting roles: ${error.message}`))));

    guild.channels.cache.forEach(async (channel) => await limiter.schedule({ id: `clearGuild::channel.delete::${channel.id}` }, () => channel.delete().catch((error) => console.error(`Error occurred while deleting channels: ${error.message}`))));
    guild.emojis.cache.forEach(async (emoji) => await limiter.schedule({ id: `clearGuild::emoji.delete::${emoji.id}` }, () => emoji.delete().catch((error) => console.error(`Error occurred while deleting emojis: ${error.message}`))));

    const webhooks = await limiter.schedule({ id: "clearGuild::guild.fetchWebhooks" }, () => guild.fetchWebhooks());
    webhooks.forEach(async (webhook) => await limiter.schedule({ id: `clearGuild::webhook.delete::${webhook.id}` }, () => webhook.delete().catch((error) => console.error(`Error occurred while deleting webhooks: ${error.message}`))));

    const bans = await limiter.schedule({ id: "clearGuild::guild.bans.fetch" }, () => guild.bans.fetch());
    bans.forEach(async (ban) => await limiter.schedule({ id: `clearGuild::guild.members.unban::${ban.user.id}` }, () => guild.members.unban(ban.user).catch((error) => console.error(`Error occurred while deleting bans: ${error.message}`))));

    await limiter.schedule({ id: "clearGuild::guild.setAFKChannel" }, () => guild.setAFKChannel(null));
    await limiter.schedule({ id: "clearGuild::guild.setAFKTimeout" }, () => guild.setAFKTimeout(60 * 5));
    await limiter.schedule({ id: "clearGuild::guild.setIcon" }, () => guild.setIcon(null));
    await limiter.schedule({ id: "clearGuild::guild.setBanner" }, () => guild.setBanner(null));
    await limiter.schedule({ id: "clearGuild::guild.setSplash" }, () => guild.setSplash(null));
    await limiter.schedule({ id: "clearGuild::guild.setDefaultMessageNotifications" }, () => guild.setDefaultMessageNotifications(GuildDefaultMessageNotifications.OnlyMentions));
    await limiter.schedule({ id: "clearGuild::guild.setWidgetSettings" }, () => guild.setWidgetSettings({ enabled: false, channel: null }));

    if (!guild.features.includes(GuildFeature.Community)) {
        await limiter.schedule({ id: "clearGuild::guild.setExplicitContentFilter" }, () => guild.setExplicitContentFilter(GuildExplicitContentFilter.Disabled));
        await limiter.schedule({ id: "clearGuild::guild.setVerificationLevel" }, () => guild.setVerificationLevel(GuildVerificationLevel.None));
    }

    await limiter.schedule({ id: "clearGuild::guild.setSystemChannel" }, () => guild.setSystemChannel(null));
    await limiter.schedule({ id: "clearGuild::guild.setSystemChannelFlags" }, () => guild.setSystemChannelFlags([
        GuildSystemChannelFlags.SuppressGuildReminderNotifications,
        GuildSystemChannelFlags.SuppressJoinNotifications,
        GuildSystemChannelFlags.SuppressPremiumSubscriptions
    ]));

    await limiter.schedule({ id: "clearGuild::guild.setPremiumProgressBarEnabled" }, () => guild.setPremiumProgressBarEnabled(false));

    const rules = await limiter.schedule({ id: "clearGuild::guild.autoModerationRules.fetch" },() => guild.autoModerationRules.fetch());
    rules.forEach(async (rule) => await limiter.schedule({ id: `clearGuild::rule.delete::${rule.id}` }, () => rule.delete().catch((error) => console.error(`Error occurred while deleting automod rules: ${error.message}`))));
}