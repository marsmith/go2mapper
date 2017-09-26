# Go2Mapper



## Mapper application setup

####  Pre-requisites
[node.js](https://nodejs.org/en/download/) installed

####  Install dependencies
run `npm install` to install dependencies

#### Customize application
run `npm start` to launch a development web server with live reloading.  Then edit `/src/scripts/app.js`  'user config variables' section near the top of the file:

```JavaScript
var MapX = '-76.2'; //set initial map longitude
var MapY = '42.7'; //set initial map latitude
var MapZoom = 7; //set initial map zoom
var trackerURL = 'https://www.followmee.com/api/tracks.aspx';
var trackerData = { 
	key: '168e9e0c977ae697b86a7d80120d23b5',
	username: 'hsistracker',
	output: 'json',
	function: 'currentforalldevices'
};
var subDistGeoJSON = './ny_subdist.json';  //Convert a shapefile of your office subdistricts to GeoJSON, and attribute as shown in the NY example here
var noaaSitesJSON = './noaaSites.json';  //lookup file of all NOAA sites with USGS gages
var siteListJSON = './SiteList.json'; //Auto generated by scripts
var tripListJSON = './TripList.json'; //Auto generated by scripts
var go2warningsJSON = './Go2Warnings.json'; //Auto generated by scripts
var go2liteWarningsJSON = './Go2LiteWarnings.json'; //Auto generated by scripts
```

###### FollowMee setup
To configure the application to use FollowMee for user tracking, sign up at [FollowMee](https://www.followmee.com/Default.aspx) for the premium "Web Service API". Modify the `trackerData` user config section `key` and `username` to match your account.  The application then needs to be installed on user devices. 

To customize person icons, change the name of the device to a code that contains the persons initials, a dash, then the name of the icon you want to show up on the mapper for that person (without the .png extension).  The device name is used to look up a specific person icon located in `/src/images/person_icons`.  

#### Build app bundle
`npm run build` to run create a production ready bundle set.  This is not used until you are satisfied you have finished edits and are ready to copy to your web server.  Copy the entire contents of `/dist` to your web server


#### Known go2mapper applications
v2
[NYWSC (original)](https://ny.water.usgs.gov/maps/go2/)
[OHWSC](https://oh.water.usgs.gov/maps/go2/)
[MIWSC](https://mi.water.usgs.gov/maps/go2/)
[WAWSC](https://wa.water.usgs.gov/go2mapper/)

v1
[INWSC](https://in.water.usgs.gov/datas/go2mapper/)
[KYWSC](https://ky.water.usgs.gov/datas/go2mapper/)
[SAWSC](https://www2.usgs.gov/water/southatlantic/usgs/maps/go2/)

In progress
CAWSC
AKWSC


## Go2Mapper support tools


Go2Mapper support tools version 1.0.6 are included as a tarball in `/scripts/Go2Mapper_Sun.tar.gz`.  Installation instructions are included.  Please contact <tsiskin@usgs.gov> for help with the go2mapper support tools