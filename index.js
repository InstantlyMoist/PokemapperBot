const Discord = require('discord.js');
const client = new Discord.Client();
const sensitive = require('./data/sensitive.json');
client.commands = new Discord.Collection();
client.config = require('./data/config.json');
client.userdata = require('./data/users.json');
client.save = () => {
    fs.writeFile('./data/users.json', JSON.stringify(client.userdata, null, 2), (err) => {
        if (err) return console.error(err);
    });
}
client.paypal = require('paypal-rest-sdk');
const fs = require('fs');

fs.readdir("./bot/events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./bot/events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});

fs.readdir("./bot/commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./bot/commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
    });
});

client.login(sensitive.token);

client.paypal.configure({
    'mode': 'live', 
    'client_id': sensitive.clientID,
    'client_secret': sensitive.clientSecret
});