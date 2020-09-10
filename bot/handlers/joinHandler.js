const cities = require('../../data/city.json');

const cityMessage = {
    color: 0x0099ff,
    title: 'Welkom bij PoGoMapper',
    description: 'Vul in deze chat je plaatsnaam in! De rest wordt automatisch geregeld!',
    fields: [
        {
            name: "Onze huidige plaatsen zijn",
            value: getCityString()
        }
    ]
}

function getCityString() {
    let finalString = "";
    for (city in cities) finalString += `${city}, `
    return finalString.substring(0, finalString.length - 2);
}

function getRegionString(foundPlace) {
    let finalString = "";
    for (region in cities[foundPlace].regions) finalString += `${parseInt(region) + 1}. ${cities[foundPlace].regions[region]}\n`
    return finalString.trim();
}

module.exports = async (member) => {
    member.send({ embed: cityMessage }).then(() => {
        member.user.dmChannel.awaitMessages(m => m.author.id == member.id && doesPlaceExist(m, member), {
            max: 1,
        })
            .then((collected) => {
                const foundPlace = collected.first().content.toLowerCase();
                member.roles.add(cities[foundPlace].roleID);
                member.client.userdata[member.id] = {
                    city: foundPlace
                };
                member.client.save();
                const foundEmbed = {
                    color: 0x0099ff,
                    title: `✅ Plaatsnaam ${foundPlace} opgeslagen!`,
                };
                member.send({ embed: foundEmbed });
                askRegion(member, foundPlace);
            })
            .catch((err) => {
                return console.error(err);
            });
    });
}

function askRegion(member, foundPlace) {
    const regionEmbed = {
        color: 0x0099ff,
        title: 'Voer je regionummer in',
        description: `Aangezien je in ${foundPlace} woont is het van belang dat je aangeeft in welke regio je woont. Zo kunnen wij de bots eerlijk verdelen. Geef het nummer van jouw regio in.`,
        fields: [
            {
                name: `${foundPlace.charAt(0).toUpperCase() + foundPlace.slice(1)} kent de volgende regios:`,
                value: getRegionString(foundPlace)
            }
        ]
    }
    if (cities[foundPlace].needsRegion) {
        member.send({ embed: regionEmbed }).then(() => {
            member.user.dmChannel.awaitMessages(m => m.author.id == member.id && isNumber(m, member, foundPlace), {
                max: 1,
            })
                .then((collected) => {
                    let foundRegion = cities[foundPlace].regions[collected.first().content - 1];
                    member.client.userdata[member.id].region = foundRegion;
                    member.client.save();
                    const foundEmbed = {
                        color: 0x0099ff,
                        title: `✅ Regio ${foundRegion} opgeslagen!`,
                    };
                    member.send({ embed: foundEmbed });
                    askEmail(member, foundPlace);
                })
                .catch((err) => console.error(err));
        });
    } else {
        askEmail(member, foundPlace);
    }
}

function askEmail(member, foundPlace) {
    const emailEmbed = {
        color: 0x0099ff,
        title: 'Voer je email in',
        description: `Aangezien je in ${foundPlace} woont worden de betalingen via PayPal gedaan. Dit betekend dat je je email in moet voeren. Er wordt dan een rekening naar je toegestuurd die *vrijwillig* kunt betalen. Je bent dus niet verplicht!`,
    }
    if (cities[foundPlace].needsEmail) {
        member.send({ embed: emailEmbed }).then(() => {
            member.user.dmChannel.awaitMessages(m => m.author.id == member.id && isEmail(m, member), {
                max: 1,
            })
                .then((collected) => {
                    let foundEmail = collected.first().content;
                    member.client.userdata[member.id].email = foundEmail;
                    member.client.save();
                    const foundEmbed = {
                        color: 0x0099ff,
                        title: `✅ Email ${foundEmail} opgeslagen!`,
                    };
                    member.send({ embed: foundEmbed });
                    finalize(member);
                })
                .catch((err) => console.error(err));
        });
    } else {
        finalize(member);
    }
}

function finalize(member) {
    member.send("Setup OK");
}

function isEmail(message, member) {
    const email = message.content;
    if (email.match('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$') == null) {
        member.send("Geen goed email!");
        return false;
    } return true;
}

function isNumber(message, member, foundPlace) {
    const number = message.content;
    if (number.match(/^[0-9]+$/) == null || cities[foundPlace].regions.length < parseInt(number)) {
        member.send("Dit is geen getal, voer een valide getal in!");
        return false;
    } return true;
}

function doesPlaceExist(message, member) {
    const foundPlace = message.content.toLowerCase();
    if (cities[foundPlace] == null) {
        member.send("Plaatsnaam incorrect, voer breda of oosterhout in");
        return false;
    } else return true;
}