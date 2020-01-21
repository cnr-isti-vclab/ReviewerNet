#!home/mario/anaconda3/bin/python


import sys
import os
import json
import util as u
from shutil import copyfile
import os.path

filename = sys.argv[1]
#filename = filename.split("/")[-1]
prefix = ""#"/media/mario/WD1TB/parser/"
print("Extracting "+filename+" and filtering")


#Parsing and filtering corpus file with journals list in journals.py
papers, journals = u.fuzzy_search(prefix+filename)
filename = unicode(prefix+filename.split(".")[0]+"-filtered")
jname = unicode(filename+"-journals")
print("Saving resulting file into "+filename+" and "+jname)

if len(papers) > 0:
    u.saveP(papers, filename)
    u.export_partialJ(jname,journals)