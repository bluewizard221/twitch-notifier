#!/usr/local/bin/node

const TwitchWebhook = require('twitch-webhook')
const twitter = require('twitter')
const request = require('request')
const fs = require('fs')
const confFile = require('config')
const log4js = require('log4js')

log4js.configure({
  appenders: { system: { type: 'dateFile', filename: 'logs/twitch-notifier.log', pattern: "-yyyyMMdd", compress: true } },
  categories: { default: { appenders: ['system'], level: 'debug' } }
})

const logger = log4js.getLogger('system')

const pidFile = confFile.config.pidFile

if (!pidFile) {
  logger.error('Pidfile is not provided')
  process.exit(1)
}

const clientId = confFile.config.twitchClientId

if (!clientId) {
  logger.error('Twitch Client ID not provided')
  process.exit(2)
}

const callBack = confFile.config.twitchCallBack

if (!callBack) {
  logger.error('Callback URL not provided')
  process.exit(3)
}

const twitchUserId = confFile.config.twitchUserId

if (!twitchUserId) {
  logger.error('twitch user_id not provided')
  process.exit(4)
}

const twitchSecret = confFile.config.twitchSecret

if (!twitchSecret) {
  logger.error('twitch secret for webhook api not provided')
  process.exit(5)
}

const twitchOAuthtoken = confFile.config.twitchOAuthtoken

if (!twitchOAuthtoken) {
  logger.error('twitch OAuth token for webhook api not provided')
  process.exit(5)
}

const twitchChannel = confFile.config.twitchChannel

if (!twitchChannel) {
  logger.error('twitch channel URL not provided')
  process.exit(6)
}

const discordWebhookURL = confFile.config.discordWebhookURL

if (!discordWebhookURL) {
  logger.error('discord webhook URL not provided')
  process.exit(7)
}

const twi_api = new twitter({
	consumer_key: confFile.config.twitterConsumerKey,
	consumer_secret: confFile.config.twitterConsumerSecret,
	access_token_key: confFile.config.twitterAccessTokenKey,
	access_token_secret: confFile.config.twitterAccessTokenSecret,
})

const twitchWebhook = new TwitchWebhook({
  client_id: clientId,
  callback: callBack,
  secret: twitchSecret,
  oauth_token: twitchOAuthtoken,
  listen: {
    port: 3000,
    autoStart: true
  }
})

fs.writeFile(pidFile, process.pid.toString(), (err) => {
  if (err) {
    logger.error(err)
  }
})

function twitterpost(game_name, streaming_title) {
    var content = 'Live: ' + game_name + '\n\n'
    content += streaming_title + '\n\n'
    content += twitchChannel

    twi_api.post('statuses/update',
		 {status: content},
		 function(error, tweet, response) {
	if (error) {
	    logger.error(error)
	}
    })

    const discordwhoptions = {
	url: discordWebhookURL,
	method: 'POST',
	headers: {
		"Content-type": "application/json",
	      },
	json: {
		"username": "scartwitchnotifier",
		"content": "<@&784406554236944405> " + content,
	}
    }

    request(discordwhoptions, function (error, response, body) {
	if (!error) {
	    //success
	    logger.info('posting infomation to discord webhook succeeded')
	} else {
	    //sending request error
	    logger.error(error)
	}
    })
}

// set listener for streaming topic
twitchWebhook.on('streams', ({ event }) => {
    logger.debug(event)

    if (event.data.length < 1) {
	logger.error('empty data')
	return
    }

    const queryURL = 'https://api.twitch.tv/helix/games?id=' + Number(event.data[0].game_id)

    const headers = {
	'Client-ID': clientId,
	'Authorization': 'Bearer ' + twitchOAuthtoken,
    }

    const options = {
	url: queryURL,
	method: 'GET',
	headers: headers,
	json: true
    }

    if (event.data[0].game_id == '0' || event.data[0].game_id == '') {
	twitterpost('', event.data[0].title)
    } else {
	request(options, function (error, response, body) {
	    if (!error) {
		//success
		twitterpost(body.data[0].name, event.data[0].title)
	    } else {
		//sending request error
		logger.error(error)
	    }
	})
    }
})


// subscribe 
twitchWebhook.subscribe('streams', {
  user_id: twitchUserId
})

// process event handlers
process.on('SIGINT', () => {
  logger.info('SIGINT caught. unsubscribe then shutdown..')

  twitchWebhook.unsubscribe('*')

  process.exit(0)
})

process.on('SIGHUP', () => {

  if (process.argv[2] != '-d') {
    logger.info("SIGHUP caught, but i am not daemon. now shutting down myself..")

    process.exit(0);
  }

  logger.info('SIGHUP caught. unsubscribe then re-subscribe..');

  // unsubscribe from all topics
  twitchWebhook.unsubscribe('*')

  logger.info('unsubscribed. resubbing...')
  
  // subscribe again
  twitchWebhook.subscribe('streams', {
    user_id: twitchUserId
  })

  logger.info('re-subscribed.')
})
