const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const logger = pino({ level: "info" }).child({ level: "info" }); // More detailed logging
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    WA_DEFAULT_EPHEMERAL,
    jidNormalizedUser,
    proto,
    getDevice,
    generateWAMessageFromContent,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    getContentType,
    generateForwardMessageContent,
    downloadContentFromMessage,
    jidDecode
} = require('@whiskeysockets/baileys');

const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function GIFTED_MD_PAIR_CODE() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/' + id);
        try {
            var items = ["Safari"];

            function selectRandomItem(array) {
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }

            var randomItem = selectRandomItem(items);

            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, logger.child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: logger.child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect
                } = s;

                if (connection == "open") {
                    console.log(`[${id}] WhatsApp connection opened for ${sock.user?.id}`);
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;

                    function generateRandomText() {
                        const prefix = "3EB";
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let randomText = prefix;
                        for (let i = prefix.length; i < 22; i++) {
                            const randomIndex = Math.floor(Math.random() * characters.length);
                            randomText += characters.charAt(randomIndex);
                        }
                        return randomText;
                    }

                    const randomText = generateRandomText();

                    try {
                        console.log(`[${id}] Attempting to upload session data to Mega.nz`);
                        const { upload } = require('./mega');
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "POPKID~" + string_session;
                        console.log(`[${id}] Mega.nz upload successful. URL: ${mega_url}, Session ID: ${md}`);
                        let code = await sock.sendMessage(sock.user.id, { text: md });
                        console.log(`[${id}] Session ID message sent successfully.`);

                        try {
                            let desc = `╭━━━━━━━━━━━━━━━━━━━━━╮
┃  💖 POPKID-XMD USER ✅  ┃
╰━━━━━━━━━━━━━━━━━━━━━╯

👋🏻 Hello there, POPKID-XMD User!

> ⚠️ *Do not share your session ID with your GF!* 😂

✅ **Thanks for using POPKID-XMD!** 💙

━━━━━━━━━━━━━━━━━━━━━━━

📢 **Join our WhatsApp Channel:**
🔗 https://whatsapp.com/channel/0029VadQrNI8KMqo79BiHr3l

⭐ **Don't forget to fork the repo:**
🔗 https://github.com/Popkiddevs/POPKID-XTECH

━━━━━━━━━━━━━━━━━━━━━━━

> *© Powered by dev popkid💙*`;
                            await sock.sendMessage(sock.user.id, {
                                text: desc,
                                contextInfo: {
                                    externalAdReply: {
                                        title: "Popkid",
                                        thumbnailUrl: "https://files.catbox.moe/7pg2gp.jpg",
                                        sourceUrl: "https://whatsapp.com/channel/0029VadQrNI8KMqo79BiHr3l",
                                        mediaType: 1,
                                        renderLargerThumbnail: true
                                    }
                                }
                            }, { quoted: code });
                            console.log(`[${id}] Welcome message sent successfully.`);
                        } catch (error) {
                            console.error(`[${id}] Error sending welcome message:`, error);
                            await sock.sendMessage(sock.user.id, { text: `⚠️ Error sending welcome message: ${error}` });
                        }

                    } catch (e) {
                        console.error(`[${id}] Error during Mega.nz upload or sending session ID:`, e);
                        let ddd = await sock.sendMessage(sock.user.id, { text: String(e) });
                        let desc = `*Don't Share with anyone this code is used for deployment of POPKID-MD*\n\n ◦ *Github:* https://github.com/Popkiddevs/POPKID-XTECH`;
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "POPKID-XMD",
                                    thumbnailUrl: "https://i.imgur.com/GVW7aoD.jpeg",
                                    sourceUrl: "https://whatsapp.com/channel/0029VadQrNI8KMqo79BiHr3l",
                                    mediaType: 2,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }
                            }
                        }, { quoted: ddd });
                    }
                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`[${id}] Connection closed and temporary files removed.`);
                    await delay(10);
                    // process.exit(); // Commented out for debugging
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    console.log(`[${id}] Connection closed unexpectedly. Reconnecting...`, lastDisconnect.error);
                    await delay(10);
                    GIFTED_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error(`[${id}] General error during pairing:`, err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ Pairing Failed. Please check server logs." });
            }
        }
    }
    return await GIFTED_MD_PAIR_CODE();
});
/*
setInterval(() => {
    console.log("☘️ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...");
    process.exit();
}, 180000); //30min*/
module.exports = router;
