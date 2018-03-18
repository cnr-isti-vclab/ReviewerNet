from fuzzywuzzy import fuzz
from fuzzywuzzy import process

#Set of interesting Journals J 
journals = ['ACM Transactions on Graphics', 'ACM Trans. on Graph.','ACM Trans. Graph.', \
            'ACM TOG','Computer Graphics Forum', 'Comp. Graph. Forum', \
            'IEEE Transactions on Visualization and Computer Graphics', \
            'IEEE Trans. Vis. Comput. Graph.', 'IEEE TVCG',\
           'Comput. Graphics Forum', 'Comput. Graph. Forum']


def getFuzzyP(path):
	add = 0
	scoreTot = 0
	fuzzyP = []
	read = 0
	i = 0
	with open(path, mode = "r", encoding = 'utf-8') as f:
	    lenght = LengthOfFile(f)
	    for l in f:
	        read += len(l)+1
	        p = json.loads(l)
	        jn = p['journalName']
	        v = p['venue']
	        sv = 0
	        sj = 0
	        if not(v == ''):
	            sv = process.extractOne(v, journals, scorer=fuzz.token_sort_ratio)[1]
	        if not(jn == ''):
	            sj = process.extractOne(jn, journals, scorer=fuzz.token_sort_ratio)[1]
	        score = max(sv, sj)
	        if score > 80:
	            scoreTot += score
	            fuzzyP.append(p)
	            add += 1
	        if(i%1000000==0):
	            perc = (read*100)/lenght
	            perc = str(perc)
	            perc = perc[0:5]
	            tm = time.asctime()
	            tm = tm.split(' ')
	            tm = tm[4]
	            print('['+tm+'] Processed '+str(perc)+' - '+str(i)+' papers - ')
	        i+=1
	avgScore = scoreTot/add 
	print('Average score: '+str(avgScore)+' - Passed: '+str(add))
	return fuzzyP

def getJandV(fuzzyP):
	fuzzyJ = set()
	fuzzyV = set()
	for p in fuzzyP:
	    jn = p['journalName']
	    v = p['venue']
	    sv = 0
	    sj = 0
	    if not(v == ''):
	        fuzzyV.add(v)
	    if not(jn == ''):
	        fuzzyJ.add(jn)
	print(fuzzyJ)
	print("-------------------")
	print(fuzzyV)

#Fuzzy serach for papers with venue or journal in the interesting list
fuzzyP = getFuzzyP()
# >>> OUT : Average score: 97.11 - Passed: 6375

#prints and returns all journals and venues in the fuzzy-filtered papers
getJandV(fuzzyP)
# >>> OUT:
	#JOURNALS
	# {
	# 'IEEE Trans. Vis. Comput. Graph.', 'Computers & graphics', 
	# 'IEEE computer graphics and applications', 'Acta cardiologica', 
	# 'ACM Trans. Graph.', 'IEEE transactions on visualization and computer graphics', 
	# 'Comput. Graph. Forum', 'Commun. ACM', 'Computer graphics', 
	# 'ACM transactions on graphics', 'Interactions', 'Computers & Graphics', 
	# 'Computer graphics forum : journal of the European Association for Computer Graphics'
	# }
	#-----------------------------------
	# VENUES
	# {
	# 'Afrigraph', 'Pacific Conference on Computer Graphics and Applications', 
	# 'SIGGRAPH Electronic Art and Animation Catalog', 'VRST', 
	# 'Comput. Graph. Forum', 'Commun. ACM', 'Computer graphics', 
	# 'Human Vision and Electronic Imaging', 'SIGGRAPH Visual Proceedings', 
	# 'Mobile Computing and Ambient Intelligence', 'IEEE Trans. Vis. Comput. Graph.',
	# 'SIGGRAPH Educators Program', 'SIACG', 'SBM', 
	# 'IEEE transactions on visualization and computer graphics', 'APGV', 
	# 'Graphics Interface', 'SIGGRAPH Emerging Technologies', 'SIGGRAPH ASIA Technical Briefs',
	# 'Computers & Graphics', 'Symposium on Computational Geometry', 
	# 'SIGGRAPH Posters', 'Computational Aesthetics', 'Workshop on Graphics Hardware', 
	# 'EGPGV', 'UIST', 'Graph Drawing', 'VMV', 'Eurographics', 'SIBGRAPI', 'SI3D', 
	# 'Eurographics Workshop on Graphics Hardware', 'Parallel Computing', 
	# 'SIGGRAPH Sketches', 'ACM Trans. Graph.', 'SIGGRAPH Computer Animation Festival',
	# 'Presence', 'IPT/EGVE', 'SIGGRAPH Courses', 'SIGGRAPH', 'SIGGRAPH Talks'
	# }