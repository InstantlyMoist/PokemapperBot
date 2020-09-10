const joinHandler = require('../handlers/joinHandler.js');

module.exports = async (client, member) => {
    console.log("detected join!");
    joinHandler(member);
};