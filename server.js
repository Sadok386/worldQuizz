var express = require('express');
var http = require("http");
var ejs = require('ejs');
var app = express();
const Request = require('request');
var server = http.createServer(app);
var countries = [];
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

Request.get('https://restcountries.eu/rest/v2', function (error, response, body) {
			if (error) {
				throw error;
			}
			var i = 0;
			const data = JSON.parse(body);
			data.forEach(function(value) {
  				var country = new Object();
				country.name = value['name'];
				country.flag = value['flag'];
				countries[i] = country;
				i++;
			});
			console.log(countries);
			//console.log(data);
});
// --- Routing pour todolist --
app.get('/',function(req,res){
 // -- Racine --
	res.render('socket',{ title: 'app socket.io'}); 

})
// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
var joueurs = 0;
var joueursReady = 0;
io.sockets.on('connection', function (socket) {
	console.log('Un client est connecté !');
	// Quand un client se connecte, on lui envoie un message
	socket.emit('message', 'Vous êtes bien connecté !');
	// On signale aux autres clients qu'il y a un nouveau venu
	socket.broadcast.emit('message', 'Un autre client vient de se connecter ! ');
	// Dès qu'on nous donne un pseudo, on le stocke en variable de session
	socket.on('petit_nouveau', function(pseudo) {
		socket.pseudo = pseudo;
		joueurs ++;
	});
	// Dès qu'on reçoit un "message" (clic sur le bouton), on le note dans la console
	socket.on('message', function (message) {
		// On récupère le pseudo de celui qui a cliqué dans les variables de session
		console.log(socket.pseudo + ' me parle ! Il me dit : ' + message);
		socket.broadcast.emit('message', "["+socket.pseudo+"] "+ message);
	});
	socket.on('ready', function () {
		// On récupère le pseudo de celui qui a cliqué dans les variables de session
		console.log(socket.pseudo + ' est prêt!');
		socket.broadcast.emit('message', "["+socket.pseudo+"] est prêt !");
		joueursReady ++;
		if(joueurs == joueursReady){
			console.log("Tout le monde est pret!");
			socket.emit('message', 'Tout le monde est pret');
			socket.broadcast.emit('message', "Tout le monde est pret");
			var i  =  Math.floor(Math.random() * Math.floor(250));
			socket.emit('newGame', countries[i].flag,  countries[i].name);
			socket.broadcast.emit('newGame', countries[i].flag,  countries[i].name);
		}
		socket.score = 0;
	});
});
server.listen(8080);