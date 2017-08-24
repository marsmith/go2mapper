// ------------------------------------------------------------------------------
// ----- NY Go2 Mapper ----------------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2013 Martyn Smith - USGS NY WSC

// authors:  Martyn J. Smith - USGS NY WSC

// purpose:  Web Mapping interface for Go2 Mapper system

// updates:
// 04.02.2013 mjs - Created
// 10.26.2016 mjs - conversion to leaflet.js
// 10.28.2016 mjs - update syling, mobile friendliness

//config variables
var MapX = '-76.2';
var MapY = '42.7';
var siteList = {};
var tripList = {};
var map, layerLabels, layer;
var wscLayer, hullLayer, selectLayer, sitesLayer, peopleLayer, lr_NWS_layer, sr_NWS_layer, storm_NWS_layer, reflectivity_NWS_conus_layer;
var showPeople = false;
var refreshIntervalId;

if (process.env.NODE_ENV !== 'production') {
  require('../index.html');
}

//instantiate map
$( document ).ready(function() {
	//L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.0.1/dist/images/';

	console.log('Application Information: ' + process.env.NODE_ENV + ' ' + 'version ' + VERSION);
	$('#appVersion').html('Application Information: ' + process.env.NODE_ENV + ' ' + 'version ' + VERSION);

	//create map
	map = L.map('mapDiv',{zoomControl: false});

	//add zoom control with your options
	L.control.zoom({position:'topright'}).addTo(map);  
	L.control.scale().addTo(map);

	//basemap
	layer= L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
		maxZoom: 16
	}).addTo(map);

	//set initial view
	map.setView([MapY, MapX], 7);
		
	//define layers
	wscLayer = L.featureGroup().addTo(map);
	hullLayer = L.featureGroup().addTo(map);

	selectLayer = L.featureGroup().addTo(map);
	sitesLayer = L.featureGroup().addTo(map);
	peopleLayer = L.featureGroup().addTo(map);

	lr_NWS_layer = L.layerGroup();
	sr_NWS_layer = L.layerGroup();
	storm_NWS_layer = L.layerGroup();
	reflectivity_NWS_conus_layer = L.layerGroup();

	loadSites();
	loadWSCboundaries();
	addNWSlayers();

	/*  START EVENT HANDLERS */
	$('#centerSelect').on('change', function() {
		var selectedCenter = $('#centerSelect :selected').text();
		$('#tripSelect option[value!="default"]').remove();
		//console.log('selected: ',selectedCenter);
		selectCenter(selectedCenter);
	});

	$('#tripSelect').on('change', function() {
		var tripData = {tripName:$('#tripSelect :selected').text(), tripOwner:$('#tripSelect :selected').attr('value'), tripCenter:$('#centerSelect :selected').text()};
		//console.log('selected: ',tripData);
		selectTrip(tripData);
	});

	$('.basemapBtn').click(function() {
		$('.basemapBtn').removeClass('slick-btn-selection');
		$(this).addClass('slick-btn-selection');
		var baseMap = this.id.replace('btn','');
		setBasemap(baseMap);
	});

	$('#mobile-main-menu').click(function() {
		$('body').toggleClass('isOpenMenu');
	});

	$('#toggleGo2').click(function() {
		toggleGo2();
	});

	$('#togglePeople').click(function() {
		togglePeople();
	});

	$('.radarBtn').click(function() {
		if ($(this).hasClass('slick-btn-selection')) {
			$(this).removeClass('slick-btn-selection');
			clearRadar();
		}
		else {
			$('.radarBtn').removeClass('slick-btn-selection');
			$(this).addClass('slick-btn-selection');
			var radarValue = $(this).val();
			toggleRadar(radarValue);
		}
	});

	$('#resetView').click(function() {
		resetView();
	});

	$('#aboutButton').click(function() {
		$('#aboutModal').modal('show');
	});	

	sitesLayer.on('click', function(e) { 
		showNWISgraph(e);
	});
	/*  END EVENT HANDLERS */
});

