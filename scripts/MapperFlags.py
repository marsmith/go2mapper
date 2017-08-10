#!/usr/opt/bin/python
# MapperFlags.py, TAS, 3/28/2013
# Process GO2 report to categorize warning flags for use in Mapper
# Written by Todd Siskin, US Geological Survey, Troy, NY
#
# Version 1.11
#
# Modifications
# 11/13/08  TAS   Original Coding (SIMS2HTML)
# 03/28/13  TAS   Repurposed code for MapperFlags project.
# 04/04/13  TAS   Added additional metadata entries.
# 04/08/13  TAS   Added IMAP support for reading data.
# 04/12/13  TAS   Write Go2/Lite files separately.
# 06/13/13  TAS   Redesign malformed site processing. Check list, and parse names ignoring 
#                   the parenthesis in station name. Allows for 1 or more names to be pulled.
# 10/21/14  TAS   Added test to filter DEBUG statements added to GO2 by TAS/GKButch
#                 Added test to only save stations with flags. Some DEBUG stations have no flags.
# 10/02/15  TAS   Fixed login error exception typo. (imaplib. -> mail.)
# 11/19/15  TAS   Added check for URL in output stream for ND/IN report. Some offices might
#                   have the site URL as part of the GO2 email. Added JSON element if exists.
# 06/16/16  TAS   Added exception trapping for IMAP server connection for when network is down.
# 08/11/16  TAS   Fixed mistake in imap open. Check for IOError rather than socker.error.
# 01/10/17  TAS   Changed all URL references to HTTPS due to DOI changes.
# 02/22/17  TAS   Added command-line processing for test and file options.
#                 Added --file option to read report from disk rather than dropbox.
#                   Use -f for default ALL.output report and --file= to specify report file.
# 03/24/17  TAS   Added Amazon upload module from Marty for backup service because AFS has been
#                   down for an extended period.
#
# Description:

import os, sys, time, string, getopt
import getpass, json, imaplib, email

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

def grepall(list, srch):
   buffer = []
   gindx = 0
   for item in list:
      if item.find(srch) != -1:
         buffer.append(item)
      gindx += 1
   return buffer

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

   if result > 0:
      return True
   else:
      return False

# --- End functions

HomeDir = "/usr/local/wrdapp/locapp/Go2Mapper"
ReportDir = "/usr/local/wrdapp/go2"
strUser = #removed
strPwd = #removed          #  - NYData Application Password. No changes needed.
MalformedStations = ["04235600", "04233500"]
Go2Lite = False
dtm = time.strftime("%Y%m%d", time.localtime(time.time()))

# --- End Constants

Test = False
File = False
FileName = ""

try:
   Options, rest = getopt.getopt(sys.argv[1:], 'tf', ['test', 'file='])
except:
   print "Getopt error"
   sys.exit(1)

for opt, arg in Options:
   if opt in ("-t", "--test"):
      Test = True
   if opt in ("-f", "--file"):
      File = True
      FileName = arg
      if FileName == "":
         FileName = os.path.join(ReportDir, "ALL.output")

if Test:
   HomeDir = "./tmp"

if File:
   # Read GO2 report from specified file
   buffer = open(FileName).read()
else:
   # Check NYDATA mailbox for GO2 messages.
   try:
      mail = imaplib.IMAP4_SSL("imap.gmail.com")
   except IOError, why:
      print "Unable to connect to IMAP server. %s" % why
      sys.exit(1)

   # Login to mail server
   try:
      mail.login(strUser, strPwd) 
   except mail.error, why:
      print "Invalid login. %s" % why
      sys.exit(2)

   # Read the current GO2 message (full or lite). There should only be one.
   mail.select("inbox")
   result, data = mail.uid('search', None, '(HEADER Subject "ALL go2")')
   if data[0] == "":      # No Full mail, try Lite.
      result, data = mail.uid('search', None, '(HEADER Subject "ALL go2lite")')
      Go2Lite = True

   if data[0] != "":
      newestMsg = data[0].split()[-1]
      result, data = mail.uid('fetch', newestMsg, '(RFC822)')
      buffer = data[0][1]
      if not Test:
         mail.uid('store', newestMsg, '+FLAGS', '\\deleted')
         mail.expunge()
      mail.close
      mail.logout
   else:
      mail.close
      mail.logout
      # print "No message to process"
      sys.exit()

