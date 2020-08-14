console.log('start');
let map = { map: 'map object'};

//TODO
// X initialise map

// X get data

// create infoBox's

// create icons

// X create left hand list

// create filter buttons to affect left hand list & map icons
//   (event listeners on buttons)
//   (filter arrays and redraw dom objects)

// test on mobile / don't load map on mobile

// tie in with google maps navigation (create links)

// create print styles?

// test in IE11

// a function to redraw list & map on change



const domain = window.location.origin;
console.log(domain);


//get data
function initialiseMap (mapContainer, mapDataSrc) {

    var aMapItems = [];
    let url = '';

    if ( domain.match('\/\/localhost:') ) {
        url = domain + '/AMLR-JSON-find-us.json';   //path to local data
        console.log(url);
    } else {
        url = domain + '/feed.rss?listname=AMLR%20JSON%20find%20us';   //path to remote data
    }

    console.log('url');
    console.log(url);
    var dataReceived = false;

    fetch(url).then( response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    } )
    .then( (data) => {
        // do something with the data
        // console.log(data);
        dataReceived = true;
        createDomElements(mapContainer, data);
        // createMap(data);
    } )
    .catch( (error) => {
        if(dataReceived) {
            // console.log('hasData: ', hasData);
            console.log( 'error ', error );
        } else {
            console.log( 'error fetching map data from ' + url, error );
        }
    } )
}

//filter data
function filterData(mapItemsData, filterMethod, sortMethod) {
    const data = mapItemsData.filterByType('park');
    return data;
}

function onlyParks(item) {
    if (item.type === 'park') {
        return true;
    }
}

