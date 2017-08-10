#!/usr/opt/bin/python
# CreateMapperLists.py, TAS, 8/10/2016
# Get full list of sites and trips from SIMS for Go2Mapper project.

# Date      Programmer  Modification
# 05/08/12  Tsiskin     Add command line parsing
# 04/09/13  Tsiskin     Retrieve Office list and trip lists from SIMS page (--query)
# 04/10/13  Tsiskin     Remove command line parsing. Add code for JSON output.
# 08/30/13  Tsiskin     Changed Host, Added SIMSURL due to URL changes at server. 
# 04/05/16  Tsiskin     Filter out "Troy Projects" office designation. Not related to Mapper
#                       Move office info parsing to top of loop for filter.
# 08/10/16  Tsiskin     Create JSON sitelist file with lat/long informati0n 
# 08/12/16  Tsiskin     Use Trips to generate site list rather than the Office page.
#                        Discontinued sites may be on Office page but shouldn't be in trips.
#                        Change to build JSON when reading sites rather than building list.
# 08/22/16  Tsiskin     Fixed mistake where dict {} was used instead of list [] for top level.
#                        Now create TmpColl and append to list. Outer level does not need
#                        to be a unique level since only one set is created and appended
#                        rather than building the whole JSON in memory.
# 01/10/17  Tsiskin     Changed all non-SIMS URL references to HTTPS due to DOI changes.
# 02/03/17  Tsiskin     changed district_cd to wsc_id due to changes on WSC Organization.
# 03/27/17  Tsiskin     Merged Sites and Trips into one script.  Added Amazon upload.
# 04/03/17  Tsiskin     Added module for single site lookup when site not active. 

# global definitions

# Load System modules
import os, sys, getopt, time, string, urllib, urllib2, json

def grepall(list, srch):
    buffer = []
    gindx = 0
    for item in list:
       if item.find(srch) != -1:
          buffer.append(item)
       gindx += 1
    return buffer

def grep(list, srch, indx=None):
    gindx = 0
    for item in list:
        if item.find(srch) != -1:
            if indx:
                return gindx
            else:
                return item
        gindx += 1

    if indx:
       return -1
    else:
       raise IndexError

#
# Locate first line not containing search string.
#
def grepv(list, srch):
    gindx = 0
    for item in list:
        if item.find(srch) != -1:
            gindx += 1
    return gindx

#
# Retrieve site data from USGS Web Services database
#
def GetSiteInfo(state, full=False):
   values = []

   params = urllib.urlencode({'stateCD': state, 'format': 'rdb', 'siteStatus': 'active'})
   try:
      urlf = urllib.urlopen("https://%s/%s%s" % (WSHost, WSProgram, params))
   except IOError:
      print "Unable to connect to Web Services-Site Website."
      # continue
      sys.exit()

   try:
      data = urlf.read().split('\n')
      urlf.close()
   except:
      print "Unexpected network error."
      sys.exit()

   indx = grepv(data, "#")
   for entry in data[indx+2:-1]:
      work = entry.split('\t')

      if full:
         values.append('\t'.join(work))
      else:
         values.append("%s\t%s\t%s\t%s\t%s" % (work[1], work[2], work[3], work[4], work[5]))

   return values

def GetSite(site, full=False):
   params = urllib.urlencode({'site': site, 'format': 'rdb', 'siteStatus': 'all'})
   try:
      urlf = urllib.urlopen("https://%s/%s%s" % (WSHost, WSProgram, params))
   except IOError:
      print "Unable to connect to Web Services-Site Website."
      # continue
      sys.exit()

   try:
      data = urlf.read().split('\n')
      urlf.close()
   except:
      print "Unexpected network error."
      sys.exit()

   indx = grepv(data, "#")
   entry = data[indx+2]
   work = entry.split('\t')

   if full:
      values = '\t'.join(work)
   else:
      values = "%s\t%s\t%s\t%s\t%s" % (work[1], work[2], work[3], work[4], work[5])

   return values

def Upload2Amazon(filePath, fileName):

   import boto
   from boto.s3.connection import S3Connection, OrdinaryCallingFormat

   # Connection parameters
   keyId = #removed
   sKeyId = #removed
   bucketName = #removed
   bucketFolder = #removed

   # Attempt to connect to remote service
   s3_conn = boto.connect_s3(keyId, sKeyId, calling_format = OrdinaryCallingFormat())
   bucket = s3_conn.get_bucket(bucketName)

   # Open the specified file
   fileFD = open(os.path.join(filePath, fileName), 'r')

   # Get the Key object of the bucket
   k = boto.s3.key.Key(bucket)

   # Create a new key with id as the name of the file
   k.key= bucketFolder + '/' + fileName

   # Upload the file
   result = k.set_contents_from_file(fileFD)
   fileFD.close()

   if Debug:
      print "%d bytes transferred for file %s" % (result, os.path.join(filePath, fileName))

   if result > 0:
      return True
   else:
      return False

