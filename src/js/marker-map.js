// Load a map and all the necessary markers based on the array returned from a JSON file. Should be called using initialiseMap(targetElement, feedName);
// Requires jQuery, Google Maps, infobox.js, spin.js and vivify.js.

// Initialise the global variables
var mapTarget;
var bounds = new google.maps.LatLngBounds();
var mapOptions;
var map;
var arrMarkers = [];
var infoBoxOptions;
var infoBox;
var infoBoxIndex;
var infoBoxContent;
var arrInfoBoxContent = [];
var arrData = [];
var regionName, brandColour, pathToFiles;   // These variables are set using the vivify.js script.


// Set the options
mapOptions = {
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  styles:[{
    featureType:"poi",
    elementType:"labels",
    stylers:[{
        visibility:"off"
    }]
  }]
}

infoBoxOptions = {
  disableAutoPan: false,
  maxWidth: 0,
  pixelOffset: new google.maps.Size(-120, -44),
  alignBottom: true,
  zIndex: null,
  boxClass: "infobox",
  boxStyle: { 
    width: "240px"
   },
  closeBoxMargin: "10px 2px 2px 2px",
  closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
  infoBoxClearance: new google.maps.Size(1, 1),
  isHidden: false,
  pane: "floatPane",
  enableEventPropagation: false
};


// Define the functions
function setInfoBox(currentMarker, currentContent) {
  google.maps.event.addListener(arrMarkers[currentMarker - 1], "click", function (e) {
    infoBoxIndex = arrInfoBoxContent[currentContent - 1];
    infoBox.open(map, this);
    infoBox.setContent(infoBoxIndex);
  });
};

function sortArray(prop, arr) {
  prop = prop.split('.');
  var len = prop.length;
  arr.sort(function (a, b) {
    var i = 0;
    while( i < len ) { x = a[prop[i]]; y = b[prop[i]]; i++; }
    if (x < y) {
      return -1;
    } else if (x > y) {
      return 1;
    } else {
      if (a.data.title < b.data.title) {
        return -1;
      } else if (a.data.title > b.data.title) {
        return 1;
      } else {
        return 0;
      }
    }
  });
  return arr;
};

function filterMarkers(arrFilterTargets) {
  for (i = 0; i < arrMarkers.length; i++) {
    var filterTarget = arrMarkers[i].get("category");
    var filterMatch = false;
    
    for (x = 0; x < arrFilterTargets.length; x++) {
      if (filterTarget == arrFilterTargets[x]) {
        filterMatch = true;
      }
    }
    
    if (filterMatch) {
      arrMarkers[i].setVisible(true);
    } else {
      arrMarkers[i].setVisible(false);
      if (infoBoxIndex = i) {
        infoBox.close();
      }
    }
  }
}

function arrangeByType(arrFilterTargets) {
  arrData = sortArray('type', arrData);
  var currentType = '';
  var headingText = '';
  var listText = '';
  for (i = 0; i < arrData.length; i++) {
    var filterTarget = arrData[i].type;
    var filterMatch = false;
    
    for (x = 0; x < arrFilterTargets.length; x++) {
      if (filterTarget == arrFilterTargets[x]) {
        filterMatch = true;
      }
    }
    if (filterMatch) {
      if (arrData[i].type != currentType) {
        if (currentType != '') {
          listText += "</ul>";
        }
        currentType = arrData[i].type;
        if (currentType == "park") {
          headingText = "Parks";
        } else if (currentType == "centre"){
          headingText = "Natural resources centres";
        } else if (currentType == "office"){
          headingText = "Natural resources offices";
        } else if (currentType == "community"){
          headingText = "Community-run centres";
        } else {
          headingText = currentType;
        }
        listText += "<h2>"+headingText+"</h2><ul>";
      }
      if (arrData[i].type == "centre" || arrData[i].type == "office" || arrData[i].type == "community") {
        listText += '<li><strong>'+arrData[i].data.title+'</strong><br />'+arrData[i].data.info+'</li>';
      } else if (arrData[i].type == "park") {
        listText += '<li><a hre'+'f="'+arrData[i].data.link+'" target="_blank">'+arrData[i].data.title+'</a></div>'
      } else {
        listText += '<li><strong><a hre'+'f="'+arrData[i].data.link+'">'+arrData[i].data.title+'</a></strong></li>'
      };
    }
  }
  if (currentType != '') {
    listText += "</ul>";
  } else {
    listText = "<p>No results found.</p>";
  }
  $("#map-list").html(listText);
}

