//START user config variables
var MapX = '-76.2'; //set initial map longitude
var MapY = '42.7'; //set initial map latitude
var MapZoom = 7; //set initial map zoom

// Two URLs are provided, the application first attemps the internal URL, if that request fails, revert to external URL
var spotURLinternal = 'https://ny.water.usgs.gov/htmls/internal/go2/getDataInternal.php';
var spotURLexternal = './getDataExternal.php';

var iconLookup = {
	TROY_DATA: 'blue',
	CORTLAND_DATA: 'yellow',
	POTSDAM_DATA: 'orange',
	CORAM_DATA: 'pink',
	MILFORD_DATA: 'red',
	BUFFALO_DATA: 'light_green',
	TROY_WATERSHEDS: 'brown',
	NY_QW: 'gray'
	
}

//request URLs
var USGSwaterServicesURL = 'https://staging.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=';
var proxyURL = 'https://ny.water.usgs.gov/maps/go2/proxy.php?url=';
var AHPSurl = 'https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=';
var NWMmediumRangeURL = 'https://nwmdata.nohrsc.noaa.gov/latest/forecasts/medium_range_ensemble_member_1/streamflow?station_id=';
var NWMshortRangeURL = 'https://nwmdata.nohrsc.noaa.gov/latest/forecasts/short_range/streamflow?station_id=';
var NWMmapServiceURL = 'https://mapservice.nohrsc.noaa.gov/arcgis/rest/services/references_layers/USGS_Stream_Gauges/MapServer/0';

//For NWS radar overlays, update the function 'addNWSlayers()' with extents from: https://radar.weather.gov/ridge/kmzgenerator.php by downloading and looking at KML file attributes
var siteListJSON = './SiteList.json'; //Auto generated by scripts
var tripListJSON = './TripList.json'; //Auto generated by scripts
var go2warningsJSON = './Go2Warnings.json'; //Auto generated by scripts
var go2liteWarningsJSON = './Go2LiteWarnings.json'; //Auto generated by scripts
var go2predictedWarningsJSON = './Go2PredictedWarnings.json'; //Auto generated by scripts
var go2predictedWarningsJSON_NWM = './Go2PredictedWarnings_NWM.json'; //Auto generated by scripts

//END user config variables 