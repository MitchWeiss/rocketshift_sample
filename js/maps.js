var geocoder;
var map;
var circle;
var marker;

function codeAddress() {
	var address = $('#input-suburb').val();
	if (address == ""){
		return;
	}
	geocoder.geocode( {'address': address + ',au' }, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			map.setZoom(9);
			marker.setPosition(results[0].geometry.location);
			marker.setTitle(address);
			circle.setCenter(results[0].geometry.location);
			circle.setRadius(parseInt($('#input-distance').val())*1000);
		}
	});
}

function updateRadius(radius) {
	circle.setRadius(radius * 1000);
}

function init() {
	var mapDiv = document.getElementById('map-canvas');
	map = new google.maps.Map(mapDiv, {
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		streetViewControl: false,
		mapTypeControl: false,
	 });
	geocoder = new google.maps.Geocoder();
	circle = new google.maps.Circle({
		map: map, 
		strokeColor: '#66AFFF',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#66AFFF',
		fillOpacity: 0.35,
	});
	marker = new google.maps.Marker({map: map, draggable: false});

	if(!codeAddress()){
		map.setZoom(3);
		map.setCenter(new google.maps.LatLng(-26.988496, 134.220522));
	}

}

$(document).ready(function($){
  init();
});