function arrangeByName(arrFilterTargets) {
  arrData = sortArray('data.title', arrData);
  var currentCharacter = '';
  var headingText = '';
  var locationType = '';
  var typeText = '';
  var listText = '';
  for (i = 0; i < arrData.length; i++) {
    var filterTarget = arrData[i].type;
    var filterMatch = false;
    
    for (x = 0; x < arrFilterTargets.length; x++) {
      if (filterTarget == arrFilterTargets[x]) {
        filterMatch = true;
      }
    }
    
    if (filterMatch) {
      if (arrData[i].data.title.charAt(0) != currentCharacter) {
        if (currentCharacter != '') {
          listText += "</ul>";
        }
        currentCharacter = arrData[i].data.title.charAt(0);
        headingText = currentCharacter.toUpperCase();
        listText += "<h2>"+headingText+"</h2><ul>";
      }
      locationType = arrData[i].type;
      if (locationType == "centre" || locationType == "office" || locationType == "community") {
        if (locationType == "centre"){
          typeText = "Natural resources centre";
        } else if (locationType == "office"){
          typeText = "Natural resources office";
        } else if (locationType == "community"){
          typeText = "Community-run centre";
        }
        listText += '<li><strong>'+arrData[i].data.title+'</strong><br /><em>'+typeText+'</em><br />'+arrData[i].data.info+'</li>';
      } else if (arrData[i].type == "park") {
        listText += '<li><a hre'+'f="'+arrData[i].data.link+'" target="_blank">'+arrData[i].data.title+'</a></div>'
      } else {
        listText += '<li><strong><a hre'+'f="'+arrData[i].data.link+'">'+arrData[i].data.title+'</a></strong><br />'+locationType+'</li>';
      };
    }
  }
  if (currentCharacter != '') {
    listText += "</ul>";
  } else {
    listText = "<p>No results found.</p>";
  }
  $("#map-list").html(listText);
}

function applyFilters(typeChange) {
  var arrFilterTargets = [];
  $("#map-filter>ul input:checkbox").each(
    function() {
      if ($(this).is(':checked')) {
        arrFilterTargets.push($(this).val());
      };
    }
  );
  if ($("#map-sort>ul input:radio:checked").val() == "type") {
    arrangeByType(arrFilterTargets);
  } else if ($("#map-sort>ul input:radio:checked").val() == "name") {
    arrangeByName(arrFilterTargets);
  }
  if (typeChange) {
    filterMarkers(arrFilterTargets);
  }
}

function setFilters() {
  arrData = sortArray('type', arrData);
  var currentType = '';
  var headingText = '';
  var filterText = '';
  for (i = 0; i < arrData.length; i++) {
    if (arrData[i].type != currentType) {
      currentType = arrData[i].type;
      if (currentType == "park") {
        headingText = "Parks";
      } else if (currentType == "centre"){
        headingText = "Natural resources centres";
      } else if (currentType == "office"){
        headingText = "Natural resources offices";
      } else if (currentType == "community"){
        headingText = "Community-run centres";
      } else {
        headingText = currentType;
      }
filterText += '<li><input type="checkbox" name="category" value="'+currentType+'" checked onclick="applyFilters(true)"> '+headingText+'</li>';
    }
  }
  $("#map-filter>ul").html(filterText);
}

