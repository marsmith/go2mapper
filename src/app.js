// ------------------------------------------------------------------------------
// ----- NY Go2 Mapper ----------------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2013 Martyn Smith - USGS NY WSC

// authors:  Martyn J. Smith - USGS NY WSC

// purpose:  Web Mapping interface for Go2 Mapper system

// updates:
// 04.02.2013 mjs - Created
// 10.26.2016 mjs - conversion to leaflet.js
// 10.28.2016 mjs - update styling, mobile friendliness
// 08.25.2017 mjs - bring all user config to the top
// 05.28.2019 mjs - updates to graphing, add PHP proxy for AHPS sites
// 11.01.2019 mjs - add go2fast

//CSS imports
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';
import './styles/main.css';

//JS imports
import convex from '@turf/convex';
import 'bootstrap';
import Highcharts from 'highcharts';
import 'leaflet';
import moment from 'moment';
import {query, basemapLayer, dynamicMapLayer} from 'esri-leaflet';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';

//global variables
var theMap;
var siteList = {};
var tripList = {};
var popupChart;
var layerLabels, layer, hullLayer, selectLayer, sitesLayer, peopleLayer;
var Q2_1_hour_precipitation, Q2_24_hour_precipitation, Rainfall_forecast_6_hour, Rainfall_forecast_24_hour, NWS_radar_base_reflectivity, reflectivity_NWS_conus_layer;
var showPeople = false;
var refreshIntervalId;
var spotURL = spotURLinternal;

Highcharts.setOptions({
	global: { useUTC: false },
	lang: { thousandsSep: ','}
});

if (process.env.NODE_ENV !== 'production') {
  require('./index.html');
}

//instantiate map
$( document ).ready(function() {
	console.log('Application Information: ' + process.env.NODE_ENV + ' ' + 'version ' + VERSION);
	$('#appVersion').html('Application Information: ' + process.env.NODE_ENV + ' ' + 'version ' + VERSION);

	$.ajaxQ = (function(){
		var id = 0, Q = {};
	  
		$(document).ajaxSend(function(e, jqx){
		  jqx._id = ++id;
		  Q[jqx._id] = jqx;
		});
		$(document).ajaxComplete(function(e, jqx){
		  delete Q[jqx._id];
		});
	  
		return {
		  abortAll: function(){
			var r = [];
			$.each(Q, function(i, jqx){
			  r.push(jqx._id);
			  jqx.abort();
			});
			return r;
		  }
		};
	  
	  })();

	//create map
	theMap = L.map('mapDiv',{zoomControl: false});

	//add zoom control with your options
	L.control.zoom({position:'topright'}).addTo(theMap);  
	L.control.scale().addTo(theMap);

	//basemap
	layer= L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
		maxZoom: 16
	}).addTo(theMap);

	//set initial view
	theMap.setView([MapY, MapX], MapZoom);

	//define layers
	hullLayer = L.featureGroup().addTo(theMap);
	selectLayer = L.featureGroup().addTo(theMap);
	sitesLayer = L.featureGroup().addTo(theMap);
	peopleLayer = L.featureGroup().addTo(theMap);
	NWS_radar_base_reflectivity = L.layerGroup();
	reflectivity_NWS_conus_layer = L.layerGroup();

	Q2_1_hour_precipitation = L.layerGroup();
	Q2_24_hour_precipitation = L.layerGroup();
	Rainfall_forecast_6_hour = L.layerGroup();
	Rainfall_forecast_24_hour = L.layerGroup();

	loadSites();
	addNWSlayers();

	/*  START EVENT HANDLERS */
	// Add minus icon for collapse element which is open by default
	$(".collapse.show").each(function(){
		$(this).prev(".card-header").find("svg").addClass("fa-minus").removeClass("fa-plus");
	});
	
	// Toggle plus minus icon on show hide of collapse element
	$(".collapse").on('show.bs.collapse', function(){
		$(this).prev(".card-header").find("svg").removeClass("fa-plus").addClass("fa-minus");
	}).on('hide.bs.collapse', function(){
		$(this).prev(".card-header").find("svg").removeClass("fa-minus").addClass("fa-plus");
	});

	$('#centerSelect').on('change', function() {
		var selectedCenter = $('#centerSelect :selected').text();
		$('#tripSelect option[value!="default"]').remove();
		selectCenter(selectedCenter);
	});

	$('#tripSelect').on('change', function() {
		var tripData = {tripName:$('#tripSelect :selected').text(), tripOwner:$('#tripSelect :selected').attr('value'), tripCenter:$('#centerSelect :selected').text()};
		selectTrip(tripData);
	});

	$('#go2typeSelect').on('change', function() {
		var selectedGo2 = $('#go2typeSelect :selected').text();
		selectGo2(selectedGo2);
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

	$('#togglePeople').click(function() {
		togglePeople();
	});

	$('.radarBtn').click(function() {
		console.log('radarBtn click', $(this).val())
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
		openPopup(e);
	});

	theMap.on('popupopen', function(e) {
		var px = theMap.project(e.target._popup._latlng); // find the pixel location on the map where the popup anchor is
		px.y -= e.target._popup._container.clientHeight/2; // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
		theMap.panTo(theMap.unproject(px),{animate: true}); // pan to new center
	});
	/*  END EVENT HANDLERS */

	//test iphone fix	
	setTimeout(function(){ theMap.invalidateSize(); }, 500);
	
});

