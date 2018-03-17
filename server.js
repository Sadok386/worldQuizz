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
var joueurs = [];
var nameCountry = "";
var scoreGagnant = 0;
io.sockets.on('connection', function (socket) {
	console.log('Un client est connecté !');
	// Quand un client se connecte, on lui envoie un message
	socket.emit('message', 'Vous êtes bien connecté !');
	// On signale aux autres clients qu'il y a un nouveau venu
	socket.broadcast.emit('message', 'Un autre client vient de se connecter ! ');
	// Dès qu'on nous donne un pseudo, on le stocke en variable de session
	socket.on('petit_nouveau', function(pseudo) {
		socket.pseudo = pseudo;
		
		var player = new Object();
		player.name = pseudo;
		player.score = 0;
		player.ready = false;
		joueurs[joueurs.length] = player;
		console.log("joueurs new: "+joueurs);

		socket.broadcast.emit('newPlayer', joueurs);
		socket.emit('newPlayer', joueurs);
	});
	// Dès qu'on reçoit un "message" (clic sur le bouton), on le note dans la console
	socket.on('message', function (message) {
		// On récupère le pseudo de celui qui a cliqué dans les variables de session
		console.log(socket.pseudo + ' me parle ! Il me dit : ' + message);
		socket.broadcast.emit('message', "["+socket.pseudo+"] "+ message);
		if(message == nameCountry){
			socket.broadcast.emit('message', "["+socket.pseudo+"] a gagné!");
			socket.emit('message', "Vous a gagné!");
			console.log("joueur length "+joueurs.length)
			for (i = 0, len = joueurs.length; i < len; ++i) {
				console.log(joueurs[i].name);
			    if(joueurs[i].name == socket.pseudo){
			    	joueurs[i].score++;
			    	scoreGagnant = joueurs[i].score;
			    }
			}
			if(scoreGagnant == 2)
				{for (i = 0, len = joueurs.length; i < len; ++i) {
					joueurs[i].score = 0;
					joueurs[i].ready = false;
				}
				socket.emit('winner', socket.pseudo, joueurs);
				socket.broadcast.emit('winner', socket.pseudo, joueurs);
				
			}else{
				var i  =  Math.floor(Math.random() * Math.floor(250));
				nameCountry = countries[i].name;
				socket.emit('newGame', countries[i].flag);
				socket.broadcast.emit('newGame', countries[i].flag);
				console.log("nom du drapeau : "+nameCountry);
				socket.broadcast.emit('changeScore', joueurs);
				socket.emit('changeScore', joueurs);
			}
		
		}

	});
	socket.on('ready', function () {
		// On récupère le pseudo de celui qui a cliqué dans les variables de session
		console.log(socket.pseudo + ' est prêt!');
		var allReady = true;
		socket.broadcast.emit('message', "["+socket.pseudo+"] est prêt !");
		console.log("joueurs ready: "+joueurs.length);
		for (i = 0, len = joueurs.length; i < len; ++i) {
		    if(joueurs[i].name == socket.pseudo){
		    	joueurs[i].ready = true;
		    }
		}

		socket.broadcast.emit('newPlayer', joueurs);
		socket.emit('newPlayer', joueurs);
		for (i = 0, len = joueurs.length; i < len; ++i) {
		    if(!joueurs[i].ready){
		    	allReady = false;
		    }
		}

		if(allReady){
			console.log("Tout le monde est pret!");
			socket.emit('message', 'Tout le monde est pret');
			socket.broadcast.emit('message', "Tout le monde est pret");
			var i  =  Math.floor(Math.random() * Math.floor(250));
			nameCountry = countries[i].name;
			socket.emit('newGame', countries[i].flag);
			socket.broadcast.emit('newGame', countries[i].flag);
			console.log("nom du drapeau : "+nameCountry);
			socket.broadcast.emit('changeScore', joueurs);
			socket.emit('changeScore', joueurs);
		}
		socket.score = 0;
	});
});

io.sockets.on( 'disconnect', function () {
    console.log( 'disconnected to server' );
    
} );
server.listen(8080);