function getAHPSids() {

	$.getJSON('./noaaSites.json', function(data) {
		//console.log(data);
		$.each(data, function( usgsSiteID, ahpsID ) {
			if (siteList[usgsSiteID]) {
				//console.log('found NY site: ', usgsSiteID, ahpsID);
				siteList[usgsSiteID].properties.ahpsID = ahpsID;
			}
		});
	});

	// //Old method -- until they removed the USGS siteID from the bottom of the description tags
	// var type = 'rss';
	// var url = 'https://water.weather.gov/ahps2/rss/fcst/ny.rss';
	// var query = 'select * from ' + type + ' where url="' + url + '"';
	// $.ajax({
	// 	url: 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query),
	// 	dataType: 'xml',
	// 	success: function(feedResponse) {
	// 		console.log('in getAHPSids: ', feedResponse);
	// 		$(feedResponse).find('item').each(function(){
	// 			console.log('here');
	// 			var content = $(this).find('description').text();
	// 			var title = $(this).find('title').text();

	// 			if (content.indexOf('USGS') != -1) {
	// 				var usgsSiteID = content.split('site_no=')[1].split('"')[0];
	// 				var ahpsID = title.split('Forecast - ')[1].split(' ')[0];
	// 				console.log(ahpsID, usgsSiteID);

	// 				//if there is a marker for this site, append its noaa ID
	// 				if (siteList[usgsSiteID]) {
	// 					siteList[usgsSiteID].properties.ahpsID = ahpsID;
	// 				}
	// 			}
	// 		});
	// 	}
	// });
}


function addNWSlayers() {

	//got extents from: https://radar.weather.gov/ridge/kmzgenerator.php downloading and looking at KML file attributes

	//reflectivity CONUS layer
	reflectivity_NWS_conus_layer.addLayer(L.imageOverlay('https://radar.weather.gov/ridge/Conus/RadarImg/northeast_radaronly.gif',[[35.13102, -81.613834], [49.508061, -66.517938]]));
	//L.esri.dynamicMapLayer({url: 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/radar_base_reflectivity/MapServer', layers: [0], opacity : 1, useCors: false}).addTo(map);
	//reflectivity_NWS_conus_layer.addLayer(L.esri.dynamicMapLayer({url: 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/radar_base_reflectivity/MapServer', layers: [0], opacity : 1, useCors: false}));
	//reflectivity_NWS_conus_layer.addLayer(L.imageOverlay('https://radar.weather.gov/ridge/Conus/RadarImg/latest_radaronly.gif',[[21.652538062803, -127.620375523875420], [50.406626367301044, -66.517937876818]]));

	//long range state composite
	lr_NWS_layer.addLayer(L.imageOverlay('https://radar.weather.gov/ridge/RadarImg/N0Z/ENX_N0Z_0.gif',[[38.578726,-78.420367],[46.578726,-69.693094]]));
	lr_NWS_layer.addLayer(L.imageOverlay('https://radar.weather.gov/ridge/RadarImg/N0Z/BGM_N0Z_0.gif',[[38.193727,-80.341364],[46.193727,-71.614092]]));
	lr_NWS_layer.addLayer(L.imageOverlay('https://radar.weather.gov/ridge/RadarImg/N0Z/BUF_N0Z_0.gif	',[[38.941729,-83.093363],[46.941729,-74.36609]]));
	lr_NWS_layer.addLayer(L.imageOverlay('https://radar.weather.gov/ridge/RadarImg/N0Z/TYX_N0Z_0.gif',[[39.748728,-80.036364],[47.748728,-71.309091]]));
	lr_NWS_layer.addLayer(L.imageOverlay('https://radar.weather.gov/ridge/RadarImg/N0Z/OKX_N0Z_0.gif',[[36.858728,-77.220362],[44.858728,-68.493089]]));

	//short range state composite
	sr_NWS_layer.addLayer(L.imageOverlay(' https://radar.weather.gov/ridge/RadarImg/N0R/ENX_N0R_0.gif',[[39.894591,-76.989871],[45.267637,-71.128366]]));
	sr_NWS_layer.addLayer(L.imageOverlay(' https://radar.weather.gov/ridge/RadarImg/N0R/BGM_N0R_0.gif',[[39.526025,-78.893004],[44.866266,-73.067287]]));
	sr_NWS_layer.addLayer(L.imageOverlay(' https://radar.weather.gov/ridge/RadarImg/N0R/BUF_N0R_0.gif',[[40.241795,-81.680043],[45.646381,-75.78413]]));
	sr_NWS_layer.addLayer(L.imageOverlay(' https://radar.weather.gov/ridge/RadarImg/N0R/TYX_N0R_0.gif',[[41.012603,-78.662387],[46.48944,-72.687656]]));
	sr_NWS_layer.addLayer(L.imageOverlay(' https://radar.weather.gov/ridge/RadarImg/N0R/OKX_N0R_0.gif',[[38.245599,-75.712675],[43.476892,-70.00581]]));

	//storm total precip
	storm_NWS_layer.addLayer(L.imageOverlay(' https://radar.weather.gov/ridge/RadarImg/NTP/ENX_NTP_0.gif',[[39.894178,-76.99032],[45.268049,-71.127915]]));
	storm_NWS_layer.addLayer(L.imageOverlay(' https://radar.weather.gov/ridge/RadarImg/NTP/BGM_NTP_0.gif',[[39.52562,-78.893445],[44.866669,-73.066846]]));
	storm_NWS_layer.addLayer(L.imageOverlay(' https://radar.weather.gov/ridge/RadarImg/NTP/BUF_NTP_0.gif',[[40.241382,-81.680491],[45.646793,-75.78368]]));
	storm_NWS_layer.addLayer(L.imageOverlay(' https://radar.weather.gov/ridge/RadarImg/NTP/TYX_NTP_0.gif',[[41.01219,-78.662836],[46.489851,-72.687205]]));
	storm_NWS_layer.addLayer(L.imageOverlay(' https://radar.weather.gov/ridge/RadarImg/NTP/OKX_NTP_0.gif',[[38.245202,-75.713107],[43.477288,-70.005377]]));
}