// sort by name
function sortData(dataList) {
    dataList.sort(function(a, b) {
        var typeA = a.type.toLowerCase(); // ignore upper and lowercase
        var typeB = b.type.toLowerCase(); // ignore upper and lowercase
        if (typeA < typeB) {
          return -1;
        }
        if (typeA > typeB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
      return dataList;
    //   console.log('endList: ', dataList);
}

//create dom elements
function createDomElements(mapContainer, mapItemsData) {
    //create class=tab, #map, #map-list
    var domElements = ['.tab', '#map', '#map-list'];

    var typesArray = [];
    // var findTypesInData = (item) => {
    //     console.log('item', item);
    //     if(item.type.match(typesArray[i]) ) {
    //         return false;
    //     } else {
    //         typesArray.push(item.type); //otherwise add to array
    //         return true;
    //     }
    // };

    var sortedList = sortData(mapItemsData);
//    console.log('sortedList', sortedList);


    var pointsBounds = mapItemsData.reduce( (accumulator, currentValue) => {
        if(currentValue.data.location.latitude) {
            // console.log('good');
            var currentLat = currentValue.data.location.latitude;
            var currentLon = currentValue.data.location.longitude;
        }
        else { //if no latitude defined
            console.log('poor');
            var currentLat = accumulator.max.lat;
            var currentLon = accumulator.max.lon;
        }
        if(!accumulator.max) {
            // console.log('first only?');
            accumulator = { max: {lat: currentLat, lon: currentLon}, min: {lat: currentLat, lon: currentLon} };
        }
        // console.log('accumulator.max.lat ', accumulator.max.lat);
        // console.log('currentLat ', currentLat);
        accumulator.max.lat = Math.max(...[accumulator.max.lat, currentLat]);
        // console.log('Math max accumulator.max.lat ', accumulator.max.lat);
        accumulator.max.lon = Math.max(accumulator.max.lon, currentLon);
        accumulator.min.lat = Math.min(accumulator.min.lat, currentLat);
        accumulator.min.lon = Math.min(accumulator.min.lon, currentLon);
        // console.log('accumulator: ', accumulator);
        return accumulator;
    });

    console.log( 'points Bounds', pointsBounds );

    var difference = (a, b) => { return Math.abs(a - b); };

    var centerPoint = (boundsObject) => {
        const centerLat = boundsObject.min.lat + (difference(boundsObject.min.lat, boundsObject.max.lat) / 2);
        const centerLon = boundsObject.min.lon + (difference(boundsObject.min.lon, boundsObject.max.lon) / 2);
        return [ centerLon , centerLat ];
    }
    // console.log('center point: ', centerPoint(pointsBounds));


    //create #map
    //create map element for map
    const mapFragment = fragmentFromString('<div id="map" class="map"></div>');
    createMap(sortedList, centerPoint(pointsBounds));
    //call createMap(mapItemsData); function here?


    function createTypesArray (obj) {
        const thing = obj;
//        console.log('item:', thing.type);

        typesArray.push(obj.type); //add to array
        if(typesArray.length > 2){
            if(typesArray[typesArray.length] == typesArray[typesArray.length -1]) {
                typesArray.pop();
            }
        }
        // console.log(typesArray);
        return obj.type;
    }

    var mapItemsDataTypes = sortedList.map( item => actionsController(item) ); //findTypesInData(this)









    function actionsController(itemObject) {  //remember we are in a loop over mapItemsData
        var typesList = item => createTypesArray(item);
    //    console.log(typesList);
        //do something with typesList


    }
        // console.log(typesArray);
        // typesArray.forEach(value => {
        //     if (typesArray.indexOf(value) === -1) array.push(value);
        // });
        // for (let index = 0; index < typesArray.length; index++) {
        //     const element = typesArray[index];
        //     if( thing.type.match(element.toLowerCase()) ) {
        //         console.log('thing.type:', thing.type);
        //         return;
        //     }
        //     console.log(add);

        // }


//    console.log(mapItemsDataTypes);

    // mapItemsData = mapItemsData.filter(onlyParks);

    const domTarget = document.querySelector(mapContainer);  //domTarget is #map-container
    var bigFragment = document.createDocumentFragment();


    //create .tab and content
    var tabHtmlString = '<div class="tab"><ul><li><span id="map-filter-toggle">Type</span><div id="map-filter" class="dropdown"><div class="pointer"></div><ul><li><input type="checkbox" name="category" value="centre" checked="" onclick="applyFilters(true)"> Natural resources centres</li><li><input type="checkbox" name="category" value="community" checked="" onclick="applyFilters(true)"> Community-run centres</li><li><input type="checkbox" name="category" value="park" checked="" onclick="applyFilters(true)"> Parks</li></ul></div></li><li><span id="map-sort-toggle">Sort</span><div id="map-sort" class="dropdown"><div class="pointer"></div><ul><li><input type="radio" name="sort" value="type" checked="" onclick="applyFilters()"> By type</li><li><input type="radio" name="sort" value="name" onclick="applyFilters()"> Alphabetically</li></ul></div></li></ul></div><!-- /End tab div -->';
    var tabFragment = fragmentFromString(tabHtmlString);

    bigFragment.appendChild(tabFragment);



    //* Determining if .tab or id #map or #map-list */
    // for (let i = 0; i < domElements.length; i++) {
    //     const element = domElements[i];

    //     var item = document.createElement('div');
    //     var elementType = '';

    //     if(element && element.charAt(0).match('#')) {  //id
    //         var elementType = 'id';
    //     } else if(element && element.charAt(0).match('.')) {  //class
    //         var elementType = 'class';
    //     } else {
    //         console.error('element error. ');
    //     }

    //     item.setAttribute(elementType, element.substring(1));

    //     // item.innerHTML = 'domItem ' + element;
    //     if(element == '.tab') {
    //         item.setAttribute('class', 'no-mobile');
    //         item.setAttribute('style', 'position: relative;overflow: hidden;');
    //     }
    //     if(element == '#map') {
    //         item.setAttribute('class', 'no-mobile');
    //         item.setAttribute('style', 'position: relative;overflow: hidden;');
    //     }

    //     domTarget.appendChild(item);
    // }



    //loop throught mapItemsData
    //create dom object for each
    //write mapItems

    // console.log('length: ', mapItemsData.length);
    // console.log('mapItemsData: ', mapItemsData);
    // console.log('data: ', mapItemsData[0].data);
    // console.log('data.title: ', mapItemsData[0].data.title);




    //create #map-list
    var fragmentList = '';

    for (var i=0; i<mapItemsData.length; i++) {

        const h2HeadingString = '<h2>' + mapItemsData[i].type + '</h2>';
        // insert H2's when sorted by type

        var title = mapItemsData[i].data.title;
        var info = mapItemsData[i].data.info;
        var link = mapItemsData[i].data.link;

        if(mapItemsData[i].data.info){
            var htmlString = '<li><strong>' +title+ '</strong><br>' +info+ '</li>';
        } else {  // type is Park
            var htmlString = '<li><a href="' +link+ '" target="_blank">' +title+ '</a></li>';
        }
        fragmentList = fragmentList + htmlString;
    }

    var mapListHtmlString = '<div id="map-list"><ul>' + fragmentList + '</ul></div>';
    const mapListFragment = fragmentFromString(mapListHtmlString);


    //add #map to bigFragment
    bigFragment.appendChild(mapFragment);
    //add #map-list to bigFragment
    bigFragment.appendChild(mapListFragment);



    console.log('bigFragment:', bigFragment);

    //render bigFragment
    domTarget.appendChild(bigFragment);

    console.log('end createDomElements');
}


function fragmentFromString(strHTML) {
    return document.createRange().createContextualFragment(strHTML);
}


// initialise ArcGIS map
const createMap = (mapItemsData, centerPoint) => {
    console.log('create map');
    console.log('FINAL centerPoint: ', centerPoint);


    require([
        'esri/Map',
        'esri/views/MapView',
        'esri/Graphic',
        'esri/geometry/Point',
        'esri/widgets/ScaleBar',
    ], function(Map, MapView, Graphic, Point, ScaleBar) {
        console.log('#map');

        // scope.mapInitialised = true;    // disabled because the map needs to be re-created each route change

        map.arcmap = new Map({
            basemap: "streets-navigation-vector"      // streets, topo, gray, osm
        });

        map.view = new MapView({

            center: centerPoint,  // [135.5, -32],   // Sets center point of view using longitude,latitude
            container: 'map',     // '#map'  // Reference to the DOM node that will contain the view
            map: map.arcmap,
            zoom: 4,
            constraints: {
                rotationEnabled: false
            },
            popup: {
                collapseEnabled: false,
                dockOptions: {
                    buttonEnabled: false
                },
                actions: []
            }

        });

        // Create a symbol for drawing the point
        map.textSymbol = {
            type: "text",     // autocasts as new TextSymbol()
            color: "#08713e", // #db3236
            text: "\ua001",   // esri-icon-map-pin
            font: {           // autocasts as new Font()
                size: 30,
                family: "fontello1"
            },
            haloColor: "#00ffff",
            haloSize: "3px",
            xoffset: 3,
            yoffset: 3,
        };


        map.simpleSymbol = {
            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
            // style: "square",
            path: "M392.47,313.91c28.22-32.62,43.61-76.31,43.61-122.83C436.08,88.31,352.77,5,250,5S63.92,88.31,63.92,191.08c0,46.52,18,90.21,46.27,122.83L250,495Z",
            declaredClass: "my-symbol",
            color: "#59178a",
            size: "40px",  // pixels
            outline: {  // autocasts as new SimpleLineSymbol()
              color: [ 255, 255, 255 ],
              width: "20px"  // points
            }
          };


        map.markers = [];


        // Moves the default zoom widget to the bottom left corner of the view's container
        map.view.ui.move("zoom", "bottom-right");


        var scaleBar = new ScaleBar({
            unit: "metric",
            view: map.view
        });

        // Add widget to the bottom left corner of the view
        map.view.ui.add(scaleBar, {
            position: "bottom-right"
        });

        drawMarkers(mapItemsData, Graphic, Point);


    });
}




const scope = {};



const watchCollection = () => {
    console.log('watchCollection function. ');
}



// watch for changes to filterParks array and redraw the markers
const drawMarkers = (mapItemsData, Graphic, Point) => {

    console.log(mapItemsData);

    map.view.graphics.items = [];

    for (var idx in mapItemsData) {

        if(mapItemsData[idx].data.location.longitude) {  //only draw a marker if item has a longitude

            map.markers[idx] = {};


            map.markers[idx].point = new Point({
                longitude: mapItemsData[idx].data.location.longitude,
                latitude: mapItemsData[idx].data.location.latitude
            });


            map.markers[idx].pointGraphic = new Graphic({
                geometry: map.markers[idx].point,
                symbol: map.simpleSymbol
            });  //map.textSymbol


            var popupTemplate = {
                title: '<a href="' + mapItemsData[idx].link + '" class="ng-binding">' + mapItemsData[idx].name + '</a>',
                content: mapItemsData[idx].region + '<br>' +
                    '<b>'+ mapItemsData[idx].distance + '</b>km from Adelaide<br>' +
                    '<a href="' + mapItemsData[idx].link + '" class="button"><i class="fa fa-info-circle" aria-hidden="true"></i> view park</a>' +
                    '<a class="button  button--directions" href="https://maps.google.com/?daddr=' + mapItemsData[idx].lat + ',' + mapItemsData[idx].lng + '&amp;saddr=Current+Location" target="_blank">Get directions <i class="fa fa-external-link-square" aria-hidden="true"></i></a>'
            }

            map.markers[idx].pointGraphic.popupTemplate = popupTemplate;

            map.view.graphics.add(map.markers[idx].pointGraphic);
        }

    }

    // watchCollection();

}



