const Discord = require("discord.js")
const PREFIX = "!"

var bot = new Discord.Client()

bot.on('ready', () => {
    console.log("RainBot is ready.")
    bot.user.setActivity(`for ${PREFIX}help`, {type: 'WATCHING'})
})

bot.on('guildMemberAdd', function(member) {
    var welcomechannel = member.guild.channels.find("name", "welcome-bye")
    if (!welcomechannel) return;
    welcomechannel.send(`Hey there ${member}! Make sure to read the rules at #rules and buy RainHub by doing !buy`)
    var memberrole = member.guild.roles.find("name", "Members")
    if (!memberrole) return;
    member.addRole(memberrole)
})

bot.on('guildMemberRemove', function(nonmember) {
    var byechannel = nonmember.guild.channels.find("name", "welcome-bye")
    if (!byechannel) return;
    byechannel.send(`We're so sad to see you go ${nonmember}. Please come back again!`)
})

bot.on('message', async function(message) {
    if (message.author.equals(bot.user)) return;
    if (!message.content.startsWith(PREFIX)) return;
    if (message.channel.send === "dm") return message.author.send("Please execute this command in the official RainHub server.")

    var args = message.content.substring(PREFIX.length).split(" ")

    switch (args[0].toLowerCase()) {
        case "help":
        var embed = new Discord.RichEmbed()
            .setAuthor("Available Commands")
            .addField(`${PREFIX}help`, "Sends this embed.")
            .addField(`${PREFIX}ping`, "Sends you a really precise ping.")
            .addField(`${PREFIX}buy`, "DM's you the link to buy the script hub.")
            .addField(`${PREFIX}purge`, "Mods and higher only: purges the amount of messages you specify (has to be between 1 and 100).")
            .addField(`${PREFIX}kick <user> <reason>`, "Mods and higher only: kicks the mentioned user with the reason why.")
            .addField(`${PREFIX}ban <user> <reason>`, "Mods and higher only: bans the mentioned user for the specified reason.")
            .addField(`${PREFIX}mute <user>`, "Mods and higher only: mutes the user mentioned.")
            .addField(`${PREFIX}unmute <user>`, "Mods and higher only: will unmute the mentioned user.")
            .setFooter("RainBot")
            .setColor("RANDOM")
        message.channel.send(embed).catch(e => {
            console.error(e)
        })
        break;

        case "ping":
        message.channel.send(`:ping_pong: Pong! It took approximately ${bot.ping}ms to deliver this message.`)
        break;

        case "purge":
        if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have the necessary perms to do this!")
        if (!args[1]) return message.channel.send("Please specify a amount of messages to purge")
        if (isNaN(args[1])) return message.channel.send("Please specify a ***VALID*** number of messages you want to purge.")
        if (args[1] < 1) return message.channel.send("Please specify a number between 1 and 100.")
        if (args[1] > 100) return message.channel.send("Please specify a number between 1 and 100.")
        message.delete()
        message.channel.bulkDelete(args[1])
        message.channel.send(`Purged ${args[1]} messages!`)
        break;

        case "kick":
        if (!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You do not have the permission to do this!");
        var kickedmember = message.mentions.members.first()
        if (!kickedmember) return message.reply("Please mention a valid member of this server!")
        if (kickedmember.hasPermission("KICK_MEMBERS")) return message.reply("I cannot kick this member because he/she is a mod/admin!")
        var kickreasondelete = 10 + kickedmember.user.id.length
        var kickreason = message.content.substring(kickreasondelete).split(" ");
        var kickreason = kickreason.join(" ");
        if (!kickreason) return message.reply("Please indicate a reason for the kick!")
        kickedmember.send(`You have been kicked from ${message.guild} for the following reason: ${kickreason}.`)
        kickedmember.kick(kickreason)
            .catch(error => message.reply(`Sorry @${message.author} I couldn't kick because of : ${error}`));
        message.reply(`${kickedmember.user.username} has been kicked by ${message.author.username} because: ${kickreason}`);
        break;

        case "ban":
        if (!message.member.hasPermission("BAN_MEMBERS")) return message.reply("You do not have the permission to do this!");
        var banmember = message.mentions.members.first()
        if (!banmember) return message.reply("Please mention a valid member of this server!")
        if (banmember.hasPermission("BAN_MEMBERS")) return message.reply("I cannot ban this member because he/she is a mod/admin!")
        var banreasondelete = 10 + banmember.user.id.length
        var banreason = message.content.substring(banreasondelete).split(" ");
        var banreason = banreason.join(" ");
        if (!banreason) return message.reply("Please indicate a reason for the ban!")
        banmember.send(`You have been banned from ${message.guild} for the following reason: ${banreason}.`)
        banmember.ban(banreason).catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
        message.reply(`${banmember} has been kicked by ${message.author.username} because: ${banreason}`);
        break;

        case "mute":
        if (!message.member.hasPermission("MUTE_MEMBERS")) return message.channel.send("You do not have the permission to do this!")
        let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!tomute) return message.reply("Please specify a valid user!");
        if(tomute.hasPermission("MUTE_MEMBERS")) return message.reply("I cannot mute this member since he/she is a mod/admin!");
        let muterole = message.guild.roles.find(`name`, "jail");
        if(!muterole){
            try{
                muterole = await message.guild.createRole({
                name: "jail",
                color: "#000000",
                permissions:[]
            })
            message.guild.channels.forEach(async (channel, id) => {
            await channel.overwritePermissions(muterole, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false
            });
        });
        } catch(e){
        console.log(e.stack);
        }
        }
        await(tomute.addRole(muterole.id));
        message.channel.send(`${tomute} has been successfully muted!`)
        break;

        case "unmute":
        var unmuterole = message.guild.roles.find("name", "jail")
        if (!message.member.hasPermission("MUTE_MEMBERS")) return message.channel.send("You do not have the permission to do this!")
        var tounmute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
        if (!tounmute) return message.channel.send("Please specify a valid user!")
        await(tounmute.removeRole(unmuterole.id))
        message.channel.send(`${tounmute} has been successfully unmuted!`)
        break;

        case "buy":
        message.channel.send("RainHub is still in it's development stages, so it is not available to be bought.")
        break;
    }
})
bot.login(process.env.TOKEN)