# Initialize Collection for JSON
GO2Coll = {}
GO2Coll["metadata"] = {}
GO2Coll["metadata"]["description"] = "Daily GO2 error flags for NY Water Science Center"
GO2Coll["metadata"]["development"] = "Written by Todd Siskin and Martyn Smith"
GO2Coll["metadata"]["created"] = time.strftime("%m/%d/%y %I:%M %p", time.localtime())

GO2Coll["SitesCollection"] = []

bufferSplit = buffer.split("\n")

# Determine range of data desired and limit buffer to that block.
idxOutputBegin = grep(bufferSplit, "output for ALL", True)
idxOutputEnd = grep(bufferSplit, "End of go2 output for ALL", True)
headerData = bufferSplit[idxOutputBegin+3:idxOutputEnd]

# Initialize temporary storage to be merged with full collection.
debug = False
intFlag = 1
tmpColl = {}
tmpColl["items"] = {}
tmpColl["items"]["SiteID"] = {}

# Process report block, parsing the data into the collection
for line in headerData:
   if line.find('DEBUG') != -1:
      debug = True
      continue
   if (line.find('http://') != -1) or (line.find('https://') != -1):
      StationURL = line
      continue
   if line != "\r" and line != "":          # Line contains information, parse it
      val, text = line.split("\t")
      if val.isdigit():   # All numeric indicates station information
         StationURL = ""
         if grep(MalformedStations, val, True) != -1:     # Malformed sites
            StationNo = val
            numUsers = text.count("(")
            work = text.split("(")
            rpltext = ""
            cnt = 1
            while cnt <= numUsers:  # Allow for 0, 1 or more than 1 user.
               if cnt != 1:
                  Usern = work[cnt].split(")")[0]
                  rpltext += "(%s) " % Usern
               cnt += 1
            StationName = text.replace(rpltext.strip(), "")
         else:           # Process normal station information
            Userlist = []
            numUsers = text.count("(")
            work = text.split("(")
            StationNo = val
            StationName = work[0]
            cnt = 1
            while cnt <= numUsers:  # Allow for 0, 1 or more than 1 user.
               Userlist.append(work[cnt].split(")")[0])
               cnt += 1
            Users= ", ".join(Userlist)
         tmpColl["items"]["SiteID"] = StationNo
         tmpColl["items"]["name"] = StationName
         tmpColl["items"]["users"] = Users
         if StationURL != "":
            tmpColl["items"]["URL"] = StationURL
      else:               # Line contains warning flags.
         if intFlag == 1:
            tmpColl["items"]["goflags"] = {}
            debug = False
         tmpColl["items"]["goflags"][intFlag] = {}
         tmpColl["items"]["goflags"][intFlag]["go2flag"] = val
         tmpColl["items"]["goflags"][intFlag]["go2msg"] = text
         intFlag += 1
   else:                   # Blank between sites, save collection and reinitialize temp.
      if not debug:
         GO2Coll["SitesCollection"].append(tmpColl)
      tmpColl = {}
      tmpColl["items"] = {}
      tmpColl["items"]["SiteID"] = {}
      intFlag = 1

# Done with buffer, convert collection to JSON output and write to disk.
OutBuffer = json.dumps(GO2Coll, sort_keys=True, indent=2, separators=(',', ': '))
OutFile = "Go2Warnings.json"
if Go2Lite:
   OutFile = "Go2LiteWarnings.json"

GO2WarnFD = open(os.path.join(HomeDir, OutFile), "w")
GO2WarnFD.write(OutBuffer)
GO2WarnFD.close()
 
if not Upload2Amazon(HomeDir, OutFile):
   print "File %s failed to transfer to Amazon Backup system." % OutFile
