#!/usr/local/bin/node

const confFile = require('config');
const log4js = require('log4js');
const fs = require('fs');
const { ClientCredentialsAuthProvider } = require('@twurple/auth');
const { ApiClient } = require('@twurple/api');
const {
	DirectConnectionAdapter,
	EventSubChannelUpdateEvent,
	EventSubListener,
} = require('@twurple/eventsub');
const { NgrokAdapter } = require('@twurple/eventsub-ngrok');
const twitter = require('twitter');
const Discord = require('discord.js');

log4js.configure({
  appenders: { system: { type: 'dateFile', filename: 'logs/twitch-notifier.log', pattern: "-yyyyMMdd", compress: true } },
  categories: { default: { appenders: ['system'], level: 'debug' } }
});

const logger = log4js.getLogger('system');

if (!confFile.config.pidFile) {
  logger.error('Pidfile is not provided');
  process.exit(1);
}

if (!confFile.config.twitchClientId) {
  logger.error('Twitch Client ID not provided');
  process.exit(2);
}

if (!confFile.config.twitchUserName) {
  logger.error('twitch username not provided');
  process.exit(4);
}

if (!confFile.config.twitchSecret) {
  logger.error('twitch secret for webhook api not provided');
  process.exit(5);
}

if (!confFile.config.twitchChannel) {
  logger.error('twitch channel URL not provided');
  process.exit(6);
}

if (!confFile.config.discordChannel) {
  logger.error('discord channel not provided');
  process.exit(7);
}

if (!confFile.config.discordToken) {
  logger.error('discord token not provided');
  process.exit(7);
}

if (!confFile.config.discordRoleId) {
  logger.error('discord roll id is not provided');
  process.exit(7);
}

const DiscordClient = new Discord.Client({
  intents: Discord.Intents.FLAGS.GUILDS | Discord.Intents.FLAGS.GUILD_MESSAGES
});

const twi_api = new twitter({
  consumer_key: confFile.config.twitterConsumerKey,
  consumer_secret: confFile.config.twitterConsumerSecret,
  access_token_key: confFile.config.twitterAccessTokenKey,
  access_token_secret: confFile.config.twitterAccessTokenSecret,
});

fs.writeFile(confFile.config.pidFile, process.pid.toString(), (err) => {
  if (err) {
    logger.error(err);
  }
});

const authProvider = new ClientCredentialsAuthProvider(confFile.config.twitchClientId, confFile.config.twitchSecret);
const apiClient = new ApiClient({ authProvider: authProvider });
const secret = Math.random().toString(32).substring(2);

const listener = new EventSubListener({
	apiClient,
	adapter: new NgrokAdapter(),
	secret
});

function twitterpost(game_name, streaming_title) {
    var content = 'Live: ' + game_name + '\n\n';
    content += streaming_title + '\n\n';
    content += confFile.config.twitchChannel;

    twi_api.post('statuses/update',
		 {status: content},
		 function(error, tweet, response) {
      if (error) {
        logger.error(error);
      }
    });

    DiscordClient.channels.cache.get(confFile.config.discordChannel).send(
	"<@&" + confFile.config.discordRoleId + "> " + content
    );
}

async function init(){
  try {
    await apiClient.eventSub.deleteAllSubscriptions();
    await listener.listen();
    await DiscordClient.login(confFile.config.discordToken);
  } catch(err) {
    logger.error(err);
  }
}

// set listener for streaming topic
async function twitchsubscribe(){
  try {
    const user = await apiClient.users.getUserByName(confFile.config.twitchUserName);

    await listener.subscribeToStreamOnlineEvents(user.id, event => {
	let status;

	(async function(){
	    status = await event.getStream();
	    twitterpost(status.gameName, status.title);
	})();
    });
  } catch(err) {
    logger.error(err);
  }
}

// process event handlers
process.on('SIGINT', () => {
  logger.info('SIGINT caught. unsubscribe then shutdown..');

  (async function(){
    await apiClient.eventSub.deleteAllSubscriptions();
  })();

  process.exit(0);
})

process.on('SIGHUP', () => {

  if (process.argv[2] != '-d') {
    logger.info("SIGHUP caught, but i am not daemon. now shutting down myself..");

    process.exit(0);
  }

  logger.info('SIGHUP caught. unlisten/unsubscribe then re-subscribe..');

  // unsubscribe from all topics
  (async function(){
    await apiClient.eventSub.deleteAllSubscriptions();
    await listener.unlisten();
  })();

  logger.info('unlistened. resubbing...');
  
  // subscribe again
  (async function(){
    await listener.listen();
  })();

  twitchsubscribe();

  logger.info('re-subscribed.');
})

init();
twitchsubscribe();