function showNWISgraph(e) {	
	//console.log('graphdata: ',e.layer.properties.siteType);
	if (e.layer.properties.siteType === 'sw' || e.layer.properties.siteType === 'gw') {
		var parameterCodes = '00060,72019,62619';
		var timePeriod = 'P7D';
		$.getJSON('https://staging.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=' + e.layer.properties.siteID + '&parameterCd=' + parameterCodes + '&period=' + timePeriod, function(data) {
			//console.log('graphdata: ',e.layer.properties.siteID, data)

			if (!data.data || data.data[0].time_series_data.length <= 0) {
				console.log('Found an NWIS site, but it had no data in waterservices: ', e.layer.properties.siteID)
				return;
			}
			var graphData = [];

			//set labels
			var yLabel = 'Discharge, cfs';
			var pointFormat = 'Discharge: {point.y} cfs';
			if (e.layer.properties.siteType === 'gw') {
				yLabel = 'Elevation, ft';
				pointFormat = 'Elevation: {point.y} ft';
			}

			var usgsSeries = {
				tooltip: {
					pointFormat: pointFormat
				},
				showInLegend: false, 
				data: data.data[0].time_series_data
			}
			graphData.push(usgsSeries)

			//get NOAA forecast values if this is an AHPS Site 
			if (siteList[e.layer.properties.siteID].properties.ahpsID) {
				console.log('Found AHPS site: ',siteList[e.layer.properties.siteID].properties.ahpsID, '  Querying AHPS...');
				var url = 'https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=' + e.layer.properties.ahpsID + '&output=xml';
				var query = 'select * from xml where url="' + url + '"';
				$.ajax({
					url: 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query),
					dataType: 'xml',
					success: function(feedResponse) {
						//console.log('in getNOAAforecats: ', feedResponse);
						var valueArray = [];
						$(feedResponse).find("forecast").find("datum").each(function(){
							var date = $(this).find('valid').text();
							var units = $(this).find('secondary').attr('units');
							var value = parseFloat($(this).find('secondary').text());
							if (units === 'kcfs') value = value * 1000;
							var seconds = new Date(date)/1;
							//console.log('noaa forecasted value: ',seconds,value);
							valueArray.push([seconds, value])
						});

						//console.log(valueArray);
						valueArray.sort();

						if (valueArray.length <= 1) {
							console.log('Found an AHPS Site, but no AHPS data was found: ', e.layer.properties.siteID, e.layer.properties.ahpsID)
						}
						//if there is AHPS data, add a new series to the graph
						else {
							var forecastSeries = {
								tooltip: {
									pointFormat: pointFormat
								},
								showInLegend: true, 
								color: '#009933',
								name: 'NWS River Forecast (AHPS)',
								data: valueArray
							}
							graphData.push(forecastSeries);
						}

						//console.log('Calling showgraph function now...');
						showGraph(graphData, yLabel);
					}
				});
			}

			//if no AHPS data, just show USGS data
			else {
				console.log('Did not find AHPS site for USGS Site: ', e.layer.properties.siteID);
				showGraph(graphData, yLabel);
			}
		});
	}
}

