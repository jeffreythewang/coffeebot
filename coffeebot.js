'use strict';

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('botkit');

var controller = Botkit.slackbot();

var bot = controller.spawn({
  token: process.env.token
});

bot.startRTM(function(err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});


controller.hears(['menu'], 'direct_message,direct_mention,mention', function(bot, message) {

  bot.reply(message, "You can order the following:\n(1) Regular cup (250g)\n(2) Small cup (150g).");

});

controller.hears(['status'], 'direct_message,direct_mention,mention', function(bot, message) {

  bot.reply(message, "");

});

controller.hears(['order (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {

  controller.storage.users.get(message.user, function(err, user) {
    if (user && user.name) {
      bot.reply(message, 'Hello ' + user.name + '.');
    } else {
      bot.reply(message, 'Hello.');
    }
  });
});

controller.hears(['clear'], 'direct_message,direct_mention,mention', function(bot, message) {
});