# --- End functions

# Set local definitions
SIMSHost = "sims.water.usgs.gov"
SIMS_SR_URL = "SIMSClassic/StationsRpts.asp"
SIMS_NI_URL = "SIMSClassic/NessInfo3.asp"
WSHost = "waterservices.usgs.gov"
WSProgram = "/nwis/site/?"
HomeDir = "/usr/local/wrdapp/locapp/Go2Mapper"
statecd = "NY"
wscid = 25

# Set up command-line parsing

Test = False
Debug = False

try:
   Options, rest = getopt.getopt(sys.argv[1:], 'tds:w:', ['test', 'debug', 'statecd=', 'wscid='])
except:
   print "Getopt error"
   sys.exit(1)

for opt, arg in Options:
   if opt in ("-t", "--test"):
      Test = True
   if opt in ("-d", "--debug"):
      Debug = True
   if opt in ("-s", "--statecd"):
      statecd = arg
   if opt in ("-w", "--wscid"):
      wscid = arg

if Test:
   HomeDir = "./tmp"

# Retrieve a full list of active sites with Lat/Long, Name and station type. 
#   Less overhead than single site pulls
#   Filter by agency_use_cd and district_cd. (Now wsc_id)

SiteInfo = GetSiteInfo(statecd, False)

# Set up Metadata for site JSON file.
SiteColl = {}
SiteColl["metadata"] = {}
SiteColl["metadata"]["description"] = "Data Section Site collection for NY Water Science Center"
SiteColl["metadata"]["development"] = "Written by Todd Siskin and Martyn Smith"
SiteColl["metadata"]["created"] = time.strftime("%m/%d/%y %I:%M %p", time.localtime())

SiteColl["SitesCollection"] = []

if Debug:
   print "Generating Site Collection"

# Pull main WSC (District) page from SIMS to scape Office menu data
params = urllib.urlencode({'wsc_id': wscid})
webpage = urllib.urlopen("http://%s/%s?%s" % (SIMSHost, SIMS_SR_URL, params)).read().split('\n')
dstart = grep(webpage, 'name="office_id', True)
dend = dstart + grep(webpage[dstart:], "</select>", True)

# Scrape office list menu data.
officelist = grepall(webpage[dstart:dend], "option")
for office in officelist:
   officeID = office.split('"')[1]
   officeName = office.split('>')[1].split('<')[0].strip()

   # Ignore extraneous options like "Troy Projects".
   if officeName.find(" Projects") != -1:
      continue

   # Pull each Office page from SIMS to scrape Trip menu data.
   params = urllib.urlencode({'wsc_id': wscid, 'office_id': officeID})
   webpage = urllib.urlopen("http://%s/%s?%s" % (SIMSHost, SIMS_SR_URL, params)).read().split('\n')
   ostart = grep(webpage, 'name="trip_id', True)
   oend = ostart + grep(webpage[ostart:], "</select>", True)

   # Scrape Trip list menu data
   triplist = grepall(webpage[ostart:oend], "option")
   for trip in triplist:
      tripID = trip.split('"')[1]
      if tripID != "":
         # For valid trips, pull Trip details page and scrape sites for that trip.
         params = urllib.urlencode({'wsc_id': wscid, 'trip_id': tripID})
         webpage = urllib.urlopen("http://%s/%s?%s" % (SIMSHost, SIMS_SR_URL, params)).read()

         # Process each site and save in JSON Dictionary structure.
         for line in grepall(webpage.split('\n'), "StationInfo"):
            Station = line.split('>')[2].split('<')[0]
            try:
               siteno, sitenm, sitetp, lat, long = grep(SiteInfo, Station, False).split('\t')
            except IndexError, why:
               # print "Site %s not found. %s" % (Station, why)
               # continue
               siteno, sitenm, sitetp, lat, long = GetSite(Station, False).split('\t')

            # Assign site type. (Pick out GW and AT. All others are SW)             
            if sitetp[0:2].lower() == 'gw':
               SiteType = "gw"
            elif sitetp[0:2].lower() == 'at':
               SiteType = "at"
            else:
               SiteType = "sw"

            TmpColl = {}
            TmpColl["SiteID"] = Station
            TmpColl["Attributes"] = {}
            TmpColl["Attributes"]["site_no"] = Station
            TmpColl["Attributes"]["site_type"] = SiteType
            TmpColl["Attributes"]["station_nm"] = sitenm
            TmpColl["Attributes"]["Office"] = officeName.split(' ')[0]
            TmpColl["Attributes"]["latDD"] = lat
            TmpColl["Attributes"]["lonDD"] = long
            SiteColl["SitesCollection"].append(TmpColl)

