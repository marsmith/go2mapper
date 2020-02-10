//START user config variables

var MapX = '-76.2'; //set initial map longitude
var MapY = '42.7'; //set initial map latitude
var MapZoom = 7; //set initial map zoom
//NY WSC is using the app 'followmee' on users iphones to track location data, each user has a color associated with their data, and in icon in /images/person_icons
var trackerURL = 'https://www.followmee.com/api/tracks.aspx';
var trackerData = { 
	key: '168e9e0c977ae697b86a7d80120d23b5',
	username: 'hsistracker',
	output: 'json',
	function: 'currentforalldevices'
};

//request URLs
var USGSwaterServicesURL = 'https://staging.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=';
//var NYproxyURL = 'http://staging-ny.water.usgs.gov/maps/go2/proxy.php?url=';
var NYproxyURL = '';
var AHPSurl = 'https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=';
var NWMmediumRangeURL = 'https://nwmdata.nohrsc.noaa.gov/latest/forecasts/medium_range/streamflow?station_id=';
var NWMshortRangeURL = 'https://nwmdata.nohrsc.noaa.gov/latest/forecasts/short_range/streamflow?station_id=';
var NWMmapServiceURL = 'https://mapservice.nohrsc.noaa.gov/arcgis/rest/services/references_layers/USGS_Stream_Gauges/MapServer/0';

//For NWS radar overlays, update the function 'addNWSlayers()' with extents from: https://radar.weather.gov/ridge/kmzgenerator.php by downloading and looking at KML file attributes
var subDistGeoJSON = './ny_subdist.json';  //Convert a shapefile of your office subdistricts to GeoJSON, and attribute as shown in the NY example here
var noaaSitesJSON = './noaaSites.json';  //lookup file of all NOAA sites with USGS gages
var siteListJSON = './SiteList.json'; //Auto generated by scripts
var tripListJSON = './TripList.json'; //Auto generated by scripts
var go2warningsJSON = './Go2Warnings.json'; //Auto generated by scripts
var go2liteWarningsJSON = './Go2LiteWarnings.json'; //Auto generated by scripts
var go2predictedWarningsJSON = './Go2PredictedWarnings.json'; //Auto generated by scripts
var go2predictedWarningsJSON_NWM = './Go2PredictedWarnings_NWM.json'; //Auto generated by scripts

//END user config variables 