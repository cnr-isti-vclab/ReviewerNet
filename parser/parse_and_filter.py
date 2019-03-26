#!/usr/bin/python

import sys
import json
import util as u

filename = sys.argv[1]
filename = filename.split("/")[-1]
print("Extracting "+filename+" and filtering")

#Parsing and filtering corpus file with journals list in journals.py
papers = u.fuzzy_search(filename)
filename = unicode(filename.split(".")[0]+"-filtered")
print("Saving resulting file into "+filename)

if len(papers) > 0:
	u.saveP(papers, filename)