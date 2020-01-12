import util as u
import io
import json


version = "cg_2019-10-01"
destination_path = "p_"+version+".txt"
auth_file = "a_"+version+".txt"
prefix = ""#"/media/mario/WD1TB/parser/L"


files = []
papers = []
j_files = []
journals = u.rebuild_journals()

print("Merging all filtered files")
with io.open("parsed_files.txt", mode='r', encoding = 'utf8') as f:
    for line in f:
        filename = unicode((line.split("/")[-1]).split(".")[0]+"-filtered")
        jname = unicode(filename+"-journals")
        fn = line.split("/")[-1]
        if not fn in files:
        	files.append(fn)
            j_files.append(u.import_partialJ(prefix+jname))
        	papers = papers + u.getP(prefix+filename)

print("Merged "+str(len(files))+" filtered files")
print(str(len(papers))+" papers and "+str(len(journals))+" journals/venues")
print(str(len(u.journals))+" journals in txt file")

for j_list in j_files:
    for j in j_list:
        try:
            journals[j['id']]['count'] += j['count']
        except:
            journals[j['id']] = j
            continue

PTIds, maxy = u.getPaperSet(papers)
u.start()

print("Computing journal/venue score")
papjv = u.get_papjv(papers)
journals = u.count_j(papjv, journals)
print("Updated journal dict:")
print(journals)

print(str(len(papers))+" papers from 1995 to "+str(maxy)+" collected. Starting papers' file creation...")
pTestingJSON, authoring, citations = u.getPapersTestingJSON(papers, PTIds)
print(str(len(pTestingJSON))+" a "+str(len(authoring))+" c "+str(len(citations)))
lp = len(papers)
lc = len(citations)
u.papersTestingForSearchFile(destination_path, pTestingJSON, authoring, citations)

### Create and write the authors' dataset
print("Papers' file created!")
print("Starting authors' file creation...")
authJSON = u.getAuthJson(papers)
la = len(authJSON)
A = u.authorsJSONObj(papers, authJSON)
## once A is ready you can write it with
u.authorsForSearchFile(auth_file, A)

print("Starting journals' file creation...")
with io.open("j_p"+version+".txt", mode='w', encoding = 'utf8')  as f:
    f.write(unicode('{"journals": ['))
    i = 0
    l = len(journals)
    for j_id in journals:
        tmp = {"id":j_id, "name_list": journals[j_id]['name_list'], "count":journals[j_id]['count'], "score":journals[j_id]['score']}
        f.write(unicode(json.dumps(tmp)))
        if i < l-1:
            f.write(unicode(',  '))
        i+=1
    f.write(unicode('], "papers":'+str(lp)+', '))
    f.write(unicode('"authors":'+str(la)+', ' ))
    f.write(unicode('"maxy":'+str(maxy)+', ' ))
    f.write(unicode('"cits":'+str(lc)+'}' ))
 
print("All files created!")
u.end()
print("You can now copy them into datasets folder and start using your personalized instance of ReviewerNet.")
