import util as u
import io

destination_path = "p_pers.txt"
auth_file = "a_pers.txt"

papers = []
print("Merging all filtered files")
with io.open("parsed_files.txt", mode='r', encoding = 'utf8') as f:
	for line in f:
		filename = unicode((line.split("/")[-1]).split(".")[0]+"-filtered")
		papers = papers + u.getP(filename)

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
print("All files created!")
print("You can now copy them into datasets folder and start using your personalized instance of ReviewerNet.")
