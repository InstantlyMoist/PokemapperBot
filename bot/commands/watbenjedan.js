exports.run = (client, message, args) => {
    let embed = {
        color: 0x0099ff,
        title: 'Een prutser!',
        description: "'prut·ser (de ~ (m.)): iem. die erg onhandig en knoeierig werkt => broddelaar, knoeier"
    }
    message.channel.send({ embed : embed}).catch(console.error);
}