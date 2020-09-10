const message = require("../events/message");

function getDataString(client, message) {
    let finalString = "";
    for (data in client.userdata[message.author.id]) finalString += `${data.charAt(0).toUpperCase() + data.slice(1)}: ${client.userdata[message.author.id][data]}\n`;
    return finalString;
}

exports.run = (client, message, args) => {
    let foundCity = client.userdata[message.author.id].city;
    if (foundCity == null) {
        message.channel.send("Jouw data is nog niet bekend, graag eventjes invullen in je prive chat, zie je niks? typ +setup");
        return;
    }
    if (foundCity == "breda") {
        message.channel.send("We hebben je een privebericht gestuurd. Hierin staan je gegevens die je nogmaals moet controleren");
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
        message.author.send({ embed: informationEmbed});
        /*let invoice_json = createInvoice(client, message);
        client.paypal.invoice.create(invoice_json, function (error, invoice) {
            if (error) {
                message.channel.send("Fout tijdens maken van factuur!");
                console.log(error.response.details)
            } else {
                client.paypal.invoice.send(invoice.id, function (error, rv) {
                    if (error) {
                        message.channel.send("Factuur niet verzonden!");
                        console.log(error.response);
                        throw error;
                    } else {
                        message.channel.send("Factuur succesvol verzonden!");
                    }
                });
            }
        });*/
    } else {
        message.channel.send("Het +pay commando werkt niet in andere steden dan breda...");
    }
    console.log(foundCity);
}

function createInvoice(client, message) {
    return invoice = {
        "merchant_info": {
            "email": "kyllian007@gmail.com",
            "first_name": "Kyllian",
            "last_name": "Warmerdam",
            "business_name": "Pokemon GO Breda",
        },
        "billing_info": [{
            "email": client.userdata[message.author.id].email,
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