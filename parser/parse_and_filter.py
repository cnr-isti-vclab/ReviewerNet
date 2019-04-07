#!/usr/bin/python

import sys
import json
import util as u

filename = sys.argv[1]
filename = filename.split("/")[-1]
print("Extracting "+filename+" and filtering")

#Parsing and filtering corpus file with journals list in journals.py
papers, journals = u.fuzzy_search(filename)
filename = unicode(filename.split(".")[0]+"-filtered")
jname = unicode(filename+"-journals")
print("Saving resulting file into "+filename+" and "+jname)

if len(papers) > 0:
    u.saveP(papers, filename)
    u.export_partialJ(jname,journals)
