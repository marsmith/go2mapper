#!/usr/opt/bin/python
# CheckSSLLibrary.py, TAS,6/22/2007
# Script to check that SSL is working after Solaris Patch Cluster updates.
# Written by Todd Siskin, US Geological Survey, Troy, NY
#
# Description:
#   Make a connection to the IMAP mail server and log in using the supplied credentials.
#   The patch 151914-04 causes SSL to fail. This will test for that.
#   If this patch (-04) is present, it needs to be removed. Patch -07 may need to be 
#    uninstalled first.

import imaplib, email
import getpass, sys

print "Attempting to connect to IMAP using SSL ..."
try:
   mail = imaplib.IMAP4_SSL("imap.gmail.com")
except AttributeError, key:
   print "Unable to open an SSL connection to IMAP."
   print "Most likely cause: Solaris patch 151914-04 broke the SSL library"
   print "Error returned: %s" % key
   sys.exit()

# Login to mail server
try:
   mail.login("nydata@usgs.gov", "JJTJwp49") 
except mail.error, key:
   print "Invalid login: %s" % key
   sys.exit()

print "SSL successfully connected."
mail.close
mail.logout

