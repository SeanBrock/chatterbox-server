/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var fs = require('fs');
var messages = [];
messages.push({
  username: 'Not Jono',
  message: 'Do my bidding even harder!',
  text: 'Do my bidding even harder!'
});
var urlParse = require('url');
var queryString = require('querystring');

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'application/json'
};

var sendResponse = function(response, data, statusCode) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

var getFavicon = function (request, response) {
  fs.readFile('./favicon.ico', (err, data) => {
    if (err) { throw err; }
    response.writeHead(200, {'Content-Type': 'image/x-icon'});
    response.end(data, 'text/plain');
  });

};

var getMessages = function(request, response) {
  response.writeHead(200, headers);

  response.end(JSON.stringify({results: messages}));
};

var postMessages = function(request, response) {
  var body = '';
  request.on('data', function (chunk) {
    body += chunk;
  });
  request.on('end', function () {
    //console.log('request ended',body);
    var messageToAdd = {
      roomname: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    //console.log('body of request: ' + JSON.stringify(queryString.parse(body)));
    var parsedInputMessage = queryString.parse(body);
    var parsedKeys = Object.keys(parsedInputMessage);
    for (var i = 0; i < parsedKeys.length; i++) {
      messageToAdd[parsedKeys[i]] = parsedInputMessage[parsedKeys[i]];
    }
    messageToAdd.objectId = messages.length;
    if (!messageToAdd.hasOwnProperty('text')) {
      response.writeHead(400, headers);
      response.end(JSON.stringify({error: 'Missing "message" key from post request.'}));
    } else if (!messageToAdd.hasOwnProperty('username')) {
      response.writeHead(400, headers);
      response.end(JSON.stringify({error: 'Missing "username" key from post request.'}));
    } else {
      messages.push(messageToAdd);
      response.writeHead(201, headers);
      response.end(JSON.stringify(messageToAdd));
    }
  });

};


//define r
var routes = {
  'GET': {
    '/favicon.ico': getFavicon,
    '/classes/messages': getMessages
  },
  'POST': {
    '/classes/messages': postMessages
  }
};
var requestHandler = function(request, response) {
  //http://127.0.0.1:3000/classes/messages?order=-createdAt
  var parsedUrl = urlParse.parse(request.url);
  console.log('pathname of url: ' + parsedUrl.pathname);
  console.log('Serving request type ' + request.method + ' for url ' + parsedUrl.pathname);
  //console.log('request headers: ', request.headers);
  if (routes.hasOwnProperty(request.method) && routes[request.method].hasOwnProperty(parsedUrl.pathname)) {
    routes[request.method][parsedUrl.pathname](request, response);
  } else if (request.method === 'OPTIONS') {
    sendResponse(response, 'hi', 200);
  } else {
    response.writeHead(404, headers);
    response.end('No route available');
  }


};



module.exports.requestHandler = requestHandler;

