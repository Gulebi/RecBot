const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
const { Client, Events, GatewayIntentBits } = require("discord.js");
const { getVoiceConnection, joinVoiceChannel, EndBehaviorType } = require("@discordjs/voice");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.once(Events.ClientReady, () => {
    console.log("Bot is ready!");
});

client.on(Events.MessageCreate, (message) => {
    if (message.content === "r") {
        if (message.member.voice.channel) {
            let connection;
            const channel = message.member.voice.channel;

            connection = getVoiceConnection(message.guildId);
            if (!connection) {
                connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    selfDeaf: false,
                    selfMute: true,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });
            }

            const receiver = connection.receiver;

            receiver.speaking.on("start", (userId) => {
                channel.guild.members
                    .fetch(userId)
                    .then((member) => console.log(`${member.user.username} started speaking`));

                const inputStream = receiver.subscribe(userId, {
                    mode: "pcm",
                    // end: {
                    //     behavior: EndBehaviorType.Manual,
                    // },
                });
            });

            receiver.speaking.on("end", (userId) => {
                channel.guild.members
                    .fetch(userId)
                    .then((member) => console.log(`${member.user.username} stopped speaking`));
            });
        } else {
            message.reply("You need to join a voice channel first!");
        }
    }
});

client.login(process.env.TOKEN);