function showGraph(graphData, yLabel) {
	//if there is some data, show the div
	$('#graphContainer').show();

	Highcharts.setOptions({
		global: { useUTC: false },
		lang: { thousandsSep: ','}
	});

	Highcharts.chart('graphContainer', {
		chart: {
			type: 'line',
			spacingTop: 20,
			spacingLeft: 0,
			spacingBottom: 0,
		},
		title:{
			text:''
		},
		credits: {
			enabled: false
		},
		xAxis: {
			type: "datetime",
			labels: {
				formatter: function () {
					return Highcharts.dateFormat('%m/%d', this.value);
				},
				//rotation: 90,
				align: 'center',
				tickInterval: 172800 * 1000
			}
		},
		yAxis: {
			title: { text: yLabel }
		},
		series: graphData
	});
}

function selectCenter(selectedCenter) {

	selectLayer.clearLayers();
	hullLayer.clearLayers();

	//zoom to center on select
	wscLayer.eachLayer(function (layer) {
		var layers = layer.getLayers();
		$.each(layers, function( index, layer ) {
			if (layer.feature.properties.Office === selectedCenter) map.fitBounds(layer.getBounds())
		});
	});

	//populate trip select
	$('#tripSelect').show();
	$.each(tripList, function( index, center ) {
		//console.log('searching: ',trip.WSC.OfficeName,center);
		if (center.WSC.OfficeName.indexOf(selectedCenter) !== -1) {
			//console.log('parsing: ', center);

			//append trips to select
			$.each(center.WSC.Trip, function( index, trip ) {
				$('#tripSelect').append($('<option></option>').attr('value',trip.TripOwner).text(trip.TripName));
			});
		}
	});
}

function selectTrip(tripData) {
	//clear old trip selection
	selectLayer.clearLayers();
	hullLayer.clearLayers();
	hullPoints = [];

	$.each(tripList, function( index, center ) {
		//console.log('searching: ',center.WSC.OfficeName,center);
		if (center.WSC.OfficeName.indexOf(tripData.tripCenter) !== -1) {
			//console.log('parsing: ', center);

			$.each(center.WSC.Trip, function( index, trip ) {
				//if we found the selected trip loop over its sites
				//console.log('check: ', trip.TripName, tripData.tripName)
				if (trip.TripName == tripData.tripName) {
					$.each(trip.Sites, function( index, site) {
						drawSelectHalo('siteslayer', site);
					});
				}
			});
		}
	});

	//get convex hull and zoom to
	if (selectLayer.getLayers().length <= 2) map.fitBounds(selectLayer.getBounds());
	else getConvexHull(tripData);
}
 
function getConvexHull(tripData) {
	//create convex hull
	var hull = convex(selectLayer.toGeoJSON());
	var hullGeoJSONlayer = L.geoJSON(hull).bindPopup('<b>Center: </b>' + tripData.tripCenter + '</br><b>Trip Name: </b>' + tripData.tripName + '</br><b>Trip Owner: </b>' + tripData.tripOwner, {minWidth: 200});
	hullLayer.addLayer(hullGeoJSONlayer);

	//zoom map
	map.fitBounds(hullLayer.getBounds());
}

function drawSelectHalo(siteLayerId, siteID) {

	var selectIcon = L.icon({iconUrl: './images/symbols/selected_site_yellow.png',iconSize: [64,64]});
	$.each(siteList, function( index, site ) {
		if (site.properties.siteID === siteID) {
			//console.log('in select halo found match: ', site)
			var haloMarker = L.marker(site.getLatLng(), {icon: selectIcon, pane:'shadowPane'});
			selectLayer.addLayer(haloMarker);
		}
	});
}

function loadWSCboundaries() {
	$.getJSON('./ny_subdist.json', function(data) {
		$.each(data.features, function( index, value ) {
			$('#centerSelect').append($('<option></option>').attr('value',value.properties.Office).text(value.properties.Office));
		});
		var myStyle = {
			"color": "#ff8c66",
			"opacity": 0.3
		};
		var geoJSONlayer = L.geoJSON(data, {style: myStyle});
		wscLayer.addLayer(geoJSONlayer);
	});
}