function loadMapData(regionName, targetElement) {
  $(targetElement).html('<div class="tab"><ul><li><span id="map-filter-toggle">Type</span><div id="map-filter" class="dropdown"><div class="pointer"></div><ul></ul></div></li><li><span id="map-sort-toggle">Sort</span><div id="map-sort" class="dropdown"><div class="pointer"></div><ul><li><input type="radio" name="sort" value="type" checked="" onclick="applyFilters()"> By type</li><li><input type="radio" name="sort" value="name" onclick="applyFilters()"> Alphabetically</li></ul></li></ul></div><div id="map" class="no-mobile"></div><div id="map-list"></div>');
  
  mapTarget = document.getElementById('map');
  map = new google.maps.Map(mapTarget, mapOptions);
  infoBox = new InfoBox(infoBoxOptions);
  
  for (var i = 0; i < arrData.length; i++) {
    var title = arrData[i].data.title;
    var latLng;
    
    if ((arrData[i].data.location.latitude != undefined) && (arrData[i].data.location.longitude)) {
      latLng = new google.maps.LatLng(arrData[i].data.location.latitude, arrData[i].data.location.longitude);
    } else {
      continue;
    }
    
    var iconOptions = {
      url: pathToFiles+regionName+"-marker-general.png",
      size: new google.maps.Size(49, 88),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(12, 44),
      scaledSize: new google.maps.Size(24, 44)
    };
    
    if (arrData[i].type == "centre") {
      iconOptions.url = pathToFiles+regionName+"-marker-centre.png";
    } else if (arrData[i].type == "office") {
      iconOptions.url = pathToFiles+regionName+"-marker-office.png";
    } else if (arrData[i].type == "community") {
      iconOptions.url = pathToFiles+regionName+"-marker-community.png";
    } else if (arrData[i].type == "park") {
      iconOptions.url = pathToFiles+regionName+"-marker-park.png";
    } else if (arrData[i].type == "Climate change") {
      iconOptions.url = "/files/0/511/regional-marker-climate-change.png";
    } else if (arrData[i].type == "Coast and marine") {
      iconOptions.url = "/files/0/511/regional-marker-coast-marine.png";
    } else if (arrData[i].type == "Community") {
      iconOptions.url = "/files/0/511/regional-marker-community.png";
    } else if (arrData[i].type == "Land") {
      iconOptions.url = "/files/0/511/regional-marker-land.png";
    } else if (arrData[i].type == "Native species") {
      iconOptions.url = "/files/0/511/regional-marker-native-species.png";
    } else if (arrData[i].type == "Water") {
      iconOptions.url = "/files/0/511/regional-marker-water.png";
    } else if (arrData[i].type == "Wetlands and floodplains") {
      iconOptions.url = "/files/0/511/regional-marker-wetlands-floodplains.png";
    };
     
    arrMarkers.push(new google.maps.Marker({title: title, position:latLng, map: map, icon: iconOptions, category: arrData[i].type}));
    bounds.extend(latLng);
    
    infoBoxContent = document.createElement("div");
    infoBoxContent.className = "wrapper";
    if (arrData[i].type == "centre" || arrData[i].type == "office" || arrData[i].type == "community") {
      infoBoxContent.innerHTML = '<div class="pointer"></div><div class="panel">'+arrData[i].data.title+'<br />'+arrData[i].data.info+'</div>';
    } else if (arrData[i].type == "park") {
      infoBoxContent.innerHTML = '<div class="pointer"></div><div class="panel"><a href="'+arrData[i].data.link+'" target="_blank">'+arrData[i].data.title+'</a></div>';
    } else {
      if (arrData[i].data.link !== undefined) {
        infoBoxContent.innerHTML = '<div class="pointer"></div><div class="panel"><a href="'+arrData[i].data.link+'">'+arrData[i].data.title+'</a></div>';
      } else {
        infoBoxContent.innerHTML = '<div class="pointer"></div><div class="panel">'+arrData[i].data.title+'</div>';
      }
    }
    arrInfoBoxContent.push(infoBoxContent);
    
    setInfoBox(arrMarkers.length, arrInfoBoxContent.length);
  }
  
  // Add an event listener to ensure the map isn't zoomed in too far on page load
  google.maps.event.addListenerOnce(map, "zoom_changed", function() {
    if (map.getZoom() > 12) {
      map.setZoom(12);
    }
  })
  
  map.fitBounds(bounds);
  setFilters();
  applyFilters();
  
  // If the device is a touch device, add menu toggles for the dropdowns
  if ($('html').hasClass('touch')) {
    $('#map-container .tab .dropdown').each(function() {
      var currentID = $(this).attr("id");
      setMenuToggle("#"+currentID, "#"+currentID+"-toggle", true);
    })
  }
}

function checkArray(arrayData) {
  // Interate the array backwards so the indicies of the items that haven't yet been checked don't change
  for(var i = arrayData.length - 1; i >= 0; i--) {
    if (!("data" in arrayData[i])|| !("type" in arrayData[i])) {
      // Remove remove any items that don't have the required properties
      arrayData.splice(i, 1);      
    }
  }
  return arrayData;
}

// Initialise the map and loader
function initialiseMap(targetElement, feedName) {
  // Encode the feed name
  feedName = encodeURIComponent(feedName);
  
  var spinnerOptions = {
    lines: 11, // The number of lines to draw
    length: 0, // The length of each line
    width: 12, // The line thickness
    radius: 24, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: brandColour, // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  };
  $(targetElement).prepend('<div id="spinner-container" style="min-height:10em"></div>');
  var spinnerTarget = document.getElementById('spinner-container');
  var spinner = new Spinner(spinnerOptions ).spin(spinnerTarget);
  
  $.getJSON("/feed.rss?listname="+feedName, function(data) { arrData = checkArray(data); loadMapData(regionName, targetElement) }).always(function() { spinner.stop() }).fail(function() { $("#spinner-container").remove(); $(targetElement+">.no-js").removeClass("no-js"); });
}