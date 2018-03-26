var countries = [];

$( document ).ready(function() {
    console.log( "ready!" );
    $.ajax({
		type: "GET",
		url: "https://restcountries.eu/rest/v2",
		dataType: 'json',
		crossDomain: 'true',
		success: function (data){
			//console.log(data);
			$.each(data, function(index, value){
				console.log("name : "+index +value['name']);
				console.log("flag : "+value['flag']);
				var name = value['name'];
				countries.push(name);
			});
			console.log(countries);
			console.log(countries.length);
			console.log(countries[2]["flag"]);
		},
		error: function (data) {
			console.log("error");
		}
	});

	
	
});

function nextGame(){
		var i  =  Math.floor(Math.random() * Math.floor(250));
		$("#flag").attr("src", countries[i]['flag']);
	}


$(document).ready(function(){
	$("#textfield_message").autocomplete({
		source : countries,
		select: function (event, ui) {
        $("#textfield_message").val(ui.item.value);
    },
		minLength : 3

	});
});