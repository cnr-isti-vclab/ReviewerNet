import json
import util as u
import io
import string
from string import maketrans

papers = keep#u.fuzzy_search(corpus_path, u.journals)
PTIds = u.getPaperSet(papers)
u.start()
print("Starting papers' file creation...")
pTestingJSON, authoring, citations = u.getPapersTestingJSON(papers, PTIds)
u.papersTestingForSearchFile(destination_path, pTestingJSON, authoring, citations)
u.end()
### Create and write the authors' dataset
print("Starting author' file creation...")
authJSON = u.getAuthJson(papers)
A = u.authorsJSONObj(papers, authJSON)
## once A is ready you can write it with
u.authorsForSearchFile(auth_file, A)

exclude_words = set([
    'foreword',
    'preface',
    'editorial',
    'editorials'
    'acknowledgements',
])

exclude2 = set([
    'guest',
    'editor',
    'editors',
])

def contains_words(s):
    spl = s.split(" ")
    splt = set()
    sp = []
    for s in spl:
         try:
            sp.append(str(s))
         except Exception:
            continue;
    #print(sp)
    for s in sp:
        splt.add(s.translate(maketrans('',''),string.punctuation).lower())
    return (len(exclude_words & splt)>0 or len(exclude2 & splt)>=2);

i = 0
keep = []
drop = []
with io.open(path, mode = "r", encoding="utf-8") as f:
    for l in f:
        p = json.loads(l)
        if (len(p['authors']) == 0) or (len(p['authors']) >= 15) or contains_words(p['title']):
            drop.append(p)
        else:
            keep.append(p)
        i += 1
        #if i % 1000000 == 0:
         #   print(str(i))
added = 0
for p in drop:
    if len(p['authors']) >= 15 and (len(p['authors']) < 57):
        if not(str(p['title']) == '3DUI 2010 Contest Grand Prize Winners'):
            print(p['title'])
            keep.append(p)
            added++

print("Kept: "+str(len(keep))+" - Discarder: "+str(len(drop)-added))
print("Total papers: "+str(i))            