function loadSites() {
	//console.log('in loadSites');
	
	var bgIcon = L.icon({iconUrl: './images/symbols/dot_small.png',iconSize: [8,8]});
	
	$.getJSON('./SiteList.json', function(data) {
		//console.log('sitelist: ', data);
		$.each(data.SitesCollection, function( index, site ) {
			//give all sites the default background marker
			siteList[site.SiteID] = L.marker([site.Attributes.latDD, site.Attributes.lonDD], {icon: bgIcon});

			//save its properties
			siteList[site.SiteID].properties = {};
			siteList[site.SiteID].properties.siteID = site.SiteID;
			siteList[site.SiteID].properties.siteName = site.Attributes.station_nm;
			siteList[site.SiteID].properties.siteType = site.Attributes.site_type;
			//set default popup with minimal info
			siteList[site.SiteID].properties.popupContent = '<b>' + site.SiteID + '</b></br></br>' + site.Attributes.station_nm + '</br><a href="https://waterdata.usgs.gov/nwis/inventory/?site_no=' + site.SiteID + '" target="_blank">Access Data</a></br></br>';
			siteList[site.SiteID].bindPopup(siteList[site.SiteID].properties.popupContent, {minWidth: 300});

			//add to layergroup
			sitesLayer.addLayer(siteList[site.SiteID]);
		});

		loadTrips();
		//initial loadGo2 call
		loadGo2('Go2Warnings.json');

		getAHPSids();

	});
}

function loadTrips() {
	//console.log('In loadTrips');
	$.getJSON('./TripList.json', function(data) {
		tripList = data.TripsCollection;
		//console.log('tripList: ', tripList, data);
		$.each(tripList, function( index, site ) {
			$.each(site, function( index, WSC ) {
				//console.log(index,WSC);
				$.each(WSC.Trip, function( index, trip ) {
					//console.log(WSC.OfficeName, trip);
					$.each(trip.Sites, function( index, site ) {
						//console.log(trip.TripName, site);

						//check if site exists in master siteList
						if (siteList[site]) {
							//add trip data to the site object
							siteList[site].properties.tripName = trip.TripName;
							siteList[site].properties.tripOwner = trip.TripOwner;
							//overwrite popup with added trip data
							siteList[site].properties.popupContent = '<b>' + site + '</b></br></br>' + siteList[site].properties.siteName+ '</br><a href="https://waterdata.usgs.gov/nwis/inventory/?site_no=' + site + '" target="_blank">Access Data</a></br></br><b>Office: </b>' + WSC.OfficeName + '</br><b>Trip Name: </b>' + siteList[site].properties.tripName + '</br><b>Trip Owner: </b>' + siteList[site].properties.tripOwner + '<div id="graphContainer" style="width:100%; height:200px;display:none;"></div>';

							//console.log('popupcontent: ', site, siteList[site].properties.popupContent )
							siteList[site].getPopup().setContent(siteList[site].properties.popupContent);
						}
						else {
							//if (process.env.NODE_ENV === 'development') console.log('This site does not exist in the master SiteList.json: ', site);
							$('#missingSites').append('<li>' + site + '</li>');
						}
					});
				});
			});
		});
	});
}

function toggleGo2() {
	$('#toggleGo2').text(function(i,old){
		if (old ==='Show Go2Lite') {
			loadGo2('Go2LiteWarnings.json');
			return 'Show Go2';
		}
		else {
			loadGo2('Go2Warnings.json');
			return 'Show Go2Lite';
		}
	});
}

