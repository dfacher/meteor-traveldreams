var markers = [];

Template.maps.rendered =function() {
    
    var geocoder = null;
    
    GoogleMaps.init(
        {
            'sensor': true, //optional
            'key': 'AIzaSyCe6OMRdS0ILwXGk4oamtLFntDWm71k-aI', //optional
            'language': 'en' //optional
        }, 
        function(){
            var mapOptions = {
                zoom: 2,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                draggable: false,
            };
            map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions); 
            map.setCenter(new google.maps.LatLng( 35.637, 7.557 ));
            
            Template.maps.geocoder = new google.maps.Geocoder();
            
            //initial drawing of map
            var dreams = Dreams.find({location : { $exists : true, $nin: [""] }  }).fetch();
            Template.maps.setMarkers(dreams);
        }
    );    
}

Template.maps.resetMarkers = function(){
    Template.maps.clearMarkers();
    var dreams = Dreams.find({location : { $exists : true, $nin: [""] }  }).fetch();
    Template.maps.setMarkers(dreams);
    
}

Template.maps.setMarkers = function(dreams){
    validGeoLocation = function(el, callback){
        Template.maps.geocoder.geocode( { 'address': el.location}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK && results.length < 3) {
                el.MapLoc = results[0];
                return callback(true);
            }
            else{
                callback(false);                }
        });
    };

    async.filter(dreams, validGeoLocation, function(results){
        /*var iconM = new google.maps.Symbol({
                    strokeColor: "#1abc9c"});*/
        
        for (k in results){
            var marker = new google.maps.Marker({
                map: map,
                position: results[k].MapLoc.geometry.location,
                title: results[k].activity,
            });
            markers.push(marker);
        }
    });
}

// Sets the map on all markers in the array.
Template.maps.setAllMap = function (map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

Template.maps.clearMarkers = function(){
   Template.maps.setAllMap();
}
    