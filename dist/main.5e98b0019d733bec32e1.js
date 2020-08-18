!function(e){function r(r){for(var t,i,s=r[0],l=r[1],p=r[2],c=0,g=[];c<s.length;c++)i=s[c],Object.prototype.hasOwnProperty.call(a,i)&&a[i]&&g.push(a[i][0]),a[i]=0;for(t in l)Object.prototype.hasOwnProperty.call(l,t)&&(e[t]=l[t]);for(d&&d(r);g.length;)g.shift()();return o.push.apply(o,p||[]),n()}function n(){for(var e,r=0;r<o.length;r++){for(var n=o[r],t=!0,s=1;s<n.length;s++){var l=n[s];0!==a[l]&&(t=!1)}t&&(o.splice(r--,1),e=i(i.s=n[0]))}return e}var t={},a={0:0},o=[];function i(r){if(t[r])return t[r].exports;var n=t[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=e,i.c=t,i.d=function(e,r,n){i.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,r){if(1&r&&(e=i(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var t in e)i.d(n,t,function(r){return e[r]}.bind(null,t));return n},i.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(r,"a",r),r},i.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},i.p="";var s=window.webpackJsonp=window.webpackJsonp||[],l=s.push.bind(s);s.push=r,s=s.slice();for(var p=0;p<s.length;p++)r(s[p]);var d=l;o.push([20,1]),n()}({20:function(e,r,n){"use strict";n.r(r),function(e){n(21),n(23),n(29);var r,t,a,o,i,s,l,p,d,c,g,m,u,f=n(19),h=n.n(f),b=(n(47),n(3)),y=n.n(b),v=(n(0),n(1)),x=n.n(v),w=n(4),_=(n(51),n(55),{}),S={},N=!1;function I(r,n){if(console.log("In showGraph",r,n,t),t&&t.series)return console.log("CHART EXISTS"),t.addSeries(r,!1),void t.redraw();console.log("SHOULD BE HERE");var a={chart:{type:"line",spacingTop:20,spacingLeft:0,spacingBottom:0,zoomType:"x"},title:{text:""},credits:{enabled:!1},xAxis:{type:"datetime",labels:{formatter:function(){return y.a.dateFormat("%m/%d",this.value)},align:"center",tickInterval:1728e5}},yAxis:{title:{text:n}},series:[r]};"Discharge"===r.name&&(a.yAxis.type="logarithmic"),"Water level, depth LSD"===r.name&&(a.yAxis.reversed=!0),setTimeout((function(){t=y.a.chart("graphContainer",a),e("#graphContainer").show(),console.log("END OF SHOWGRAPH",t)}),500)}function O(e){var n=h()(s.toGeoJSON()),t=L.geoJSON(n).bindPopup(e,{minWidth:200});i.addLayer(t),r.flyToBounds(i.getBounds())}function T(r){var n=L.icon({iconUrl:"./images/symbols/selected_site_yellow.png",iconSize:[64,64]});e.each(_,(function(e,t){if(t.properties.siteID===r){var a=L.marker(t.getLatLng(),{icon:n,pane:"shadowPane"});s.addLayer(a)}}))}function D(e){return console.log("in select go2:",e),"Go2"===e?(k(go2warningsJSON),"Show Go2"):"Go2Lite"===e?(k(go2liteWarningsJSON),"Show Go2Lite"):"Go2Fast"===e?(k(go2predictedWarningsJSON),"Show Go2Fast"):"Go2FastR"===e?(k(go2predictedWarningsJSON_NWM),"Show Go2FastR"):void 0}function k(r){var n;s.clearLayers(),i.clearLayers(),e.getJSON(r,(function(r){e("#loading").hide(),e("#time").html("Data queried: "+r.metadata.created),e.each(_,(function(e,r){r.properties.popupContent=r.properties.defaultPopupContent,n=L.icon({iconUrl:"./images/symbols/dot_small.png",iconSize:[8,8]}),r.setIcon(n)})),e.each(r.SitesCollection,(function(e,r){if(void 0===_[r.items.SiteID])console.warn("This site does not exist in TripList.json: ",r.items.SiteID);else{var t=_[r.items.SiteID],a=t.properties.siteType,o="",i=[];for(var s in r.items.goflags){o=o+'<div class="alert alert-warning"><b>'+r.items.goflags[s].go2flag+":</b> "+r.items.goflags[s].go2msg+"</div>";var l=r.items.goflags[s].go2flag;"iGH"==r.items.goflags[s].go2flag&&-1!=r.items.goflags[s].go2msg.indexOf("meas")&&(l="iGH_meas"),i.push(l)}if(-1!=R("1DCP",i)||-1!=R("2DCP",i)||-1!=R("1GH",i)||-1!=R("2GH",i)||-1!=R("MODEM",i))n=i.length>1?L.icon({iconUrl:"images/symbols/multi_"+a+"_red.png",iconSize:[42,40]}):L.icon({iconUrl:"images/symbols/"+a+"_red.png",iconSize:[22,30]});else if(-1!=R("1LRAT",i)||-1!=R("1HRAT",i))n=i.length>1?L.icon({iconUrl:"images/symbols/multi_"+a+"_orange.png",iconSize:[42,40]}):L.icon({iconUrl:"images/symbols/"+a+"_orange.png",iconSize:[22,30]});else if(-1!=R("2LRAT",i)||-1!=R("2HRAT",i)||-1!=R("2RRAT",i))n=i.length>1?L.icon({iconUrl:"images/symbols/multi_"+a+"_yellow.png",iconSize:[42,40]}):L.icon({iconUrl:"images/symbols/"+a+"_yellow.png",iconSize:[22,30]});else if(-1!=R("3LRAT",i)||-1!=R("3HRAT",i))n=i.length>1?L.icon({iconUrl:"images/symbols/multi_"+a+"_green.png",iconSize:[42,40]}):L.icon({iconUrl:"images/symbols/"+a+"_green.png",iconSize:[22,30]});else if(-1!=R("4RAT",i))n=i.length>1?L.icon({iconUrl:"images/symbols/multi_"+a+"_blue.png",iconSize:[42,40]}):L.icon({iconUrl:"images/symbols/"+a+"_blue.png",iconSize:[22,30]});else if(-1!=R("iGEN",i)||-1!=R("iGH_meas",i))n=i.length>1?L.icon({iconUrl:"images/symbols/multi_"+a+"_violet.png",iconSize:[42,40]}):L.icon({iconUrl:"images/symbols/"+a+"_violet.png",iconSize:[22,30]});else if(-1!=R("TIME",i))n=i.length>1?L.icon({iconUrl:"images/symbols/multi_"+a+"_black.png",iconSize:[42,40]}):L.icon({iconUrl:"images/symbols/"+a+"_black.png",iconSize:[22,30]});else if(-1!=R("iWEB",i))n=i.length>1?L.icon({iconUrl:"images/symbols/multi_"+a+"_brown.png",iconSize:[42,40]}):L.icon({iconUrl:"images/symbols/"+a+"_brown.png",iconSize:[22,30]});else if(-1!=R("iDCP",i)||-1!=R("iGH",i)||-1!=R("SPIKE",i)||-1!=R("3DCP",i)||-1!=R("4DCP",i)||-1!=R("3GH",i)||-1!=R("4GH",i))n=i.length>1?L.icon({iconUrl:"images/symbols/multi_"+a+"_pink.png",iconSize:[42,40]}):L.icon({iconUrl:"images/symbols/"+a+"_pink.png",iconSize:[22,30]});else{if(-1==R("GAP",i)&&-1==R("SHFT",i)&&-1==R("COMP",i))return;n=i.length>1?L.icon({iconUrl:"images/symbols/multi_"+a+"_gray.png",iconSize:[42,40]}):L.icon({iconUrl:"images/symbols/"+a+"_gray.png",iconSize:[22,30]})}t.properties.popupContent+="</br>"+o,t.setIcon(n)}}))}))}function C(){e("#togglePeople").toggleClass("btn-secondary btn-primary"),(N=!N)?(G(),u=setInterval(G,6e4)):(r.removeLayer(p),clearInterval(u))}function G(){r.hasLayer(p)||r.addLayer(p),e.ajax({type:"GET",contentType:"application/json; charset=utf-8",url:trackerURL,data:trackerData,async:!1,dataType:"jsonp",success:function(r){r.Data&&r.Data.length>0?(p.clearLayers(),e(r.Data).each((function(e,r){var n=[parseFloat(r.Latitude),parseFloat(r.Longitude)],t=r.Date,a=r.Accuracy,o=r["Speed(mph)"],i=r["Altitude(m)"],s=r.DeviceName.split("-")[1],l=r.DeviceID,d=x()(t),c=d.format("MMMM Do YYYY, h:mm:ss a"),g=d.valueOf()/1e3,m=(new Date).getTime()/1e3,u=L.icon({iconUrl:"./images/person_icons/"+s+".png",iconSize:[40,40]}),f=L.marker(n,{icon:u}).bindPopup("<b>User Data</b></br><b>Timestamp:</b> "+c+"</br><b>Color:</b> "+s+"</br><b>Speed(mph):</b> "+o+"</br><b>Altitude(m):</b> "+i+"</br><b>Accuracy(m):</b> "+a);m-g<129600?(p.addLayer(f),console.log("deviceID: ",l," | color: ",s," | date: ",c," | location: ",n," | speed: ",o," mph | altitude: ",i," meters | accuracy: ",a," meters")):console.log(s,"was skipped for no update.")}))):console.log("Error retreiving user locations")},error:function(e,r,n){alert("Unexpected error has occurred: "+e.statusText+" ("+e.status+")")}})}function R(e,r){for(var n=0;n<r.length;n++)if(r[n].match(new RegExp(e,"i")))return n;return-1}function z(){e("#NWSlegend").empty(),r.removeLayer(c),r.removeLayer(d),r.removeLayer(g),r.removeLayer(m)}y.a.setOptions({global:{useUTC:!1},lang:{thousandsSep:","}}),e(document).ready((function(){var n,u,f;console.log("Application Information: production version 1.2.1"),e("#appVersion").html("Application Information: production version 1.2.1"),e.ajaxQ=(n=0,u={},e(document).ajaxSend((function(e,r){r._id=++n,u[r._id]=r})),e(document).ajaxComplete((function(e,r){delete u[r._id]})),{abortAll:function(){var r=[];return e.each(u,(function(e,n){r.push(n._id),n.abort()})),r}}),r=L.map("mapDiv",{zoomControl:!1}),L.control.zoom({position:"topright"}).addTo(r),L.control.scale().addTo(r),o=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",maxZoom:16}).addTo(r),r.setView([MapY,MapX],MapZoom),i=L.featureGroup().addTo(r),s=L.featureGroup().addTo(r),l=L.featureGroup().addTo(r),p=L.featureGroup().addTo(r),d=L.layerGroup(),c=L.layerGroup(),g=L.layerGroup(),m=L.layerGroup(),f=L.icon({iconUrl:"./images/symbols/dot_small.png",iconSize:[8,8]}),e.getJSON(siteListJSON,(function(r){e.each(r.SitesCollection,(function(r,n){_[n.SiteID]=L.marker([n.Attributes.latDD,n.Attributes.lonDD],{icon:f}),_[n.SiteID].properties={},_[n.SiteID].properties.siteID=n.SiteID,_[n.SiteID].properties.siteName=n.Attributes.station_nm,_[n.SiteID].properties.siteType=n.Attributes.site_type,_[n.SiteID].properties.nws_id=n.Attributes.nws_id,_[n.SiteID].properties.office=n.Attributes.Office,_[n.SiteID].properties.popupContent="<b>"+n.SiteID+"</b></br></br>"+n.Attributes.station_nm+'</br><a href="https://waterdata.usgs.gov/nwis/inventory/?site_no='+n.SiteID+'" target="_blank">Access Data</a></br><div id="graphContainer" style="width:100%; height:200px;display:none;"></div><div class="container" style="width:100%;"><div class="row"><div class="col-md-4 graphLoader" id="nwisGraphLoader"><p><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw graph-loader"></i>Loading NWIS...</p></div><div class="col-md-4 graphLoader" id="ahpsGraphLoader"><p><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw graph-loader"></i>Loading AHPS...</p></div><div class="col-md-4 graphLoader" id="nwmGraphLoader"><p><i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw graph-loader"></i>Loading NWM..</p></div></div></div>',_[n.SiteID].properties.defaultPopupContent=_[n.SiteID].properties.popupContent,l.addLayer(_[n.SiteID]),0==e("#centerSelect option:contains('"+n.Attributes.Office+"')").length&&e("#centerSelect").append(e("<option></option>").attr("value",n.Attributes.Office).text(n.Attributes.Office))})),e.getJSON(tripListJSON,(function(r){S=r.TripsCollection,e.each(S,(function(r,n){e.each(n,(function(r,n){e.each(n.Trip,(function(r,t){e.each(t.Sites,(function(e,r){_[r]&&(_[r].properties.tripName=t.TripName,_[r].properties.tripOwner=t.TripOwner,_[r].properties.popupContent="<b>"+r+"</b></br></br>"+_[r].properties.siteName+'</br><a href="https://waterdata.usgs.gov/nwis/inventory/?site_no='+r+'" target="_blank">Access Data</a></br></br><b>Office: </b>'+n.OfficeName+"</br><b>Trip Name: </b>"+_[r].properties.tripName+"</br><b>Trip Owner: </b>"+_[r].properties.tripOwner+'<div id="graphContainer" style="width:100%; height:200px;display:none;"></div><div class="container" style="width:100%;"><div class="row"><div class="col-md-4 graphLoader" id="nwisGraphLoader"><p><i class="fa fa-cog fa-spin fa-3x fa-fw graph-loader"></i>Loading NWIS...</p></div><div class="col-md-4 graphLoader" id="ahpsGraphLoader"><p><i class="fa fa-cog fa-spin fa-3x fa-fw graph-loader"></i>Loading AHPS...</p></div><div class="col-md-4 graphLoader" id="nwmGraphLoader"><p><i class="fa fa-cog fa-spin fa-3x fa-fw graph-loader"></i>Loading NWM..</p></div></div></div>',_[r].properties.defaultPopupContent=_[r].properties.popupContent)}))}))}))}))})),k(go2warningsJSON)})),m.addLayer(L.imageOverlay("https://radar.weather.gov/ridge/Conus/RadarImg/northeast_radaronly.gif",[[35.13102,-81.613834],[49.508061,-66.517938]])),d.addLayer(L.imageOverlay("https://radar.weather.gov/ridge/RadarImg/N0Z/ENX_N0Z_0.gif",[[38.578726,-78.420367],[46.578726,-69.693094]])),d.addLayer(L.imageOverlay("https://radar.weather.gov/ridge/RadarImg/N0Z/BGM_N0Z_0.gif",[[38.193727,-80.341364],[46.193727,-71.614092]])),d.addLayer(L.imageOverlay("https://radar.weather.gov/ridge/RadarImg/N0Z/BUF_N0Z_0.gif\t",[[38.941729,-83.093363],[46.941729,-74.36609]])),d.addLayer(L.imageOverlay("https://radar.weather.gov/ridge/RadarImg/N0Z/TYX_N0Z_0.gif",[[39.748728,-80.036364],[47.748728,-71.309091]])),d.addLayer(L.imageOverlay("https://radar.weather.gov/ridge/RadarImg/N0Z/OKX_N0Z_0.gif",[[36.858728,-77.220362],[44.858728,-68.493089]])),c.addLayer(L.imageOverlay(" https://radar.weather.gov/ridge/RadarImg/N0R/ENX_N0R_0.gif",[[39.894591,-76.989871],[45.267637,-71.128366]])),c.addLayer(L.imageOverlay(" https://radar.weather.gov/ridge/RadarImg/N0R/BGM_N0R_0.gif",[[39.526025,-78.893004],[44.866266,-73.067287]])),c.addLayer(L.imageOverlay(" https://radar.weather.gov/ridge/RadarImg/N0R/BUF_N0R_0.gif",[[40.241795,-81.680043],[45.646381,-75.78413]])),c.addLayer(L.imageOverlay(" https://radar.weather.gov/ridge/RadarImg/N0R/TYX_N0R_0.gif",[[41.012603,-78.662387],[46.48944,-72.687656]])),c.addLayer(L.imageOverlay(" https://radar.weather.gov/ridge/RadarImg/N0R/OKX_N0R_0.gif",[[38.245599,-75.712675],[43.476892,-70.00581]])),g.addLayer(L.imageOverlay(" https://radar.weather.gov/ridge/RadarImg/NTP/ENX_NTP_0.gif",[[39.894178,-76.99032],[45.268049,-71.127915]])),g.addLayer(L.imageOverlay(" https://radar.weather.gov/ridge/RadarImg/NTP/BGM_NTP_0.gif",[[39.52562,-78.893445],[44.866669,-73.066846]])),g.addLayer(L.imageOverlay(" https://radar.weather.gov/ridge/RadarImg/NTP/BUF_NTP_0.gif",[[40.241382,-81.680491],[45.646793,-75.78368]])),g.addLayer(L.imageOverlay(" https://radar.weather.gov/ridge/RadarImg/NTP/TYX_NTP_0.gif",[[41.01219,-78.662836],[46.489851,-72.687205]])),g.addLayer(L.imageOverlay(" https://radar.weather.gov/ridge/RadarImg/NTP/OKX_NTP_0.gif",[[38.245202,-75.713107],[43.477288,-70.005377]])),e(".collapse.show").each((function(){console.log("in collapse show"),e(this).prev(".card-header").find("svg").addClass("fa-minus").removeClass("fa-plus")})),e(".collapse").on("show.bs.collapse",(function(){e(this).prev(".card-header").find("svg").removeClass("fa-plus").addClass("fa-minus")})).on("hide.bs.collapse",(function(){e(this).prev(".card-header").find("svg").removeClass("fa-minus").addClass("fa-plus")})),e("#centerSelect").on("change",(function(){var n=e("#centerSelect :selected").text();e('#tripSelect option[value!="default"]').remove(),function(n){s.clearLayers(),i.clearLayers(),l.eachLayer((function(e){e.properties.office===n&&T(e.properties.siteID)})),s.getLayers().length<=2?r.flyToBounds(s.getBounds()):O(n);e("#tripSelect").show(),e.each(S,(function(r,t){-1!==t.WSC.OfficeName.indexOf(n)&&e.each(t.WSC.Trip,(function(r,n){e("#tripSelect").append(e("<option></option>").attr("value",n.TripOwner).text(n.TripName))}))}))}(n)})),e("#tripSelect").on("change",(function(){!function(n){s.clearLayers(),i.clearLayers(),e.each(S,(function(r,t){-1!==t.WSC.OfficeName.indexOf(n.tripCenter)&&e.each(t.WSC.Trip,(function(r,t){t.TripName==n.tripName&&e.each(t.Sites,(function(e,r){T(r)}))}))})),s.getLayers().length<=2?r.flyToBounds(s.getBounds()):O(n.tripName)}({tripName:e("#tripSelect :selected").text(),tripOwner:e("#tripSelect :selected").attr("value"),tripCenter:e("#centerSelect :selected").text()})})),e("#go2typeSelect").on("change",(function(){D(e("#go2typeSelect :selected").text())})),e(".basemapBtn").click((function(){e(".basemapBtn").removeClass("slick-btn-selection"),e(this).addClass("slick-btn-selection"),function(e){switch(e){case"Streets":e="Streets";break;case"Satellite":e="Imagery";break;case"Topo":e="Topographic";break;case"Terrain":e="Terrain";break;case"Gray":e="Gray";break;case"NatGeo":e="NationalGeographic";break;case"Verizon":e="Verizon"}o&&r.removeLayer(o);if("Verizon"===e){o=L.imageOverlay("./images/verizon_coverage.jpg",[[40.464082713022,-80.23879543723],[45.162293719815,-71.69092847148]]).addTo(r),r.addLayer(o)}else o=Object(w.a)(e),r.addLayer(o),a&&r.removeLayer(a),"Gray"!==e&&"Imagery"!==e&&"Terrain"!==e||(a=Object(w.a)(e+"Labels"),r.addLayer(a))}(this.id.replace("btn",""))})),e("#mobile-main-menu").click((function(){e("body").toggleClass("isOpenMenu")})),e("#togglePeople").click((function(){C()})),e(".radarBtn").click((function(){e(this).hasClass("slick-btn-selection")?(e(this).removeClass("slick-btn-selection"),z()):(e(".radarBtn").removeClass("slick-btn-selection"),e(this).addClass("slick-btn-selection"),function(n){z(),"sr_NWS_layer"==n&&(r.addLayer(c),e("#NWSlegend").append("<img alt='NWS legend' id='LegendImg' src='https://radar.weather.gov/ridge/kml/radarkeyimages/ENX_N0R_Legend_0.gif'/>"));"lr_NWS_layer"==n&&(r.addLayer(d),e("#NWSlegend").append("<img alt='NWS legend' id='LegendImg' src='https://radar.weather.gov/ridge/kml/radarkeyimages/ENX_N0Z_Legend_0.gif'/>"));"storm_NWS_layer"==n&&(r.addLayer(g),e("#NWSlegend").append("<img alt='NWS legend' id='LegendImg' src='https://radar.weather.gov/ridge/kml/radarkeyimages/ENX_NTP_Legend_0.gif'/>"));"reflectivity_NWS_conus_layer"==n&&(r.addLayer(m),e("#NWSlegend").append("<img alt='NWS legend' id='LegendImg' src='https://radar.weather.gov/ridge/kml/radarkeyimages/ENX_NCR_Legend_0.gif'/>"))}(e(this).val()))})),e("#resetView").click((function(){!function(){e("#centerSelect").val(e("#centerSelect option:first-child").val()),e("#tripSelect").find("option:gt(0)").remove(),e("#togglePeople").hasClass("btn-primary")&&C();e("#go2typeSelect").val("full"),D("Go2"),s.clearLayers(),i.clearLayers(),z(),e(".radarBtn").removeClass("active"),r.setView([MapY,MapX],7)}()})),e("#aboutButton").click((function(){e("#aboutModal").modal("show")})),l.on("click",(function(r){!function(r){if(console.log("OPENING POPUP...",r),e("#graphContainer").remove(),e(".graphLoader").remove(),t=void 0,e.ajaxQ.abortAll(),r.layer.bindPopup(r.layer.properties.popupContent,{minWidth:300}).openPopup(),"sw"===r.layer.properties.siteType||"gw"===r.layer.properties.siteType){e.getJSON(USGSwaterServicesURL+r.layer.properties.siteID+"&parameterCd=00060,00065,62614,62615,62619,72214,72264,72019&period=P7D",(function(n){if(!n.data||n.data[0].time_series_data.length<=0)return setTimeout((function(){e("#nwisGraphLoader").html("<p><i>No NWIS waterservices data was found</i></p>"),e("#ahpsGraphLoader").remove(),e("#nwmGraphLoader").remove()}),500),void console.log("Found an NWIS site, but it had no data in waterservices: ",r.layer.properties.siteID);var a,o;console.log("NWIS data:",n);var i,s=!1;if(e.each(n.data,(function(e,r){-1!==r.parameter_name.indexOf("Discharge")?(s=!0,a="Discharge, cfs",i={tooltip:{pointFormat:o="Discharge: {point.y} cfs"},showInLegend:!0,id:"usgs-series",data:r.time_series_data,name:"USGS Measured discharge"}):-1!==r.parameter_name.indexOf("Elevation")?(r.parameter_name+=", ft",r.loc_web_ds.length>0?r.parameter_name+=" ("+r.loc_web_ds+")":a=r.parameter_name,o=r.parameter_name+": {point.y}",i={tooltip:{pointFormat:o},showInLegend:!1,id:"usgs-series",data:r.time_series_data,name:r.parameter_name}):"Water level, depth LSD"===r.parameter_name?(a="Elevation, ft",i={tooltip:{pointFormat:o="Elevation: {point.y} ft"},showInLegend:!1,id:"usgs-series",data:r.time_series_data,name:r.parameter_name}):-1===r.parameter_name.indexOf("Gage height")||s||(r.parameter_name+=", ft",r.loc_web_ds.length>0?r.parameter_name+=" ("+r.loc_web_ds+")":a=r.parameter_name,o=r.parameter_name+": {point.y}",i={tooltip:{pointFormat:o},showInLegend:!1,id:"usgs-series",data:r.time_series_data,name:r.parameter_name})})),!s)return t=void 0,console.log("This is a gw or non disharge site, so were done"),e(".graphLoader").remove(),void I(i,a);if(e("#nwisGraphLoader").remove(),I(i,a),_[r.layer.properties.siteID].properties.nws_id&&"n/a"!==_[r.layer.properties.siteID].properties.nws_id){console.log("Found AHPS site: ",_[r.layer.properties.siteID].properties.nws_id,"  Querying AHPS...");var l=AHPSurl+r.layer.properties.nws_id+"&output=xml";console.log("AHPS page url:",l),location.hostname.match("wim")&&(l=proxyURL+l),e.ajax({url:l,dataType:"xml",success:function(n){console.log("AHPS Response:",n);var t=[],i=!1;if(e(n).find("forecast").find("datum").each((function(){var r=e(this).find("valid").text();if(!s&&"Stage"===e(this).find("primary").attr("name")){var n=e(this).find("primary").attr("units"),a=parseFloat(e(this).find("primary").text());i=!0}if(s&&"Flow"===e(this).find("secondary").attr("name")){n=e(this).find("secondary").attr("units"),a=parseFloat(e(this).find("secondary").text());"kcfs"===n&&(a*=1e3),i=!0}if(i){var o=new Date(r)/1;t.push([o,a])}})),t.sort(),t.length<=1)return console.log("Found an AHPS Site, but no AHPS data was found: ",r.layer.properties.siteID,r.layer.properties.ahpsID),void e("#ahpsGraphLoader").remove();var l={tooltip:{pointFormat:o},showInLegend:!0,color:"#009933",name:"NWS River Forecast (AHPS)",id:"ahps-series",data:t};e("#ahpsGraphLoader").remove(),I(l,a)}})}else console.log("This is not an AHPS site:",r.layer.properties.siteID),e("#ahpsGraphLoader").remove();var p=Object(w.b)({url:NWMmapServiceURL}),d="site_no = '"+r.layer.properties.siteID+"'";e("#graphContainer").append("LOADING NWM DATA... Please Wait"),p.where(d),p.run((function(n,t,i){if(n)console.log(n);else if(0!=t.features.length){console.log("NWM Feature query results:",t);var s=t.features[0].properties.feature_id;22743145==s&&(s=22743167),console.log("Found NWM reach code: ",s,"  Querying NWM...");var l=NWMshortRangeURL+s;console.log("NWM page url:",l),location.hostname.match("wim")&&(l=proxyURL+l),e.ajax({url:l,dataType:"json",success:function(n){console.log("NWM Short Range Response:",n);var i=[];n[0].data.length;n[0]["reference-time"],n[0].units;e.each(n[0].data,(function(e,r){var n=r["forecast-time"],t=r.value,a=new Date(n)/1;i.push([a,t])})),i.sort();var l=i[i.length-1];console.log("Last short range NWM value:",l);var p=NWMmediumRangeURL+s;location.hostname.match("wim")&&(p=proxyURL+p),e.ajax({url:p,dataType:"json",success:function(n){console.log("NWM Medium Range Response:",n),n[0].data.length>0&&!0;n[0]["reference-time"],n[0].units;e.each(n[0].data,(function(e,r){var n=r["forecast-time"],t=r.value,a=new Date(n)/1;a>l[0]&&i.push([a,t])})),i.sort(),i.length<=1&&(console.log("Found a NWM Site, but no NWM data was found: ",r.layer.properties.siteID,r.layer.properties.nwm_reach_code),e("#nwmGraphLoader").remove(),reteurn);var s={tooltip:{pointFormat:o},showInLegend:!0,color:"#AF18EC",name:"NWM River Forecast for "+t.features[0].properties.site_name,id:"nwm-series",data:i};e("#nwmGraphLoader").remove(),I(s,a)}})}})}else console.log("Did not find NWM site for USGS Site: ",r.layer.properties.siteID)}))}))}}(r)})),r.on("popupopen",(function(e){var n=r.project(e.target._popup._latlng);n.y-=e.target._popup._container.clientHeight/2,r.panTo(r.unproject(n),{animate:!0})}))}))}.call(this,n(8))},29:function(e,r,n){var t=n(5),a=n(30);"string"==typeof(a=a.__esModule?a.default:a)&&(a=[[e.i,a,""]]);var o={insert:"head",singleton:!1};t(a,o);e.exports=a.locals||{}},30:function(e,r,n){(r=n(6)(!1)).push([e.i,'/* ======================== \r\n=========================== \r\nBase app layout \r\n=========================== \r\n=========================== */\r\nhtml, body, #mapDiv {\r\n\tpadding: 0;\r\n\tmargin: 0;\r\n\theight: 100%;\r\n\tfont-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";\r\n}\r\n.leaflet-popup-content-wrapper {\r\n\tborder-radius: 0px;\r\n}\r\n.app-wrapper{\r\n\tdisplay: flex;\r\n\tflex-direction: column;\r\n\theight: 100%;\r\n\twidth: 100%;\r\n}\r\n/* ======================== \r\n=========================== \r\nUSGS Navigation Bar \r\n=========================== \r\n=========================== */\r\n.top-bar{\r\n\tdisplay: flex;\r\n\tjustify-content: space-between;\r\n\twidth: 100%;\r\n\tmin-width: 100%;\r\n\tbackground-color: #022C55;\r\n\tbox-sizing: border-box;\r\n\tpadding: 0 15px;\r\n\theight: 58px;\r\n}\r\n/* Menu button - only shown on mobile */\r\n.top-bar-mobile-menu-button{\r\n\tdisplay: none;\r\n\tflex-direction: column;\r\n\tjustify-content: center;\r\n\tcolor: white;\r\n\twidth: 40px;\r\n\ttext-align: center;\r\n\tfont-size: 24px;\r\n\tmargin-right: 15px;\r\n}\r\n.top-bar-mobile-menu-button .mobile-icon-open{\r\n\twidth: 100%;\r\n\ttext-align: center;\r\n}\r\n.top-bar-mobile-menu-button .mobile-icon-close{\r\n\tdisplay: none;\r\n\tfont-size: 42px;\r\n\tbox-sizing: border-box;\r\n\tpadding: 0 0 8px 0;\r\n}\r\n/* Show on mobile */\r\n@media (max-width: 767px) {\r\n\t.top-bar-mobile-menu-button{\r\n\t\tdisplay: flex;\r\n   }\r\n}\r\n/* Branding - USGS logo and name */\r\n.top-bar-branding{\r\n\tflex-grow: 3;\r\n\tdisplay: flex;\r\n}\r\n.top-bar-logo{\r\n\tdisplay: flex;\r\n\tflex-direction: column;\r\n\tjustify-content: center;\r\n}\r\n.top-bar-logo img{\r\n\theight: 50px;\r\n\twidth: auto;\r\n}\r\n/* Shrink on mobile */\r\n@media (max-width: 767px) {\r\n\t.top-bar-logo img{\r\n\t\theight: 40px;\r\n   }\r\n}\r\n.top-bar-app-name{\r\n\tdisplay: flex;\r\n\tflex-direction: column;\r\n\tjustify-content: center;\r\n\tfont-size: 18px;\r\n\tfont-weight: 500;\r\n\tpadding: 0 0 2px 25px;\r\n\tbox-sizing: border-box;\r\n\tcolor: white;\r\n\tline-height: 20px;\r\n}\r\n/* Shrink on mobile */\r\n@media (max-width: 767px) {\r\n\t.top-bar-app-name{\r\n\t\tfont-size: 16px;\r\n\t\tline-height: 18px;\r\n\t\tpadding: 0 0 0 15px;\r\n   }\r\n}\r\n.top-bar-right{\r\n\tdisplay: flex;\r\n\tjustify-content: flex-end;\r\n}\r\n.top-bar-right button{\r\n\tborder: none;\r\n\tbackground-color: white;\r\n\tcolor: #022C55;\r\n\tborder-radius: 3px;\r\n\tbox-sizing: border-box;\r\n\ttransition: 0.15s;\r\n\tfont-weight: 600;\r\n\tfont-size: 14px;\r\n\tpadding: 3px 12px;\r\n}\r\n.top-bar-right button:hover{\r\n\tbackground-color: rgba(255,255,255,0.9);\r\n\ttransition: 0.15s;\r\n}\r\n.top-bar-right-item{\r\n\tdisplay: flex;\r\n\tmargin-left: 15px;\r\n\tflex-direction: column;\r\n\tjustify-content: center;\r\n}\r\n/* ======================== \r\n=========================== \r\nSidebar and Map \r\n=========================== \r\n=========================== */\r\n.app-body{\r\n\tdisplay: flex;\r\n\tflex-grow: 3;\r\n}\r\n\r\n#NWSlegend {\r\n\tposition: absolute;\r\n    z-index: 1000;\r\n}\r\n\r\n#main-menu {\r\n\twidth: 400px;\r\n\tmin-width: 400px;\r\n\ttransition: left .15s ease-in-out;\r\n\tbackground-color: #FFFFFF;\r\n\tz-index:1001;\r\n}\r\n/* Sidebar footer - developed by... */\r\n#sidebarFooter{\r\n\tdisplay: block;\r\n\ttext-align: center;\r\n\tfont-size: 14px;\r\n\tbox-sizing: border-box;\r\n\tpadding: 15px 10px;\r\n\tcolor: rgba(0,0,0,0.5);\r\n}\r\n#mapDiv{\r\n\twidth: 100%;\r\n\tflex-grow: 3;\r\n\tborder-left: 1px solid rgba(0,0,0,0.2);\r\n}\r\n/* Sidebar mobile toggle */\r\n@media (max-width: 767px) {\r\n   /* Slide menu out from left */\r\n\t.isOpenMenu #main-menu {\r\n\t\tleft: 0;\r\n   }\r\n   /* Change menu icon */\r\n\t.isOpenMenu .mobile-icon-close {\r\n\t\tdisplay: block;\r\n   }\r\n\t.isOpenMenu .mobile-icon-open {\r\n\t\tdisplay: none;\r\n   }\r\n\t#main-menu {\r\n\t\tposition: absolute;\r\n\t\tleft: -100%;\r\n\t\twidth: 90%;\r\n\t\tmax-width: 400px;\r\n\t\theight: 100%;\r\n\t\theight: calc(100% - 58px);\r\n\t\tbox-shadow: 2px 0px 25px -4px rgba(30,30,60,0.15);\r\n   }\r\n}\r\n/* ======================== \r\n=========================== \r\nUSGS Bottom Footer \r\n=========================== \r\n=========================== */\r\n.usgs-footer {\r\n\tbackground: #10152C;\r\n\tbox-sizing: border-box;\r\n\tpadding: 5px 0;\r\n\twidth: 100%;\r\n\tcolor: rgba(255,255,255,.5);\r\n\tfont-size:12px \r\n}\r\n@media (max-width:767px) {\r\n\t.usgs-footer {\r\n\t\ttext-align: center;\r\n   }\r\n}\r\n\r\n/* Uncomment the @media block below to hide on mobile */\r\n/* @media (max-width:767px) {\r\n\t.usgs-footer {\r\n\t\tdisplay: none !important;\r\n   }\r\n}*/\r\n\r\n\r\n.usgs-footer .tmp-container {\r\n\tmargin-right: auto;\r\n\tmargin-left: auto;\r\n\tpadding-left: 15px;\r\n\tpadding-right: 15px \r\n}\r\n.usgs-footer .tmp-container .footer-doi a {\r\n\tpadding: 2px 5px;\r\n\tcolor: rgba(255,255,255,.8);\r\n\ttransition: .15s \r\n}\r\n.usgs-footer .tmp-container .footer-doi a:hover {\r\n\tcolor: #fff;\r\n\ttransition: .15s \r\n}\r\n.usgs-footer .tmp-container hr {\r\n\tmargin: 3px auto !important;\r\n\topacity: .2 \r\n}\r\n\r\n/* ======================== \r\n=========================== \r\nMain Menu \r\n=========================== \r\n=========================== */\r\n.js-typeahead {\r\n   /* border:0px !important;\r\n\t*/\r\n\tborder-radius: 0.25rem!important;\r\n}\r\n.typeahead__container {\r\n\twidth:100%;\r\n}\r\n.select2 {\r\n\twidth: 100%!important;\r\n\tmargin-bottom: 5px;\r\n}\r\n.select2-selection--multiple .select2-search__field{\r\n\twidth:100%!important;\r\n}\r\n#siteIDFilter {\r\n\tpadding-right:0px!important;\r\n}\r\n#optionsPanel button {\r\n\tmargin-bottom:5px;\r\n\twidth: 100%;\r\n}\r\n#optionsPanel .card {\r\n\tbackground-color: #ECEEF3;\r\n}\r\n.select2-selection__choice {\r\n\tfont-size:12px;\r\n}\r\n#legend .circle {\r\n\tborder-radius: 50%;\r\n\twidth: 12px;\r\n\theight: 12px;\r\n\tfloat: left;\r\n\tmargin-top: 8px;\r\n}\r\n#legend span {\r\n\tpadding-left:16px;\r\n\tfont-size: 12px;\r\n}\r\n#legend .card-text {\r\n\theight: 40px;\r\n}\r\n#layersPanel .card {\r\n\tbackground-color: #ECEEF3;\r\n}\r\n.menu-content{\r\n\theight:100% \r\n}\r\n.menu-content .scrollable-content{\r\n\tdisplay: flex;\r\n\tflex-direction: column;\r\n\tjustify-content: space-between;\r\n\theight: 100%;\r\n}\r\n#main-menu .main-menu-container {\r\n\tposition: relative;\r\n\toverflow-y: auto;\r\n\theight: 100%;\r\n}\r\n#main-menu .sidebar-panel {\r\n\tbackground-color: #ffffff;\r\n\tmargin: 0 auto;\r\n\tborder: none;\r\n\tborder-bottom: 1px solid rgba(0,0,0,0.15);\r\n}\r\n .card-header > svg {\r\n\tfloat: right;\r\n}\r\n/*.card-header:after {\r\n\tfont-family: \'Font Awesome 5 Free\';\r\n\tcontent: \'\\f068\';\r\n\tfont-weight: 900;\r\n\tdisplay:none;\r\n}\r\n.card-header.collapsed:after {\r\n\tfont-family: "Font Awesome 5 Free";\r\n\tcontent: "\\f067";\r\n\tfont-weight: 900;\r\n\tdisplay:none;\r\n} */\r\n#main-menu .sidebar-panel .card-title {\r\n\tfont-size: 12pt;\r\n\tfont-weight: 600;\r\n   /* text-align: right;\r\n\t*/\r\n}\r\n#main-menu .sidebar-panel .card-header {\r\n\tbox-sizing: border-box;\r\n\tdisplay: block;\r\n\twidth: 100%;\r\n\tpadding: 15px;\r\n\tcolor: rgba(0,0,0,0.8);\r\n\tbackground-color: #ECEEF3;\r\n\tborder-top: 1px solid rgba(0,0,0,0.15);\r\n}\r\n#main-menu .sidebar-panel .card-header:hover {\r\n\tcursor: pointer;\r\n\tbackground-color: rgba(255, 255, 255, 0.5);\r\n\tcolor: #000;\r\n}\r\n#main-menu .slick-btn {\r\n\tborder: none;\r\n\toutline: none;\r\n\tborder-radius: 0;\r\n\tfont-size: 9pt;\r\n\tbox-sizing: border-box;\r\n\tpadding: 5px;\r\n\tdisplay: block;\r\n\twidth: 100%;\r\n\ttext-align: left;\r\n\tcolor: #6F758E;\r\n\tmargin: 0 auto;\r\n\tborder-left: 4px solid transparent;\r\n}\r\n#main-menu .slick-btn img {\r\n\theight: 25px;\r\n\tvertical-align: middle;\r\n\tdisplay: inline-block;\r\n\tmargin: 0 15px 0 0;\r\n\tborder-radius: 0;\r\n\tborder: none;\r\n}\r\n#main-menu .slick-btn br {\r\n\tdisplay: none;\r\n}\r\n#main-menu .slick-btn:hover {\r\n\tborder-color: #333;\r\n\tbackground-color: rgba(236, 238, 243, 0.5);\r\n}\r\n#main-menu .slick-btn:focus {\r\n\tbackground-color: #ECEEF3;\r\n\tborder-color: #4574CC;\r\n}\r\n#main-menu .slick-btn-selection {\r\n\tbackground-color: rgba(117, 136, 184, 0.5);\r\n\tborder-color: #4574CC !important;\r\n}\r\n.footer-links {\r\n\tfont-weight: 300;\r\n\tletter-spacing: 1.5px;\r\n\tbox-sizing: border-box;\r\n\tpadding: 10px;\r\n\tdisplay: block;\r\n\ttext-align: center;\r\n\topacity: .5;\r\n\tpadding:3px;\r\n}\r\n.footer-links a {\r\n\tdisplay: inline-block;\r\n\tbox-sizing: border-box;\r\n\tpadding: 0 4px;\r\n\tfont-size: 8pt;\r\n}\r\n.footer-icons {\r\n\tpadding: 10px;\r\n\tletter-spacing: 6px;\r\n\ttext-align: center;\r\n\topacity: .5;\r\n}\r\n/************* END MAIN MENU **************/',""]),e.exports=r},50:function(e,r,n){var t={"./en-au":10,"./en-au.js":10,"./en-ca":11,"./en-ca.js":11,"./en-gb":12,"./en-gb.js":12,"./en-ie":13,"./en-ie.js":13,"./en-il":14,"./en-il.js":14,"./en-in":15,"./en-in.js":15,"./en-nz":16,"./en-nz.js":16,"./en-sg":17,"./en-sg.js":17};function a(e){var r=o(e);return n(r)}function o(e){if(!n.o(t,e)){var r=new Error("Cannot find module '"+e+"'");throw r.code="MODULE_NOT_FOUND",r}return t[e]}a.keys=function(){return Object.keys(t)},a.resolve=o,e.exports=a,a.id=50}});