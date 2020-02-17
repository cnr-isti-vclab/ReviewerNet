import sys
import os
import json
import util as u
from shutil import copyfile
import os.path

filename = sys.argv[1]
prefix = ""
print("Extracting "+filename+" and filtering")


#Parsing and filtering corpus file with journals list in journals.py
papers = u.fuzzy_search(prefix+filename)
filename = unicode(prefix+filename.split(".")[0]+"-filtered")

print("Saving resulting file into "+filename)

if len(papers) > 0:
    u.saveP(papers, filename)