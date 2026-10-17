require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const BANNED_WORDS = ['spamm', 'hack', 'رابط_مشبوه']; 
const LINK_REGEX = /(https?:\/\/[^\s]+)/g;
const ALLOWED_CHANNEL_ID = '1561128140674175007';

const commands = [
    new SlashCommandBuilder().setName('help').setDescription('عرض قائمة الأوامر الشاملة'),
    new SlashCommandBuilder().setName('لو_خيروك').setDescription('لعبة الاختيارات العشوائية'),
    new SlashCommandBuilder().setName('قرعة').setDescription('اختيار عضو عشوائي من السيرفر'),
    new SlashCommandBuilder().setName('نصيحة').setDescription('الحصول على نصيحة برمجية أو عامة'),
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('مسح الرسائل')
        .addIntegerOption(option => 
            option.setName('count').setDescription('عدد الرسائل المراد مسحها').setRequired(false)
        )
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log(`✅ Bot is online ${client.user.tag}`);
    client.user.setActivity('حماية السيرفر والفعاليات | /help');

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
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
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
        return interaction.reply({ content: '❌ لا يمكنك استخدام الأوامر إلا في القناة المخصصة!', ephemeral: true });
    }

    const { commandName } = interaction;

    if (commandName === 'help') {
        const helpEmbed = new EmbedBuilder()
            .setTitle('🌟 قائمة الأوامر الشاملة للبوت الخارق')
            .setColor('#26658C')
            .setDescription('إليك جميع الخدمات والألعاب والأوامر المتاحة حالياً في السيرفر:')
            .addFields(
                { name: '🎮 ألعاب وفعاليات', value: '`/لو_خيروك` - لعبة الاختيارات الممتعة\n`/قرعة` - اختيار عضو عشوائي من السيرفر\n`/نصيحة` - الحصول على نصيحة برمجية أو عامة' },
                { name: '🛡️ الحماية والأمان', value: 'البوت يحذف الروابط والكلمات السيئة تلقائياً.' },
                { name: '⚙️ الأوامر الإدارية', value: '`/clear` - مسح الرسائل' }
            )
            .setFooter({ text: 'صُنع بواسطة زكريا لتطوير السيرفرات!' });

        return interaction.reply({ embeds: [helpEmbed] });
    }

    if (commandName === 'لو_خيروك') {
        const options = [
            'تأكل بصلة نيئة 🧅 أم تشرب كاس ماء وملح 🧂؟',
            'تسافر للماضي 🕰️ أم تسافر للمستقبل 🚀؟',
            'تخسر هاتفك لمدة أسبوع 📱 أم تخسر الإنترنت لمدة شهر 🌐؟',
            'تكون قادراً على الطيران 🦅 أم الاختفاء 👻؟'
        ];
        const randomOption = options[Math.floor(Math.random() * options.length)];
        return interaction.reply(`🤔 **لو خيروك:**\n${randomOption}`);
    }

    if (commandName === 'قرعة') {
        await interaction.deferReply();
        const members = await interaction.guild.members.fetch();
        const randomMember = members.filter(m => !m.user.bot).random();
        return interaction.editReply(`🎉 الفائز في القرعة هو: ${randomMember}! مبروك الفوز 🥳`);
    }

    if (commandName === 'نصيحة') {
        const tips = [
            '💡 اكتب كودك بتركيز واجعل دائماً أسماء المتغيرات واضحة ومعبرة!',
            '💡 لا تشارك توكن بوتك البرمجي مع أي شخص أبداً لتحافظ على أمان سيرفرك.',
            '💡 خذ استراحة قصيرة كل ساعة عمل لتجديد نشاطك التركيزي في البرمجة!'
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        return interaction.reply(randomTip);
    }

    if (commandName === 'clear') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ ليس لديك صلاحية مسح الرسائل!', ephemeral: true });
        }
        const amount = interaction.options.getInteger('count') || 10;
        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ content: `🧹 تم مسح ${amount} رسالة بنجاح.`, ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);

const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running online 24/7!\n');
});
server.listen(process.env.PORT || 3000, () => {});
