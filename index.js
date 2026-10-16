require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// قائمة الكلمات الممنوعة للحماية
const BANNED_WORDS = ['spamm', 'hack', 'دسكورد']; 
const LINK_REGEX = /(https?:\/\/[^\s]+)/g;

client.on('ready', () => {
    console.log(`✅ Bot is online ${client.user.tag}`);
    client.user.setActivity('حماية السيرفر والفعاليات | !help');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    // ==========================================
    // 🛡️ 1. نظام الحماية (Anti-Spam & Links)
    // ==========================================
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const hasBannedWord = BANNED_WORDS.some(word => content.includes(word));
        if (hasBannedWord) {
            await message.delete();
            return message.channel.send(`⚠️ ${message.author}، يمنع استخدام هذه الكلمات في السيرفر!`);
        }

        if (LINK_REGEX.test(content)) {
            await message.delete();
            return message.channel.send(`⚠️ ${message.author}، يمنع نشر الروابط بدون إذن الإدارة!`);
        }
    }

    // ==========================================
    // 💬 2. نظام الردود التلقائية
    // ==========================================
    if (content === 'السلام عليكم') {
        return message.reply('وعليكم السلام ورحمة الله وبركاته! أهلاً بك في السيرفر زاك❤️');
    }

    if (content === 'هلا' || content === 'هلا والله') {
        return message.reply('يا هلا وغلا! أهلاً وسهلاً بك 🥳');
    }

    // ==========================================
    // 🎮 3. نظام الفعاليات والأوامر
    // ==========================================
   // عرض قائمة الأوامر عند كتابة ! أو !help
    if (content === '/help' || content === '/') {
        const helpEmbed = new EmbedBuilder()
            .setTitle('📜 قائمة أوامر بوت الحماية والفعاليات')
            .setColor('#26658C')
            .setDescription('هذه هي جميع الخيارات والأوامر المتاحة حالياً:')
            .addFields(
                { name: '🎮 ألعاب الفعاليات', value: '`!لو_خيروك` - لعبة الاختيارات العشوائية\n`!سؤال` - طرح سؤال ثقافي\n`!قرعة` - اختيار عضو عشوائي من السيرفر' },
                { name: '🛡️ الحماية والأمان', value: 'البوت يحذف الروابط والكلمات الممنوعة تلقائياً (مستثنى منها المشرفون).' },
                { name: '⚙️ الأوامر الإدارية', value: '`!clear [العدد]` - مسح رسائل الشات (للمشرفين فقط)' }
            )
            .setFooter({ text: 'اختر الأمر الذي يناسبك وابدأ الاستمتاع!' });

        return message.channel.send({ embeds: [helpEmbed] });
    }
    if (content === '/لو_خيروك') {
        const options = [
            'تأكل بصلة نيئة 🧅 أم تشرب كاس ماء وملح 🧂؟',
            'تسافر للماضي 🕰️ أم تسافر للمستقبل 🚀؟',
            'تخسر هاتفك لمدة أسبوع 📱 أم تخسر الإنترنت لمدة شهر 🌐؟'
        ];
        const randomOption = options[Math.floor(Math.random() * options.length)];
        return message.reply(`🤔 **لو خيروك:**\n${randomOption}`);
    }

    if (content === '/قرعة') {
        const members = await message.guild.members.fetch();
        const randomMember = members.filter(m => !m.user.bot).random();
        return message.channel.send(`🎉 الفائز في القرعة هو: ${randomMember}! مبروك 🥳`);
    }

    // ==========================================
    // ⚙️ 4. الأوامر الإدارية (مسح الرسائل)
    // ==========================================
    if (content.startsWith('/clear')) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ ليس لديك صلاحية مسح الرسائل!');
        }
        const args = content.split(' ');
        const amount = parseInt(args[1]) || 10;
        await message.channel.bulkDelete(amount, true);
        const msg = await message.channel.send(`🧹 تم مسح ${amount} رسالة بنجاح.`);
        setTimeout(() => msg.delete(), 3000);
    }
});

client.login(process.env.DISCORD_TOKEN);

const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running online!\n');
});
server.listen(process.env.PORT || 3000, () => {
    console.log('HTTP Web Server Listening');
});
