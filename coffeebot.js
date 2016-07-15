'use strict';

require('dotenv').config();

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

var prefix = ".coffee ";


function convertZWC(inputString) {
  var zeroWidth = "\u200b";
  return inputString[0] + zeroWidth + inputString.substr(1, inputString.length);
}

var command_types = [
  'help',
  'menu',
  'status',
  'order <#>',
  'clear (clears your order)',
  'clear all (clears everyone\'s order)'
];

var order_types = [
  'Regular (250g)',
  'Small (150g)'
];

var cur_coffee_orders = {};

controller.hears([prefix + 'help$'], ['ambient'], function(bot, message) {
  var cmdList = 'The following commands are available:\n';
  for (var i = 0; i < command_types.length; i++) {
    cmdList += command_types[i] + '\n';
  }
  cmdList += 'Enter a command with *' + prefix + '<command>*.';

  bot.reply(message, cmdList);
});

controller.hears([prefix + 'menu$'], ['ambient'], function(bot, message) {
  var menuString = '';
  for (var i = 0; i < order_types.length; i++) {
    menuString += '*(' + i + ') ' + order_types[i] + '*\n';
  }

  bot.reply(message,
      'Currently serving pourovers.\n' +
      'You can order the following (strictly one order per person):\n' +
      menuString +
      '\n' +
      'Simply type *' + prefix + 'order <#>*.\n' +
      'Not enough options? Send your complaints to your local barista, but he/she might not do anything about it.'
  );

});

controller.hears([prefix + 'status$'], ['ambient'], function(bot, message) {
  var curOrdersString = '';

  if (Object.keys(cur_coffee_orders).length <= 0) {
    curOrdersString += 'Nobody has ordered anything. Type *' + prefix + 'order <#>* to order, or *' + prefix + 'menu* to help you decide.';
  } else {
    curOrdersString += 'Current order list:\n';
    Object.keys(cur_coffee_orders).forEach(function(orderer, index) {
      var orderNumber = cur_coffee_orders[orderer];
      curOrdersString += convertZWC(orderer) + ': ' + order_types[orderNumber] + '\n';
    });
    curOrdersString += 'Not what you wanted? Type *' + prefix + 'clear* to remove your order, or simply order again to replace your old order.';
  }

  bot.reply(message, curOrdersString);

});

controller.hears([prefix + 'order$'], ['ambient'], function(bot, message) {
  bot.reply(message, 'Umm, that\'s not on the menu. Please check again by typing *' + prefix + 'menu*.');
});

controller.hears([prefix + 'order (.*)$'], ['ambient'], function(bot, message) {
  var orderNumber = message.match[1];
  switch(orderNumber) {
    case '0':
    case '1':
      registerOrder(message, orderNumber);
      break;
    default:
      bot.reply(message, 'Umm, that\'s not on the menu. Please check again by typing *' + prefix + 'menu*.');
      break;
  }
});

function registerOrder(message, orderNumber) {
  bot.api.users.info({ user: message.user }, function(err, res) {
    if (res.user && res.user.name) {
      cur_coffee_orders[res.user.name] = orderNumber;
      bot.reply(message,
        '*' + order_types[orderNumber] + '* successfully added.\n' +
        'Type *' + prefix + 'status* to view orders.'
      );
    } else {
      bot.reply(message, 'Order request unsuccessful: Invalid User.');
    }
  });
}

controller.hears([prefix + 'clear$'], ['ambient'], function(bot, message) {
  bot.api.users.info({ user: message.user }, function(err, res) {
    if (res.user && res.user.name) {
      delete cur_coffee_orders[res.user.name];
      bot.reply(message, 'Your order has been cleared.');
    } else {
      bot.reply(message, 'Delete request unsuccessful: Invalid User.');
    }
  });
});

controller.hears([prefix + 'clear all$'], ['ambient'], function(bot, message) {
  cur_coffee_orders = {};
  bot.reply(message, 'The current order list has been cleared.');
});