function addNWSlayers() {

	//got extents from: https://radar.weather.gov/ridge/kmzgenerator.php downloading and looking at KML file attributes

	//iastate base reflectivity
	reflectivity_NWS_conus_layer.addLayer(L.tileLayer('https://{s}.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png', {subdomains: [ "mesonet", "mesonet1", "mesonet2", "mesonet3" ], opacity : 0.7}));

	//nws base reflectivity
	NWS_radar_base_reflectivity.addLayer(dynamicMapLayer({url: 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/radar_base_reflectivity/MapServer', opacity : 0.7, f: 'image'}));

	//1 hour precip
	Q2_1_hour_precipitation.addLayer(L.tileLayer('https://{s}.agron.iastate.edu/cache/tile.py/1.0.0/q2-n1p-900913/{z}/{x}/{y}.png', {subdomains: [ "mesonet", "mesonet1", "mesonet2", "mesonet3" ], opacity : 0.7}));

	//24 hour precip
	Q2_24_hour_precipitation.addLayer(L.tileLayer('https://{s}.agron.iastate.edu/cache/tile.py/1.0.0/q2-p24h-900913/{z}/{x}/{y}.png', {subdomains: [ "mesonet", "mesonet1", "mesonet2", "mesonet3" ], opacity : 0.7}));

	//rainfall forecast 6 hour (QPF 6 Hours Day 1)
	Rainfall_forecast_6_hour.addLayer(dynamicMapLayer({url: 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/wpc_qpf/MapServer', opacity : 0.7, f: 'image', layers: [7]}));

	//rainfall forecast 24 hour (QPF 24 Hour Day 1)
	Rainfall_forecast_24_hour.addLayer(dynamicMapLayer({url: 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/wpc_qpf/MapServer', opacity : 0.7, f: 'image', layers: [1]}));
}

function openPopup(e) {	
	console.log('OPENING POPUP...',e);

	//cleanup
	$('#graphContainer').remove();
	$('.graphLoader').remove();
	popupChart = undefined;
	$.ajaxQ.abortAll();

	//bind and open popup with dynamic content
	e.layer.bindPopup(e.layer.properties.popupContent, {minWidth: 300}).openPopup();

	if (e.layer.properties.siteType === 'sw' || e.layer.properties.siteType === 'gw') {
		//var parameterCodes = '00060,72019,62619';
		//var parameterCodes = '00060,62614,62615,62619,72214,72264,72019';
		var parameterCodes = '00060,00065,62614,62615,62619,72214,72264,72019';
		var timePeriod = 'P7D';
		$.getJSON(USGSwaterServicesURL + e.layer.properties.siteID + '&parameterCd=' + parameterCodes + '&period=' + timePeriod, function(data) {

			if (!data.data || data.data[0].time_series_data.length <= 0) {
				

				setTimeout(function(){ 
					$('#nwisGraphLoader').html('<p><i>No NWIS waterservices data was found</i></p>'); 
					$('#ahpsGraphLoader').remove();
					$('#nwmGraphLoader').remove();
				}, 500);

				console.log('Found an NWIS site, but it had no data in waterservices: ', e.layer.properties.siteID);
				return;
			}

			console.log('NWIS data:',data);

			//set labels
			var yLabel;
			var pointFormat;
			var dischargeFlag = false;
			var series;

			$.each(data.data, function( index, seriesData ) {

				if (seriesData.parameter_name.indexOf('Discharge') !== -1) {
					dischargeFlag = true;
					yLabel = 'Discharge, cfs';
					pointFormat = 'Discharge: {point.y} cfs';

					series = {
						tooltip: {
							pointFormat: pointFormat
						},
						showInLegend: true, 
						id: 'usgs-series',
						data:seriesData.time_series_data,
						name: 'USGS Measured discharge'
					};
				}

				else if (seriesData.parameter_name.indexOf('Elevation') !== -1) {
					seriesData.parameter_name += ', ft';
					if (seriesData.loc_web_ds.length > 0) seriesData.parameter_name += ' (' + seriesData.loc_web_ds + ')';
					else yLabel = seriesData.parameter_name;
					pointFormat = seriesData.parameter_name + ': {point.y}';

					series = {
						tooltip: {
							pointFormat: pointFormat
						},
						showInLegend: false, 
						id: 'usgs-series',
						data:seriesData.time_series_data,
						name: seriesData.parameter_name
					};
				}

				else if (seriesData.parameter_name === 'Water level, depth LSD') {
					yLabel = 'Elevation, ft';
					pointFormat = 'Elevation: {point.y} ft';

					series = {
						tooltip: {
							pointFormat: pointFormat
						},
						showInLegend: false, 
						id: 'usgs-series',
						data:seriesData.time_series_data,
						name: seriesData.parameter_name
					};
				}

				//only put gage height i
				else if (seriesData.parameter_name.indexOf('Gage height') !== -1 && !dischargeFlag) {

					seriesData.parameter_name += ', ft';
					if (seriesData.loc_web_ds.length > 0) seriesData.parameter_name += ' (' + seriesData.loc_web_ds + ')';
					else yLabel = seriesData.parameter_name;
					pointFormat = seriesData.parameter_name + ': {point.y}';

					series = {
						tooltip: {
							pointFormat: pointFormat
						},
						showInLegend: false, 
						id: 'usgs-series',
						data:seriesData.time_series_data,
						name: seriesData.parameter_name
					};
				}

			});

			//this is either a non discharge site or gw site so we are done
			if (!dischargeFlag) {
				popupChart = undefined;
				console.log('This is a gw or non disharge site, so were done');
				$('.graphLoader').remove();
				showGraph(series, yLabel);
				return;
			}

			//show NWIS graph
			$('#nwisGraphLoader').remove();
			showGraph(series, yLabel);
			
			//get NOAA forecast values if this is an AHPS Site 
			if (siteList[e.layer.properties.siteID].properties.nws_id && siteList[e.layer.properties.siteID].properties.nws_id !== 'n/a') {
				console.log('Found AHPS site: ',siteList[e.layer.properties.siteID].properties.nws_id, '  Querying AHPS...');
				var reqURL = AHPSurl + e.layer.properties.nws_id + '&output=xml';
				console.log('AHPS page url:',reqURL);


				//use staging if were in dev mode or on amazon s3
				if (process.env.NODE_ENV === 'development' || location.hostname.match('wim') ) { reqURL = proxyURL + reqURL;}

				$.ajax({
					url: reqURL,
					dataType: 'xml',
					success: function(feedResponse) {

						console.log('AHPS Response:',feedResponse);
						var valueArray = [];
						var someValues = false;
						$(feedResponse).find("forecast").find("datum").each(function(){
							var date = $(this).find('valid').text();
							if (!dischargeFlag && $(this).find('primary').attr('name') === 'Stage') {
								var units = $(this).find('primary').attr('units');
								var value = parseFloat($(this).find('primary').text());
								someValues = true;
							}
							//assume discharge
							if (dischargeFlag && $(this).find('secondary').attr('name') === 'Flow') {
								var units = $(this).find('secondary').attr('units');
								var value = parseFloat($(this).find('secondary').text());
								if (units === 'kcfs') value = value * 1000;
								someValues = true;
							}

							//bail if we have nothing
							if (!someValues) return;

							var seconds = new Date(date)/1;
							valueArray.push([seconds, value]);
						});
						valueArray.sort();

						if (valueArray.length <= 1) {
							console.log('Found an AHPS Site, but no AHPS data was found: ', e.layer.properties.siteID, e.layer.properties.ahpsID);
							$('#ahpsGraphLoader').remove();
							return;
						}

						//if there is AHPS data, add a new series to the graph
						var ahpsSeries = {
							tooltip: {
								pointFormat: pointFormat
							},
							showInLegend: true, 
							color: '#009933',
							name: 'NWS River Forecast (AHPS)',
							id: 'ahps-series',
							data: valueArray
						}

						//show AHPS graph
						$('#ahpsGraphLoader').remove();
						showGraph(ahpsSeries, yLabel);

					}
				});
			}

			//this is not an AHPS site
			else {
				console.log('This is not an AHPS site:', e.layer.properties.siteID);
				$('#ahpsGraphLoader').remove();
			}

			//Check if NWM site and get forecast
			var thequery = query({url: NWMmapServiceURL	});
			var queryString = "site_no = '" + e.layer.properties.siteID + "'";
			$('#graphContainer').append('LOADING NWM DATA... Please Wait')
			thequery.where(queryString);
			thequery.run(function (error, featureCollection, response) {

				if (error) {
					console.log(error);
					return;
				}
				if (featureCollection.features.length == 0) {
					console.log('Did not find NWM site for USGS Site: ', e.layer.properties.siteID);
					return;
				}

				console.log('NWM Feature query results:',featureCollection)

				var nwm_reach_code = featureCollection.features[0].properties['feature_id'];

				//override featureID for Mohawk R nr Utica (01342602) 
				if (nwm_reach_code == 22743145) {
					nwm_reach_code = 22743167;
				}

				//now that we have a feature, OK to continue
				console.log('Found NWM reach code: ', nwm_reach_code, '  Querying NWM...');
				var reqURL = NWMshortRangeURL + nwm_reach_code;
				console.log('NWM page url:',reqURL);

				//use staging if were in dev mode or on amazon s3
				if (process.env.NODE_ENV === 'development' || location.hostname.match('wim') ) { reqURL = proxyURL + reqURL;}

				$.ajax({
					url: reqURL,
					dataType: 'json',
					success: function(nwmResponse) {

						console.log('NWM Short Range Response:',nwmResponse);
						var valueArray = [];
						var someValues = false;
						if (nwmResponse[0].data.length > 0) someValues = true;
						
						var forecastTime = nwmResponse[0]['reference-time'];
						var units = nwmResponse[0].units;

						$.each(nwmResponse[0].data, function( index, dataVal ) {
							var date = dataVal['forecast-time'];
							var value = dataVal['value']
							var seconds = new Date(date)/1;
							valueArray.push([seconds, value]);
						});
						valueArray.sort();

						//grab last value after sort
						var lastShortRangeVal = valueArray[valueArray.length-1];

						console.log('Last short range NWM value:',lastShortRangeVal)
						
						//nested ajax call for NWM short range data
						var reqURL = NWMmediumRangeURL + nwm_reach_code;

						//use staging if were in dev mode or on amazon s3
						if (process.env.NODE_ENV === 'development' || location.hostname.match('wim') ) { reqURL = proxyURL + reqURL;}

						$.ajax({
							url: reqURL,
							dataType: 'json',
							success: function(nwmResponse) {
		
								console.log('NWM Medium Range Response:',nwmResponse);
								if (nwmResponse[0].data.length > 0) someValues = true;
		
								var forecastTime = nwmResponse[0]['reference-time'];
								var units = nwmResponse[0].units;
		
								$.each(nwmResponse[0].data, function( index, dataVal ) {
									var date = dataVal['forecast-time'];
									var value = dataVal['value']
									var seconds = new Date(date)/1;

									//only medium range values if time stamp is after the last short range value
									if (seconds > lastShortRangeVal[0]) {
										valueArray.push([seconds, value]);
									}

								});
								valueArray.sort();
		
								if (valueArray.length <= 1) {
									console.log('Found a NWM Site, but no NWM data was found: ', e.layer.properties.siteID, e.layer.properties.nwm_reach_code);
									$('#nwmGraphLoader').remove();
									reteurn;
								}
		
								//if there is AHPS data, add a new series to the graph
								var nwmSeries = {
									tooltip: {
										pointFormat: pointFormat
									},
									showInLegend: true, 
									color: '#AF18EC',
									name: 'NWM River Forecast for ' +  featureCollection.features[0].properties['site_name'],
									id: 'nwm-series',
									data: valueArray
								}

								//show NWM graph
								$('#nwmGraphLoader').remove();
								showGraph(nwmSeries, yLabel);

							}
						});
					}
				});
			});
		});
	}
}

function showGraph(series, yLabel) {
	console.log('In showGraph',series, yLabel, popupChart)

	//if graph is already set up, just refresh series data
	if (popupChart && popupChart.series) {
		console.log('CHART EXISTS')
		popupChart.addSeries(series, false);
		popupChart.redraw();
		return;
	}

	//if there is some data, show the div
	// $('#graphContainer').show();
	// $('#graphLoader').hide();

	console.log('SHOULD BE HERE')

	//popupChart.redraw();

	var chartSetup = {
		chart: {
			type: 'line',
			spacingTop: 20,
			spacingLeft: 0,
			spacingBottom: 0,
			zoomType:'x'
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
		series: [series]
	};

	//type specific overrides
	if (series.name === 'Discharge') chartSetup.yAxis.type = 'logarithmic';
	if (series.name === 'Water level, depth LSD') chartSetup.yAxis.reversed = true;


	setTimeout(function(){ 
		popupChart = Highcharts.chart('graphContainer', chartSetup); 
		$('#graphContainer').show();
		//$('#nwisGraphLoader').hide();
		console.log('END OF SHOWGRAPH',popupChart);
	}, 500);
	

	
}

function selectCenter(selectedCenter) {

	selectLayer.clearLayers();
	hullLayer.clearLayers();

	//draw halo for selected center sites
	sitesLayer.eachLayer(function (layer) {

		if (layer.properties.office === selectedCenter) {
			//console.log('found a matching site', layer.properties);
			drawSelectHalo(layer.properties.siteID);
		}
	});

	//get convex hull and zoom to
	if (selectLayer.getLayers().length <= 2) theMap.flyToBounds(selectLayer.getBounds());
	else getConvexHull(selectedCenter);

	//populate trip select
	$('#tripSelect').show();
	$.each(tripList, function( index, center ) {
		if (center.WSC.OfficeName.indexOf(selectedCenter) !== -1) {
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

	$.each(tripList, function( index, center ) {
		if (center.WSC.OfficeName.indexOf(tripData.tripCenter) !== -1) {

			$.each(center.WSC.Trip, function( index, trip ) {
				//if we found the selected trip loop over its sites
				if (trip.TripName == tripData.tripName) {
					$.each(trip.Sites, function( index, site) {
						drawSelectHalo(site);
					});
				}
			});
		}
	});

	//get convex hull and zoom to
	if (selectLayer.getLayers().length <= 2) theMap.flyToBounds(selectLayer.getBounds());
	else getConvexHull(tripData.tripName);
}
 
function getConvexHull(text) {
	//create convex hull
	var hull = convex(selectLayer.toGeoJSON());

	console.log('sites selection geojson:', JSON.stringify(selectLayer.toGeoJSON()))

	//console.log('hull geojson:', JSON.stringify(hull))
	// var hullGeoJSONlayer = L.geoJSON(hull)
	var hullGeoJSONlayer = L.geoJSON(hull).bindPopup(text, {minWidth: 200});
	hullLayer.addLayer(hullGeoJSONlayer);

	//zoom map
	theMap.flyToBounds(hullLayer.getBounds());
}

function drawSelectHalo(siteID) {

	var selectIcon = L.icon({iconUrl: './images/symbols/selected_site_yellow.png',iconSize: [64,64]});
	$.each(siteList, function( index, site ) {
		if (site.properties.siteID === siteID) {
			var haloMarker = L.marker(site.getLatLng(), {icon: selectIcon, pane:'shadowPane'});
			selectLayer.addLayer(haloMarker);
		}
	});
}

function loadSites() {
	var bgIcon = L.icon({iconUrl: './images/symbols/dot_small.png',iconSize: [8,8]});
	
	//iterate over the generated siteList JSON
	$.getJSON(siteListJSON, function(data) {
		$.each(data.SitesCollection, function( index, site ) {
			//give all sites the default background marker
			siteList[site.SiteID] = L.marker([site.Attributes.latDD, site.Attributes.lonDD], {icon: bgIcon});

			//overload the properties into the leaflet marker for that site
			siteList[site.SiteID].properties = {};
			siteList[site.SiteID].properties.siteID = site.SiteID;
			siteList[site.SiteID].properties.siteName = site.Attributes.station_nm;
			siteList[site.SiteID].properties.siteType = site.Attributes.site_type;
			siteList[site.SiteID].properties.nws_id = site.Attributes.nws_id;
			siteList[site.SiteID].properties.office= site.Attributes.Office;

			//Need to still write some popup data that will even apply if site isn't in a trip or out of site
			siteList[site.SiteID].properties.popupContent = '<b>' + site.SiteID + '</b></br></br>' + site.Attributes.station_nm + '</br><a href="https://waterdata.usgs.gov/nwis/inventory/?site_no=' + site.SiteID + '" target="_blank">Access Data</a></br><div id="graphContainer" style="width:100%; height:200px;display:none;"></div><div class="container" style="width:100%;"><div class="row"><div class="col-md-4 graphLoader" id="nwisGraphLoader"><p><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw graph-loader"></i>Loading NWIS...</p></div><div class="col-md-4 graphLoader" id="ahpsGraphLoader"><p><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw graph-loader"></i>Loading AHPS...</p></div><div class="col-md-4 graphLoader" id="nwmGraphLoader"><p><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw graph-loader"></i>Loading NWM..</p></div></div></div>';

			siteList[site.SiteID].properties.defaultPopupContent = siteList[site.SiteID].properties.popupContent;

			//add to layergroup
			sitesLayer.addLayer(siteList[site.SiteID]);

			//check if we have this office yet in drop down, if not add it
			if($("#centerSelect option:contains('" + site.Attributes.Office + "')").length ==0) {

				$('#centerSelect').append($('<option></option>').attr('value',site.Attributes.Office).text(site.Attributes.Office));
			}
			

		});

		loadTrips();
		//initial loadGo2 call
		loadGo2(go2warningsJSON);

	});
}

function loadTrips() {
	$.getJSON(tripListJSON, function(data) {
		tripList = data.TripsCollection;
		$.each(tripList, function( index, site ) {
			$.each(site, function( index, WSC ) {
				$.each(WSC.Trip, function( index, trip ) {
					$.each(trip.Sites, function( index, site ) {

						//check if site exists in master siteList
						if (siteList[site]) {
							//add trip data to the site object
							siteList[site].properties.tripName = trip.TripName;
							siteList[site].properties.tripOwner = trip.TripOwner;
							
							//overwrite popup with added trip data
							siteList[site].properties.popupContent = '<b>' + site + '</b></br></br>' + siteList[site].properties.siteName+ '</br><a href="https://waterdata.usgs.gov/nwis/inventory/?site_no=' + site + '" target="_blank">Access Data</a></br></br><b>Office: </b>' + WSC.OfficeName + '</br><b>Trip Name: </b>' + siteList[site].properties.tripName + '</br><b>Trip Owner: </b>' + siteList[site].properties.tripOwner + '<div id="graphContainer" style="width:100%; height:200px;display:none;"></div><div class="container" style="width:100%;"><div class="row"><div class="col-md-4 graphLoader" id="nwisGraphLoader"><p><i class="fa fa-cog fa-spin fa-3x fa-fw graph-loader"></i>Loading NWIS...</p></div><div class="col-md-4 graphLoader" id="ahpsGraphLoader"><p><i class="fa fa-cog fa-spin fa-3x fa-fw graph-loader"></i>Loading AHPS...</p></div><div class="col-md-4 graphLoader" id="nwmGraphLoader"><p><i class="fa fa-cog fa-spin fa-3x fa-fw graph-loader"></i>Loading NWM..</p></div></div></div>';

							siteList[site].properties.defaultPopupContent = siteList[site].properties.popupContent;

							//siteList[site].getPopup().setContent(siteList[site].properties.popupContent);
						}
						else {
							if (process.env.NODE_ENV === 'development') console.log('This site does not exist in the master SiteList.json: ', site);
						}
					});
				});
			});
		});
	});
}

function selectGo2(method) {

	console.log('in select go2:', method)

	if (method ==='Go2') {
		loadGo2(go2warningsJSON);
		return 'Show Go2';
	}
	if (method ==='Go2Lite') {
		loadGo2(go2liteWarningsJSON);
		return 'Show Go2Lite';
	}
	if (method ==='Go2Fast') {
		loadGo2(go2predictedWarningsJSON);
		return 'Show Go2Fast';
	}
	if (method ==='Go2FastR') {
		loadGo2(go2predictedWarningsJSON_NWM);
		return 'Show Go2FastR';
	}


}

function loadGo2(go2json) {
	//clear flag layer
	selectLayer.clearLayers();
	hullLayer.clearLayers();
	var fgIcon;

	$.getJSON(go2json, function(data) {
		$('#loading').hide();
		$('#time').html('Data queried: ' + data.metadata.created);

		//reset all sites popups and icons
		$.each(siteList, function( index, site ) {
			//console.log('test',site)
			site.properties.popupContent = site.properties.defaultPopupContent;
			fgIcon = L.icon({iconUrl: './images/symbols/dot_small.png',iconSize: [8,8]});
			site.setIcon(fgIcon);
		});

		//loop of master marker list to find flagged matches
		$.each(data.SitesCollection, function( index, thisWarning ) {

			//flag if we are missing this site in the siteList
			if (typeof siteList[thisWarning.items.SiteID] == 'undefined') {
				console.warn('This site does not exist in TripList.json: ', thisWarning.items.SiteID);
				//$('#noTripSites').append('<li>' + thisWarning.items.SiteID + '</li>')
			}

			//otherwise proceed to processing flags 
			else {
				var masterSite = siteList[thisWarning.items.SiteID]

				//console.log('Processing:', masterSite)
				var sitetype = masterSite.properties.siteType;
				var go2text = '';
				var go2flags = [];

				//get array of flags for this site
				for (var item in thisWarning.items.goflags) {

					//console.log('HERE',thisWarning.items.goflags[item].go2flag)

					//skip 1DCP flags temporarily
					//if (thisWarning.items.goflags[item].go2flag != '1DCP') {
						go2text = go2text + '<div class="alert alert-warning"><b>' + thisWarning.items.goflags[item].go2flag + ':</b> ' + thisWarning.items.goflags[item].go2msg + '</div>';

						var thisFlag = thisWarning.items.goflags[item].go2flag
						
						//create temporary flag search for 'iGH_meas'
						if ((thisWarning.items.goflags[item].go2flag == 'iGH') && (thisWarning.items.goflags[item].go2msg.indexOf('meas') != -1)) {
							thisFlag = 'iGH_meas';
						}
						go2flags.push(thisFlag)
					//}
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
				else if (searchStringInArray("1TIME",go2flags) != -1)    {
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
					if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_white.png",iconSize: [42,40]});
					else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_white.png",iconSize: [22,30]});
				}
				else if ((searchStringInArray("2TIME",go2flags) != -1) ||(searchStringInArray("3TIME",go2flags) != -1) || (searchStringInArray("4TIME",go2flags) != -1))    {
					if (go2flags.length > 1) fgIcon = L.icon({iconUrl: "images/symbols/multi_" + sitetype + "_gray.png",iconSize: [42,40]});
					else fgIcon = L.icon({iconUrl: "images/symbols/" + sitetype + "_gray.png",iconSize: [22,30]});
				}
				//otherwise just bail
				else {
					return;
				}

				masterSite.properties.popupContent += '</br>' + go2text
				masterSite.setIcon(fgIcon);

			}



		});

	});
}

function togglePeople() {
	$('#togglePeople').toggleClass('btn-secondary btn-primary');
	showPeople = !showPeople;
	if (showPeople) {
		//refresh every 2.5 minutes as per spot guidance
		//loadLocationsFOLLOWME();
		loadLocations();
		refreshIntervalId = setInterval(loadLocations, 150000);  
	}
	else {
		theMap.removeLayer(peopleLayer);
		clearInterval(refreshIntervalId);
	}
}

function parseLocations(response) {

	//make sure there is a response
	if(response.length > 0) {
		
		//if there is a response, clear the people Layer
		peopleLayer.clearLayers();

		//check for duplicate ESNs
		var result = response.filter(function (a) {
			return !this[a.messengerId] && (this[a.messengerId] = true);
		}, Object.create(null));

		console.log('Got locations:',result);
				
		$(result).each(function(i,location) {

			//get the location coords
			var coords = [parseFloat(location.latitude),parseFloat(location.longitude)];
	
			//logic to check for and parse out name if it exists
			var groupID = location.messengerName;
			var name;
			var check = groupID.split('_');
			var internal = false;
			if (check.length === 3) {
				internal = true;
				groupID = check[0] + '_' + check[1];
				name = check[2];
			}

			//convert time
			var dateObj = moment(location.dateTime);
			var formattedDate = dateObj.format('MMMM Do YYYY, h:mm:ss a');
			var utcSeconds = dateObj.valueOf() / 1000;
			var seconds = new Date().getTime() / 1000;

			//icon lookup by group
			var color = iconLookup[groupID];
			if (!color) console.warn('No icon for: ' + groupID);
			
			//setup marker for person
			var personIcon = L.icon({iconUrl: './images/person_icons/' + color + '.png',iconSize: [40,40]});

			//create popup text
			var popupString = 'User Data</br>';

			//add name if we are internal
			if (internal) {
				popupString = name + '</br>';
			}

			popupString += '<b>ESN:</b> ' + location.messengerId + '</br><b>Timestamp:</b> ' + formattedDate + '</br><b>GroupID:</b> ' + groupID + '</br><b>Type:</b> ' + location.messageType + '</br><b>Message:</b> ' + location.messageContent + '</br><b>Battery:</b> ' + location.batteryState;

			var personMarker = L.marker(coords, {zIndexOffset: 1000, icon: personIcon}).bindPopup(popupString);

			//add the graphic only if timestamp hasn't changed in last 36 hours
			if (seconds - utcSeconds < 129600) { 
				peopleLayer.addLayer(personMarker);
				console.log("Adding:", location.messengerId);
			}
			else {
				console.log("Skipped for no update:", location.messengerId);
			}
		});
	} 

	//no response from tracking url or other error
	else {
		console.log('Error retreiving user locations');
	}
}

function loadLocations() {
	//add the layer if it isn't on the map
	if (!theMap.hasLayer(peopleLayer)) theMap.addLayer(peopleLayer);

	console.log('ABOUT TO LOAD PEOPLE WITH THIS URL:', spotURL);

	//attempt internal request first
	$.ajax({
		type: "GET",
		contentType: "application/json; charset=utf-8",
		url: spotURL,
		dataType: "json",
		success: function(response){

			parseLocations(response);

		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {

			console.error('Unexpected error has occurred: ' + XMLHttpRequest.statusText + ' (' + XMLHttpRequest.status + ')');

			//if we have an error fall back to public URL
			spotURL = spotURLexternal;
			loadLocations();
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
		case 'Verizon': baseMap = 'Verizon'; break;
	}

	if (layer) theMap.removeLayer(layer);

	if (baseMap === 'Verizon') {
		//testing verizon coverage map
		var imageUrl = './images/verizon_coverage.jpg',
		imageBounds = [[40.464082713022, -80.23879543723], [45.162293719815, -71.69092847148]];
		layer = L.imageOverlay(imageUrl, imageBounds).addTo(theMap);
		theMap.addLayer(layer);

	}

	else {
		layer = basemapLayer(baseMap);
		theMap.addLayer(layer);
		if (layerLabels) theMap.removeLayer(layerLabels);
		if (baseMap === 'Gray' || baseMap === 'Imagery' || baseMap === 'Terrain') {
			layerLabels = basemapLayer(baseMap + 'Labels');
			theMap.addLayer(layerLabels);
		}
	}

}

function toggleRadar(id) {

	console.log('toggle radar:', id)

	//remove all layers
	clearRadar();
	
	if(id == "reflectivity_NWS_conus_layer") {
		theMap.addLayer(reflectivity_NWS_conus_layer);
		$('#radar-legend').show();
	}
	if(id == "NWS_radar_base_reflectivity") {
		theMap.addLayer(NWS_radar_base_reflectivity);
		$('#radar-legend').show();
	}

	if(id == "Q2_1_hour_precipitation") {
		theMap.addLayer(Q2_1_hour_precipitation);
		$('#past-rainfall-legend').show();
	}
	if(id == "Q2_24_hour_precipitation") {
		theMap.addLayer(Q2_24_hour_precipitation);
		$('#past-rainfall-legend').show();
	}
	if(id == "Rainfall_forecast_6_hour") {
		theMap.addLayer(Rainfall_forecast_6_hour);
		$('#forecast-rainfall-legend').show();
	}
	if(id == "Rainfall_forecast_24_hour") {
		theMap.addLayer(Rainfall_forecast_24_hour);
		$('#forecast-rainfall-legend').show();
	}
}

function clearRadar() {
	$('#NWSlegend').empty();

	$('#radar-legend').hide();
	$('#past-rainfall-legend').hide();
	$('#forecast-rainfall-legend').hide();

	theMap.removeLayer(reflectivity_NWS_conus_layer);
	theMap.removeLayer(NWS_radar_base_reflectivity);
	theMap.removeLayer(Q2_1_hour_precipitation);
	theMap.removeLayer(Q2_24_hour_precipitation);
	theMap.removeLayer(Rainfall_forecast_6_hour);
	theMap.removeLayer(Rainfall_forecast_24_hour);
}

function resetView() {
	//clear select dropdowns
	$("#centerSelect").val( $("#centerSelect option:first-child").val() );
	$("#tripSelect").find("option:gt(0)").remove();

	//turn people off if they are on
	if ($('#togglePeople').hasClass('btn-primary')) togglePeople();

	//toggle go2 back to main if showing go2lite
	$('#go2typeSelect').val('full');
	selectGo2('Go2')

	//clear any selection graphics
	selectLayer.clearLayers();
	hullLayer.clearLayers();
	clearRadar();

	//clear selected radar
	$('.radarBtn').removeClass('active');

	//reset view
	theMap.setView([MapY, MapX], 7);
}