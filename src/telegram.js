/* A (simpistic) library to post to Telegram */
ChatBot.platforms.telegram = {

  _post: function (method, params, callback) {
    var data = querystring.stringify(params)

    var request = {
      method: 'POST',
      host: 'api.telegram.org',
      port: 443,
      path: '/bot' + ChatBot.config.telegram.auth + '/' + method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      }
    }

    var req = https.request(request, function (res) {
      var d = ''
      res.setEncoding('utf8')

      res.on('data', function (chunk) {
        d += chunk
      })

      res.on('end', function () {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return callback(null, d)
        }
        return callback(null, false, d)
      })
    })
    req.on('error', callback)
    req.write(data)
    req.end()
  },

  // Sends a message to the chatId. Calls callback when done
  sendMessage: function (chatId, body, callback) {
    var data = {
      'chat_id': chatId,
      'parse_mode': 'Markdown'
    }

    // Simple text message
    if (typeof body === 'string') {
      data.text = body
      return ChatBot.platforms.telegram._post('sendMessage', data, callback)
    }

    // For each new item in the feed, let's send it to
    body.items.forEach(function (item) {
      var message = '[' + item.title + '](' + item.permalinkUrl + ')'
      message = [body.title, message].join(' - ')
      data.text = message
      return ChatBot.platforms.telegram._post('sendMessage', data, callback)
    })
  },

  setStatus: function (chatId, status, callback) {
    // Nothing!
  },

  // Parses a chat message
  parseChatMessage: function (request, onSetup, onMessages) {
    return onMessages([{
      from: request['body'] && request['body']['message'] && request['body']['message']['chat'] && request['body']['message']['chat']['id'],
      content: request['body'] && request['body']['message'] && request['body']['message']['text']
    }])
  },

  /**
   * Points Telegram webhooks to our bot
  */
  setWebhook: function (baseUrl, callback) {
    var data = {
      'url': [ChatBot.config.baseUrl, '?platform=telegram'].join('/')
    }
    return ChatBot.platforms.telegram._post('setWebhook', data, callback)
  }

}
