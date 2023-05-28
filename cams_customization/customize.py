#!/usr/bin/env python

import jam      # to find jam.py location
import shutil   # to copy files
import os       # for mkdir

# find the location of the jam.js file on this OS
source=jam.__file__.split("__init__.py")[0]+"js/jam.js"
# copy it into this directory
destination="jam.js"
shutil.copyfile(source, destination)

# Read in the jam.js file
with open('jam.js', 'r', encoding="utf8") as file :
  originaldata = file.read()

# Read the section of code to look for
with open('jam_text_to_replace.js', 'r', encoding="utf8") as file :
  searchdata = file.read()

# Read the section of code to replace into the file
with open('jam_new_text.js', 'r', encoding="utf8") as file :
  replacedata = file.read()

# Do the replacement
newfile = originaldata.replace(searchdata, replacedata)
if newfile==originaldata:
    print("\nERROR: code replacement did not work.\nProbably the jam.js code has changed in this release of jam.py.\n[WARNING] DateTimePicker won't available in CAMS. This is a minor shortcoming.\nAborting.")
    quit()
# Write the file out again
with open('jam.js', 'w', encoding="utf8") as file:
 file.write(newfile)

# make directories for customizations
try:
    os.mkdir("../jam")
    os.mkdir("../jam/js")
    os.mkdir("../jam/css")
except:
    print("Debug: jam directory probably already exists.")
        
# copy customized file and datetimepicker
shutil.copyfile("jam.js", "../jam/js/jam.js")
shutil.copyfile("bootstrap-datetimepicker.js", "../jam/js/bootstrap-datetimepicker.js")
shutil.copyfile("bootstrap-datetimepicker.css", "../jam/css/bootstrap-datetimepicker.css")

# That's all
print("Done.")