function loadGo2(go2json) {
	//clear flag layer
	selectLayer.clearLayers();
	hullLayer.clearLayers();

	$.getJSON('./' + go2json, function(data) {
		//console.log('go2warnings: ', data);
		$('#loading').hide();
		$('#time').html('Data queried: ' + data.metadata.created);

		$.each(siteList, function( index, masterSite ) {
			//console.log(masterSite.properties,masterSite.properties.popupContent)
		
			//reset the site popup and icon
			masterSite.getPopup().setContent(masterSite.properties.popupContent);
			var fgIcon = L.icon({iconUrl: './images/symbols/dot_small.png',iconSize: [8,8]});
			var go2text = '';
			var go2flags = [];

			//loop of master marker list to find flagged matches
			$.each(data.SitesCollection, function( index, thisWarning ) {

				if (masterSite.properties.siteID === thisWarning.items.SiteID) {
					//console.log('match found for: ', masterSite.properties.siteID);
					if (!masterSite.properties.tripName) {
						//if (process.env.NODE_ENV === 'development') console.log('This site does not exist in TripList.json: ', masterSite.properties.siteID);
						$('#noTripSites').append('<li>' + masterSite.properties.siteID + '</li>')
					}

					var sitetype = masterSite.properties.siteType;

					//get array of flags for this site
					for (var item in thisWarning.items.goflags) {

						//skip 1DCP flags temporarily
						if (thisWarning.items.goflags[item].go2flag != '1DCP') {
							go2text = go2text + '<div class="alert alert-warning"><b>' + thisWarning.items.goflags[item].go2flag + ':</b> ' + thisWarning.items.goflags[item].go2msg + '</div>';

							var thisFlag = thisWarning.items.goflags[item].go2flag
							
							//create temporary flag search for 'iGH_meas'
							if ((thisWarning.items.goflags[item].go2flag == 'iGH') && (thisWarning.items.goflags[item].go2msg.indexOf('meas') != -1)) {
								thisFlag = 'iGH_meas';
							}
							go2flags.push(thisFlag)
						}
					}

					//set the icon based on the flag
					if ((searchStringInArray("1DCP",go2flags) != -1) || (searchStringInArray("2DCP",go2flags) != -1) || (searchStringInArray("1GH",go2flags) != -1) || (searchStringInArray("2GH",go2flags) != -1) || (searchStringInArray("MODEM",go2flags) != -1))   {
						if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_red.png",iconSize: [42,40]});
						else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_red.png",iconSize: [22,30]});
					}
					else if ((searchStringInArray("1LRAT",go2flags) != -1) || (searchStringInArray("1HRAT",go2flags) != -1))   {
						if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_orange.png",iconSize: [42,40]});
						else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_orange.png",iconSize: [22,30]});
					}
					else if ((searchStringInArray("2LRAT",go2flags) != -1) || (searchStringInArray("2HRAT",go2flags) != -1) || (searchStringInArray("2RRAT",go2flags) != -1))   {
						if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_yellow.png",iconSize: [42,40]});
						else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_yellow.png",iconSize: [22,30]});
					}
					else if ((searchStringInArray("3LRAT",go2flags) != -1) || (searchStringInArray("3HRAT",go2flags) != -1))   {
						if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_green.png",iconSize: [42,40]});
						else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_green.png",iconSize: [22,30]});
					}
					else if (searchStringInArray("4RAT",go2flags) != -1)    {
						if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_blue.png",iconSize: [42,40]});
						else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_blue.png",iconSize: [22,30]});
					}
					else if ((searchStringInArray("iGEN",go2flags) != -1) || (searchStringInArray("iGH_meas",go2flags) != -1))   {
						if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_violet.png",iconSize: [42,40]});
						else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_violet.png",iconSize: [22,30]});
					}
					else if (searchStringInArray("TIME",go2flags) != -1)    {
						if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_black.png",iconSize: [42,40]});
						else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_black.png",iconSize: [22,30]});
					}
					else if (searchStringInArray("iWEB",go2flags) != -1)    {
						if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_brown.png",iconSize: [42,40]});
						else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_brown.png",iconSize: [22,30]});
					}
					else if ((searchStringInArray("iDCP",go2flags) != -1) || (searchStringInArray("iGH",go2flags) != -1) || (searchStringInArray("SPIKE",go2flags) != -1) || (searchStringInArray("3DCP",go2flags) != -1) || (searchStringInArray("4DCP",go2flags) != -1) || (searchStringInArray("3GH",go2flags) != -1) || (searchStringInArray("4GH",go2flags) != -1))  {
						if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_pink.png",iconSize: [42,40]});
						else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_pink.png",iconSize: [22,30]});
					}
					else if ((searchStringInArray("GAP",go2flags) != -1) || (searchStringInArray("SHFT",go2flags) != -1) || (searchStringInArray("COMP",go2flags) != -1))   {
						if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_gray.png",iconSize: [42,40]});
						else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_gray.png",iconSize: [22,30]});
					}
					//otherwise just bail
					else {
						return;
					}

					// //set the icon based on the flag
					// if ((searchStringInArray("1DCP",go2flags) != -1) || (searchStringInArray("2DCP",go2flags) != -1) || (searchStringInArray("1GH",go2flags) != -1) || (searchStringInArray("2GH",go2flags) != -1) || (searchStringInArray("MODEM",go2flags) != -1))   {
					// 	if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_red.png",iconSize: [42,40]});
					// 	else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_red.png",iconSize: [22,30]});
					// }
					// else if ((searchStringInArray("1LRAT",go2flags) != -1) || (searchStringInArray("1HRAT",go2flags) != -1))   {
					// 	if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_orange.png",iconSize: [42,40]});
					// 	else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_orange.png",iconSize: [22,30]});
					// }
					// else if ((searchStringInArray("2LRAT",go2flags) != -1) || (searchStringInArray("2HRAT",go2flags) != -1) || (searchStringInArray("2RRAT",go2flags) != -1))   {
					// 	if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_yellow.png",iconSize: [42,40]});
					// 	else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_yellow.png",iconSize: [22,30]});
					// }
					// else if ((searchStringInArray("3LRAT",go2flags) != -1) || (searchStringInArray("3HRAT",go2flags) != -1))   {
					// 	if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_green.png",iconSize: [42,40]});
					// 	else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_green.png",iconSize: [22,30]});
					// }
					// else if (searchStringInArray("4RAT",go2flags) != -1)    {
					// 	if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_blue.png",iconSize: [42,40]});
					// 	else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_blue.png",iconSize: [22,30]});
					// }
					// else if (searchStringInArray("iGEN",go2flags) != -1)    {
					// 	if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_violet.png",iconSize: [42,40]});
					// 	else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_violet.png",iconSize: [22,30]});
					// }
					// else if (searchStringInArray("TIME",go2flags) != -1)    {
					// 	if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_black.png",iconSize: [42,40]});
					// 	else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_black.png",iconSize: [22,30]});
					// }
					// else if (searchStringInArray("iWEB",go2flags) != -1)    {
					// 	if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_brown.png",iconSize: [42,40]});
					// 	else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_brown.png",iconSize: [22,30]});
					// }
					// else if ((searchStringInArray("iDCP",go2flags) != -1) || (searchStringInArray("iGH",go2flags) != -1) || (searchStringInArray("SPIKE",go2flags) != -1) || (searchStringInArray("3DCP",go2flags) != -1) || (searchStringInArray("4DCP",go2flags) != -1) || (searchStringInArray("3GH",go2flags) != -1) || (searchStringInArray("4GH",go2flags) != -1))  {
					// 	if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_pink.png",iconSize: [42,40]});
					// 	else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_pink.png",iconSize: [22,30]});
					// }
					// else if ((searchStringInArray("GAP",go2flags) != -1) || (searchStringInArray("SHIFT",go2flags) != -1) || (searchStringInArray("COMP",go2flags) != -1))   {
					// 	if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_gray.png",iconSize: [42,40]});
					// 	else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_gray.png",iconSize: [22,30]});
					// }
					// //otherwise just bail
					// else {
					// 	return;
					// }
				}
			});

			//update popup content and icon
			var popupContent = masterSite.getPopup().getContent();
			masterSite.getPopup().setContent(popupContent += '</br>' + go2text);
			masterSite.setIcon(fgIcon);
		});
	});
}

