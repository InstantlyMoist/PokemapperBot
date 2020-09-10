function getDataString(client, message) {
    let finalString = "";
    for (data in client.userdata[message.author.id]) finalString += `${data.charAt(0).toUpperCase() + data.slice(1)}: ${client.userdata[message.author.id][data]}\n`;
    return finalString;
}

exports.run = async (client, message, args) => {
    let foundCity = client.userdata[message.author.id].city;
    if (foundCity == null) {
        message.channel.send("Jouw data is nog niet bekend, graag eventjes invullen in je prive chat, zie je niks? typ +setup");
        return;
    }
    if (foundCity == "breda") {
        let sentEmbed = {
            color: 0x0099ff,
            title: 'We hebben je een privebericht gestuurd',
            description: `${message.author.toString()}, om zeker te weten dat alle gegevens kloppen sturen we je een privebericht. Hierin staan je gegevens nog een keer.`
        }
        message.channel.send({ embed : sentEmbed }).then((msg) => {
            msg.delete({timeout: 5000});
            message.delete({timeout: 5000});
        });
        let informationEmbed = {
            color: 0x0099ff,
            title: 'Controleer je gegevens!',
            description: 'Om zeker te weten dat de betaling goedgaat moet je je gegevens nogmaals controleren.\nDruk op de ✅ als je gegevens kloppen\nDruk op de ❎ als ze niet kloppen',
            fields: [
                {
                    name: "Jouw gegevens zijn:",
                    value: getDataString(client, message)
                }
            ]
        }
        message.author.send({ embed: informationEmbed }).then(async (message) => {
            await message.react('✅');
            await message.react('❎');
            let foundUser;
            message.awaitReactions((reaction, user) => {
                foundUser = user;
                return reaction.message.id == message.id
            }, { max: 1 })
                .then(async (collected) => {
                    const foundEmoji = collected.first();
                    if (foundEmoji.emoji.name == "✅") {
                        let sendingEmbed = {
                            color: 0x0099ff,
                            title: 'We versturen de factuur...',
                            description: 'Een klein ogenblikje, dan versturen we de factuur...'
                        }
                        let errorEmbed = {
                            color: 0x0099ff,
                            title: '❎ Factuur maken mislukt',
                            description: 'Er is iets fout gegaan tijdens het maken van de factuur, raadpleeg een administrator in de server.'
                        }
                        let okEmbed = {
                            color: 0x0099ff,
                            title: '✅ Factuur maken gelukt',
                            description: 'Je ontvangt de factuur zo spoedig mogelijk in je mail!'
                        }
                        sendingMessage = await message.channel.send({ embed: sendingEmbed });
                        let invoice_json = createInvoice(client, foundUser);
                        client.paypal.invoice.create(invoice_json, function (error, invoice) {
                            if (error) {
                                sendingMessage.edit({ embed : errorEmbed});
                                console.log(error.response.details)
                            } else {
                                client.paypal.invoice.send(invoice.id, function (error, rv) {
                                    if (error) {
                                        sendingMessage.edit({ embed : errorEmbed});
                                        console.log(error.response);
                                        throw error;
                                    } else {
                                        sendingMessage.edit({ embed : okEmbed});
                                    }
                                });
                            }
                        });
                    } else {
                        message.channel.send("Pas aan dan ei");
                    }
                })
                .catch((err) => console.error(err));
        });
        /**/
    } else {
        message.channel.send("Het +pay commando werkt niet in andere steden dan breda...");
    }
    console.log(foundCity);
}

function createInvoice(client, foundUser) {
    return invoice = {
        "merchant_info": {
            "email": "kyllian007@gmail.com",
            "first_name": "Kyllian",
            "last_name": "Warmerdam",
            "business_name": "Pokemon GO Breda",
        },
        "billing_info": [{
            "email": client.userdata[foundUser.id].email,
        }],
        "items": [{
            "name": "Pokemon GO Map",
            "quantity": 1.0,
            "unit_price": {
                "currency": "EUR",
                "value": 9
            }
        }],
        "note": "Pokemon GO 7 dagen",
        "payment_term": {
            "term_type": "NET_45"
        },

        "tax_inclusive": false,
        "total_amount": {
            "currency": "EUR",
            "value": "9.0"
        }
    };
}