var setCreateMarkerArrayEvent = function(mapId, sourceId, callback, timeout) {

	var responseCount = 0;

	var setGeocodingEvent = function(geocoder, markerArray, tsv, idx) {
		geocoder.geocode({'address': tsv[idx][1]}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var p = results[0].geometry.location;
				markerArray.push({listId: tsv[idx][0], position: new google.maps.LatLng(p.lat(), p.lng())});
			} else {
				console.log(status);
			}
			responseCount++;
		});
	};

	var markerSource = document.getElementById(sourceId);
	if (markerSource == null) {
		return null;
	}

	var tsv = $.tsv.parseRows(markerSource.value);
	var markerArray = new Array();

	var geocoder = new google.maps.Geocoder();

	requestCount = 0;
	for (var i = 0; i < tsv.length; i++) {
		setTimeout(function() {
			setGeocodingEvent(geocoder, markerArray, tsv, requestCount);
			requestCount++;
		}, 1000 * i);
	}

	var startTime = $.now();
	var timerResponseEvent = setInterval(function() {
		if (responseCount == tsv.length) {
			callback(mapId, null, markerArray, true);
			clearInterval(timerResponseEvent);
		}

		if ($.now() - startTime > timeout) {
			clearInterval(timerResponseEvent);
		}
	}, 50);
};

var viewGoogleMap = function(id, option, markerArray, isNumberPin) {

    var setMarkerData = function(makerArray) {
        for (var i = 0; i < makerArray.length; i++) {
        	var marker = new google.maps.Marker({
        		position: makerArray[i].position,
        		map: gmap,
        		icon: isNumberPin ? new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + parseInt(markerArray[i].listId) + "|ff7e73|000000") : null,
        		shadow:isNumberPin ? new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",null, null, new google.maps.Point(12, 35)) : null
        	});
        }
    }; 

    option = option ? option : {};   
    var mapOption = {
    	zoom: option.zoom || 16,
    	center: option.center || new google.maps.LatLng(0.0, 0.0),
    	mapTypeId: google.maps.MapTypeId.ROADMAP,
    	navigationControlOptions: {
    		style: google.maps.NavigationControlStyle.DEFAULT
    	}
    };
  
    var gmap = new google.maps.Map(document.getElementById(id), mapOption);
    var openInfoWindow;  
  
    if (markerArray.length > 0) {
    	setMarkerData(markerArray);
    	gmap.setCenter(markerArray[0].position);
    }
};

var scrollToBottom = function(selector) {
    $('html,body').animate({scrollTop: $(selector).offset().top},'slow');
};

function submit() {
	initialize('gmap_canvas', 'address_data');
	scrollToBottom("#bottom");
}

function initialize(mapId, sourceId) {
	setCreateMarkerArrayEvent(mapId, sourceId, viewGoogleMap, 100000); // timeout: 10[s]
};