# Convert dictionary and output JSON file. 
OutBuffer = json.dumps(SiteColl, sort_keys=False, indent=2, separators=(',', ': '))
OutFile = "SiteList.json"
SiteFD = open(os.path.join(HomeDir, OutFile), "w")
SiteFD.write(OutBuffer)
SiteFD.close()

if not Upload2Amazon(HomeDir, OutFile):
   print "File %s failed to transfer to Amazon Backup system." % OutFile

TripColl = {}
TripColl["metadata"] = {}
TripColl["metadata"]["description"] = "Data Section Trip collection for NY Water Science Center"
TripColl["metadata"]["development"] = "Written by Todd Siskin and Martyn Smith"
TripColl["metadata"]["created"] = time.strftime("%m/%d/%y %I:%M %p", time.localtime())

TripColl["TripsCollection"] = []

if Debug:
   print "Generating Trip Collection"

params = urllib.urlencode({'wsc_id': wscid})
webpage = urllib.urlopen("http://%s/%s?%s" % (SIMSHost, SIMS_SR_URL, params)).read().split('\n')
dstart = grep(webpage, 'name="office_id', True)
dend = dstart + grep(webpage[dstart:], "</select>", True)
officelist = grepall(webpage[dstart:dend], "option")
for office in officelist:
   officeID = office.split('"')[1]
   officeName = office.split('>')[1].split('<')[0].strip()
   if officeName == "Troy Projects":
      continue

   tmpColl = {}
   tmpColl["WSC"] = {}
   tmpColl["WSC"]["OfficeID"] = {}

   tmpColl["WSC"]["OfficeID"] = officeID
   tmpColl["WSC"]["OfficeName"] = officeName
   tmpColl["WSC"]["Trip"] = {}
   tripNo = 1

   params = urllib.urlencode({'wsc_id': wscid, 'office_id': officeID})
   webpage = urllib.urlopen("http://%s/%s?%s" % (SIMSHost, SIMS_SR_URL, params)).read().split('\n')
   ostart = grep(webpage, 'name="trip_id', True)
   oend = ostart + grep(webpage[ostart:], "</select>", True)
   triplist = grepall(webpage[ostart:oend], "option")
   for trip in triplist:
      tripID = trip.split('"')[1]
      if tripID != "":
         tripinfo = trip.split('>')[1].split('<')[0]
         if tripinfo.count('-') == 1:
            indx = tripinfo.find('-')
         else:
            if tripinfo.find('-') < 10:
               indx = tripinfo.rfind('-')
            else:
               indx = tripinfo.find('-')
         tripName = tripinfo[:indx].strip()
         tripOwner = tripinfo[indx+1:].strip()
         tmpColl["WSC"]["Trip"][tripNo] = {}
         tmpColl["WSC"]["Trip"][tripNo]["TripID"] = tripID
         tmpColl["WSC"]["Trip"][tripNo]["TripName"] = tripName
         tmpColl["WSC"]["Trip"][tripNo]["TripOwner"] = tripOwner

         # *** Code to generate individual sites instead of a single element.
         # tmpColl["WSC"]["Trip"][tripNo]["Sites"] = {}
         # siteNo = 1

         StationList = []

         params = urllib.urlencode({'wsc_id': wscid, 'trip_id': tripID})
         webpage = urllib.urlopen("http://%s/%s?%s" % (SIMSHost, SIMS_SR_URL, params)).read()

         for line in grepall(webpage.split('\n'), "StationInfo"):
            Station = line.split('>')[2].split('<')[0]

            StationList.append(Station)
            # *** Code to generate individual sites instead of a single element.
            # tmpColl["WSC"]["Trip"][tripNo]["Sites"][siteNo] = {}
            # tmpColl["WSC"]["Trip"][tripNo]["Sites"][siteNo]["Site"] = Station
            # siteNo += 1
         tmpColl["WSC"]["Trip"][tripNo]["Sites"] = StationList
         tripNo += 1

   TripColl["TripsCollection"].append(tmpColl)

OutBuffer = json.dumps(TripColl, sort_keys=False, indent=2, separators=(',', ': '))
OutFile = "TripList.json"
TripFD = open(os.path.join(HomeDir, OutFile), "w")
TripFD.write(OutBuffer)
TripFD.close()

if not Upload2Amazon(HomeDir, OutFile):
   print "File %s failed to transfer to Amazon Backup system." % OutFile