function togglePeople() {
	$('#togglePeople').toggleClass('btn-default btn-primary');
	showPeople = !showPeople;
	if (showPeople) {
		//refresh every 30 seconds
		loadPeople();
		refreshIntervalId = setInterval(loadPeople, 30000);  
	}
	else {
		map.removeLayer(peopleLayer);
		clearInterval(refreshIntervalId);
	}
}

function loadPeople() {
	//console.log('in LoadPeople');

	//add the layer if it isn't on the map
	if (!map.hasLayer(peopleLayer)) map.addLayer(peopleLayer);

	//add 'callback=?' for jsonp request
	var peopleURL = 'https://www.followmee.com/api/tracks.aspx?key=168e9e0c977ae697b86a7d80120d23b5&username=hsistracker&output=json&function=currentforalldevices';
		
	//get locations
	$.ajax({
		type: "GET",
		contentType: "application/json; charset=utf-8",
		url: peopleURL,
		async: false,
		dataType: "jsonp",
		success: function(json){
			//console.log('loadPeople data: ', json.Data);
							
			//make sure there is a response
			if(json.Data.length > 0){

				//if there is a response, clear the people Layer
				peopleLayer.clearLayers();
			
				$(json.Data).each(function(i,v) {
				
					//get point info
					var coords = [parseFloat(v.Latitude),parseFloat(v.Longitude)];
					var timeText = v.Date;
					var accuracy = v.Accuracy;
					var speed = v['Speed(mph)'];
					var altitude = v['Altitude(m)'];
					var name = v.DeviceName;
					var color = name.split('-')[1];
					var deviceID = v.DeviceID;

					//get timestamp 
					var dateObj = moment(timeText);
					var formattedDate = dateObj.format('MMMM Do YYYY, h:mm:ss a');

					//convert time to seconds
					var utcSeconds = dateObj.valueOf() / 1000;
					var seconds = new Date().getTime() / 1000;
				
					//setup marker for person
					var personIcon = L.icon({iconUrl: './images/person_icons/' + color + '.png',iconSize: [40,40]});
					var personMarker = L.marker(coords, {icon: personIcon}).bindPopup('<b>User Data</b></br><b>Timestamp:</b> ' + formattedDate + '</br><b>Color:</b> ' + color + '</br><b>Speed(mph):</b> ' + speed + '</br><b>Altitude(m):</b> ' + altitude + '</br><b>Accuracy(m):</b> ' + accuracy);

					//add the graphic only if timestamp hasn't changed in last 36 hours
					if (seconds - utcSeconds < 129600) { 
						peopleLayer.addLayer(personMarker);
						console.log("deviceID: ",deviceID, " | color: ", color, " | date: ", formattedDate, " | location: ", coords, " | speed: ", speed, " mph | altitude: ", altitude, " meters | accuracy: ", accuracy, ' meters');
					}
					
					//otherwise skip showing this user
					else {
						console.log(color, "was skipped for no update.");
					}
				});
			} 
	  
			//no response from followMee or other error
			else {
				console.log('Error retreiving user locations');
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			alert('Unexpected error has occurred: ' + XMLHttpRequest.statusText + ' (' + XMLHttpRequest.status + ')');
		}
	});
}

function searchStringInArray (str, strArray) {
	for (var j=0; j<strArray.length; j++) {
		if (strArray[j].match(new RegExp(str, "i"))) return j;
	}
	return -1;
}

function setBasemap(baseMap) {

	switch (baseMap) {
		case 'Streets': baseMap = 'Streets'; break;
		case 'Satellite': baseMap = 'Imagery'; break;
		case 'Topo': baseMap = 'Topographic'; break;
		case 'Terrain': baseMap = 'Terrain'; break;
		case 'Gray': baseMap = 'Gray'; break;
		case 'NatGeo': baseMap = 'NationalGeographic'; break;
	}

	if (layer) 	map.removeLayer(layer);
	layer = L.esri.basemapLayer(baseMap);
	map.addLayer(layer);
	if (layerLabels) map.removeLayer(layerLabels);
	if (baseMap === 'Gray' || baseMap === 'Imagery' || baseMap === 'Terrain') {
		layerLabels = L.esri.basemapLayer(baseMap + 'Labels');
		map.addLayer(layerLabels);
	}
}

function toggleRadar(id) {

	//remove any existing legend img
	$('#NWSlegend').empty();
	$('#radarTimeStamp').empty();

	//remove all layers
	clearRadar();
	
	if(id == "sr_NWS_layer") {
		//if (map.hasLayer(sr_NWS_layer)) map.removeLayer(sr_NWS_layer);
		map.addLayer(sr_NWS_layer);
		$("#NWSlegend").append("<img id='LegendImg' src='https://radar.weather.gov/ridge/kml/radarkeyimages/ENX_N0R_Legend_0.gif'/>");
	}
	if(id == "lr_NWS_layer") {
		map.addLayer(lr_NWS_layer);
		$("#NWSlegend").append("<img id='LegendImg' src='https://radar.weather.gov/ridge/kml/radarkeyimages/ENX_N0Z_Legend_0.gif'/>");
	}
	if(id == "storm_NWS_layer") {
		map.addLayer(storm_NWS_layer);
		$("#NWSlegend").append("<img id='LegendImg' src='https://radar.weather.gov/ridge/kml/radarkeyimages/ENX_NTP_Legend_0.gif'/>");
	}
	if(id == "reflectivity_NWS_conus_layer") {
		map.addLayer(reflectivity_NWS_conus_layer);
		$("#NWSlegend").append("<img id='LegendImg' src='https://radar.weather.gov/ridge/kml/radarkeyimages/ENX_NCR_Legend_0.gif'/>");
	}
}

function clearRadar() {
	$('#NWSlegend').empty();
	$('#radarTimeStamp').empty();
	map.removeLayer(sr_NWS_layer);
	map.removeLayer(lr_NWS_layer);
	map.removeLayer(storm_NWS_layer);
	map.removeLayer(reflectivity_NWS_conus_layer);
}

function resetView() {
	//clear select dropdowns
	$("#centerSelect").val( $("#centerSelect option:first-child").val() );
	$("#tripSelect").find("option:gt(0)").remove();

	//turn people off if they are on
	if ($('#togglePeople').hasClass('btn-primary')) togglePeople();

	//toggle go2 back to main if showing go2lite
	if ($('#toggleGo2').text() == 'Show Go2') toggleGo2();

	//clear any selection graphics
	selectLayer.clearLayers();
	hullLayer.clearLayers();
	clearRadar();

	//clear selected radar
	$('.radarBtn').removeClass('active');

	//reset view
	map.setView([MapY, MapX], 7);
}