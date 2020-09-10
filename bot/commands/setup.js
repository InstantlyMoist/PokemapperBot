const joinHandler = require('../handlers/joinHandler.js');

exports.run = async (client, message, args) => {
    await message.delete();
    joinHandler(message.member);
}