require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

const BANNED_WORDS = ['spamm', 'hack', 'رابط_مشبوه']; 
const LINK_REGEX = /(https?:\/\/[^\s]+)/g;

const ALLOWED_CHANNEL_ID = '1561128140674175007';

client.on('ready', () => {
    console.log(`✅ Bot is online ${client.user.tag}`);
    client.user.setActivity('حماية السيرفر والفعاليات | /help');
});

client.on('guildMemberAdd', (member) => {
    const welcomeChannel = member.guild.channels.cache.get(ALLOWED_CHANNEL_ID) || member.guild.systemChannel;
    if (!welcomeChannel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setTitle('🎉 عضو جديد انضم إلينا!')
        .setDescription(`أهلاً بك يا ${member} في سيرفرنا الرائع! نورتنا وشرفتنا 🥳`)
        .setColor('#26658C')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'نتمنى لك قضاء أوقات ممتعة معنا!' });

    welcomeChannel.send({ embeds: [welcomeEmbed] });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== ALLOWED_CHANNEL_ID) return;

    const content = message.content.toLowerCase();

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

    if (content === 'السلام عليكم') {
        return message.reply('وعليكم السلام ورحمة الله وبركاته! أهلاً بك يا زكريا ❤️');
    }
    if (content === 'هلا' || content === 'هلا والله') {
        return message.reply('يا هلا وغلا! منور السيرفر 🥳');
    }

    if (content === '/help' || content === '/') {
        const helpEmbed = new EmbedBuilder()
            .setTitle('🌟 قائمة الأوامر الشاملة للبوت الخارق')
            .setColor('#26658C')
            .setDescription('إليك جميع الخدمات والألعاب والأوامر المتاحة حالياً في السيرفر:')
            .addFields(
                { name: '🎮 ألعاب وفعاليات', value: '`!لو_خيروك` - لعبة الاختيارات الممتعة\n`!قرعة` - اختيار عضو عشوائي من السيرفر\n`!نصيحة` - الحصول على نصيحة برمجية أو عامة' },
                { name: '🛡️ الحماية والأمان', value: 'البوت يحذف الروابط والكلمات السيئة تلقائياً.' },
                { name: '⚙️ الأوامر الإدارية', value: '`!clear [العدد]` - مسح الرسائل\n`!ban [العضو]` - حظر عضو\n`!kick [العضو]` - طرد عضو' },
                { name: '👋 الترحيب والأنشطة', value: 'ترحيب تلقائي بالأعضاء الجدد وتعديل حالة البوت.' }
            )
            .setFooter({ text: 'صُنع بواسطة زكريا لتطوير السيرفرات!' });

        return message.channel.send({ embeds: [helpEmbed] });
    }

    if (content === '/لو_خيروك') {
        const options = [
            'تأكل بصلة نيئة 🧅 أم تشرب كاس ماء وملح 🧂؟',
            'تسافر للماضي 🕰️ أم تسافر للمستقبل 🚀؟',
            'تخسر هاتفك لمدة أسبوع 📱 أم تخسر الإنترنت لمدة شهر 🌐؟',
            'تكون قادراً على الطيران 🦅 أم الاختفاء 👻؟'
        ];
        const randomOption = options[Math.floor(Math.random() * options.length)];
        return message.reply(`🤔 **لو خيروك:**\n${randomOption}`);
    }

    if (content === '/قرعة') {
        const members = await message.guild.members.fetch();
        const randomMember = members.filter(m => !m.user.bot).random();
        return message.channel.send(`🎉 الفائز في القرعة هو: ${randomMember}! مبروك الفوز 🥳`);
    }

    if (content === '/نصيحة') {
        const tips = [
            '💡 اكتب كودك بتركيز واجعل دائماً أسماء المتغيرات واضحة ومعبرة!',
            '💡 لا تشارك توكن بوتك البرمجي مع أي شخص أبداً لتحافظ على أمان سيرفرك.',
            '💡 خذ استراحة قصيرة كل ساعة عمل لتجديد نشاطك التركيزي في البرمجة!'
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        return message.reply(randomTip);
    }

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

    if (content.startsWith('/kick')) {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return message.reply('❌ ليس لديك صلاحية طرد الأعضاء!');
        }
        const memberToKick = message.mentions.members.first();
        if (!memberToKick) return message.reply('❌ يرجى منشن العضو المراد طرده!');
        await memberToKick.kick();
        return message.channel.send(`👢 تم طرد العضو ${memberToKick.user.tag} بنجاح.`);
    }

    if (content.startsWith('/ban')) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ ليس لديك صلاحية حظر الأعضاء!');
        }
        const memberToBan = message.mentions.members.first();
        if (!memberToBan) return message.reply('❌ يرجى منشن العضو المراد حظره!');
        await memberToBan.ban();
        return message.channel.send(`🔨 تم حظر العضو ${memberToBan.user.tag} نهائياً.`);
    }
});

client.login(process.env.DISCORD_TOKEN);

const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running online 24/7!\n');
});
server.listen(process.env.PORT || 3000, () => {
    console.log('HTTP Web Server Listening');
});
