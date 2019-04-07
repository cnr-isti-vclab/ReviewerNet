import util as u
import io
import json

destination_path = "p_pers.txt"
auth_file = "a_pers.txt"

papers = []
j_files = []
journals = dict({})

print("Merging all filtered files")
with io.open("parsed_files.txt", mode='r', encoding = 'utf8') as f:
    for line in f:
        filename = unicode((line.split("/")[-1]).split(".")[0]+"-filtered")
        jname = unicode(filename+"-journals")
        j_files.append(u.import_partialJ(jname))
        papers = papers + u.getP(filename)

        
for j_list in j_files:
    for j in j_list:
        try:
            journals[j['id']]['count'] += j['count']
        except:
            journals[j['id']] = j
            continue;
my = 0
for p in papers:
	if p['year'] > my:
		my = p['year']
print(my)	

PTIds = u.getPaperSet(papers)
u.start()
print(str(len(papers))+" papers from 1995 to "+str(my)+" collected. Starting papers' file creation...")
pTestingJSON, authoring, citations = u.getPapersTestingJSON(papers, PTIds)
u.papersTestingForSearchFile(destination_path, pTestingJSON, authoring, citations)
u.end()
### Create and write the authors' dataset
print("Papers' file created!")
print("Starting authors' file creation...")
authJSON = u.getAuthJson(papers)
A = u.authorsJSONObj(papers, authJSON)
## once A is ready you can write it with
u.authorsForSearchFile(auth_file, A)
print("Starting journals' file creation...")
with io.open("j_pers.txt", mode='w', encoding = 'utf8')  as f:
    f.write(unicode('{"journals": ['))
    i = 0
    l = len(journals)
    for j_id in journals:
        tmp = {"id":j_id, "name_list": journals[j_id]['name_list'], "count":journals[j_id]['count']}
        f.write(unicode(json.dumps(tmp)))
        if i < l-1:
            f.write(unicode(',  '))
        i+=1
    f.write(unicode(']}'))
 
print("All files created!")
print("You can now copy them into datasets folder and start using your personalized instance of ReviewerNet.")
