from __future__ import division
import time
import json

def start():
    print('START at: ' + str(time.ctime()))
def end():
    print('END at: ' + str(time.ctime()))

#dataset format: all in one row
# {
# "authors": [ in js build a dictionary over id
#    # {idA, value(name) , coAuthList : [idACo, #pubs, year], paperIdList, lastPub : [year, idP] }, #the last has no comma.
#              0                1           a      0     1         2         3          0    1 
# ],
# "papers":[
#    {idP, value(name), authorsId, year, jN, venue(, top10Related:[idR, score] )}, the last no comma
#      id    0       1        2     3  4         5           idr   r(idP, idr)
# ],
# "authoringLinks":[
#     {"source": "authId", "target": "paperId", "value": 1},the last no comma
# ],
# "relatednessLinks":[
#     {"source": "paperId1", "target": "paperId2", "value": relatedness},the last no comma
# ]
#}

#Set of interesting Journals J 
journals = ['ACM Transaction on Graphics', 'ACM Trans. on Graph.', 'ACM Transaction on Graphics', 'ACM Trans. on Graph.' \
            'ACM Trans. Graph.', 'ACM TOG', 'Computer Graphics Forum', 'Comp. Graph. Forum', 'IEEE Transaction on Visualization and Computer Graphics', \
            'IEEE Trans. Vis. Comput. Graph.', 'IEEE TVCG', 'ACM Trans. Graph.', 'ACM TOG', 'Computer Graphics Forum', 'Comp. Graph. Forum', \
            'IEEE Transaction on Visualization and Computer Graphics', 'IEEE Trans. Vis. Comput. Graph.', 'IEEE TVCG']

#Useless sttributes in original dataset
attrDel = ['journalPages', 'journalVolume', \
        'pdfUrls', 'paperAbstract','s2Url']

#Set of interesting authors A, the ones that have published on a journal in J
def authorsJSON():
    with open(r"C:\*****\authorsCounter.json", mode='r', encoding = 'utf8') as jsonFilteredFile:
        authors = json.load(jsonFilteredFile)
    return authors

#Remove useless attributes. Writes to fWrite ...(...}, \n ...
#path format: r"C:\..\file.json"
def cleanFile(fRead, fWrite):
    with open(fRead, mode='r', encoding = 'utf8') as f1:
        with open(fWrite, mode='w', encoding = 'utf8') as f:
            lenght = LengthOfFile(f1)
            start()
            i = 1
            read = 0
            for line in f1:
                r = json.loads(line)
                read += len(line)+1
                for a in attrDel:
                    try:
                        del r[a]
                    except Exception:
                        continue;
                f.write(json.dumps(r))
                f.write('\n')
                if(i%100000==0):
                    perc = (read*100)/lenght
                    perc = str(perc)
                    perc = perc[0:5]
                    tm = time.asctime()
                    tm = tm.split(' ')
                    tm = tm[3]
                    print('['+tm+'] Processed '+str(perc)+' - '+str(i)+' papers - ')
                i+=1
    print('DONE.')
    end()

def LengthOfFile(f):
    currentPos=f.tell()
    f.seek(0, 2)          # move to end of file
    length = f.tell()     # get current position
    f.seek(currentPos, 0) # go back to where we started
    return length

#Filtering routine
#"C:\Users\mario\Desktop\sample.json" - 20MB
#"D:\Projects\SLVproj\papers-2017-10-30.json" - 49GB
#r"D:\Projects\SLVproj\papersEssential.json" - 15GB
def filterJournal(p,jName, vName):
	jName = p['journalName']
	vName = p['venue']
    return ((jName in journals) or (vName in journals))

#Filters all the papers in fPath according to the journal filter
def filterJFile(flt, fPath):
    papers = []
    with open(fPath, mode='r', encoding = 'utf8') as f:
        for line in f :
            r = json.loads(line)
            if (flt(r)):
                papers.append(r)
    print('----------------------------')
    print('DONE: '+ str(len(papers))+' filtered papers')
    return papers

#Returns an array with all the papers in fPath with at least an author in authSet
def papersFromAllAuthors(fPath, authSet):
    papers = set()
    with open(fPath, mode='r', encoding = 'utf8') as f:
        i = 1
        filePos = 0
        lenght = LengthOfFile(f)
        start()
        for line in f :
            lln = len(line) + len('\n')
            filePos += lln
            paperAuthorsSet = set()
            r = json.loads(line)
            authors = r['authors']
            if len(authors)>0:
                for auth in authors:
                    idA = auth['ids'] 
                    if len(idA)>0:
                        paperAuthorsSet.add(idA[0])
            if (len(paperAuthorsSet.intersection(authSet)) > 0):
                papers.add(r['id'])
            if i % 100000 == 0:
                perc =(filePos*100)/(lenght) 
                perc = str(perc)
                perc = perc[0:5]
                tm = time.asctime()
                tm = tm.split(' ')
                tm = tm[3]
                print('['+tm+'] Processed '+str(perc)+' - '+str(i)+' papers - ')
            i+=1
    end()
    print('----------------------------')
    print('DONE: '+ str(len(papers)) +' filtered papers')
    print('----------------------------')
    return papers

############################
#  authorsGraph functions  #
############################

#function that writes the authors JSON file in a file in path
def authorsForSearchFile(path, authJson1):
    with  open(path, mode='w', encoding = 'utf8')  as f:
        f.write('{"authors": [')
        for a in authJson1:
            idA = a
            a = authJson1[a]
            aF = {'idA':idA, 'value':a[0], 'coAuthList':a[1], 'paperList':a[2], 'lastPub':a[3]}
            f.write(json.dumps(aF))
            if i < l:
                f.write(', ')
        f.write(']}')
        #here add the writing of papers and graph links

# function that updates an authorDict entry 
# according to the employed model:
# {idA, value(name) , coAuthList : [idACo, #pubs, year], paperIdList, lastPub : [year, idP] },
#           0              1                  0      1     2             3			0   1 
def updateCoAuth(auths, idA, aL, year):
    for a in aL:
        if a != idA:
            if not(a in auths[idA][1]):
                if a in auths:
                    #name = auths[a][0] [Redundancy removed:search for name by id]
                    auths[idA][1][a]=[1, year]
            else:
                auths[idA][1][a][0] += 1
                if auths[idA][1][a][1] < year:
                    auths[idA][1][a][1] = year

# Function that adds all the author of a specified paper in an authorIdsSet
def addAuthId(authSet, authors):
	if len(authors)>0:
	    for auth in authors:
	        idA = auth['ids'] 
	        if len(idA)>0:
	            idA = idA[0]
	            authSet.add(idA)
	return authSet

# creates a set containing all the authors ids from a papers file in path           
def getAuthsIdSetF(path):
    start()
    i = 1
    filePos = 0
    lenght = 0
    authSet = set([])
    with open(path, mode='r', encoding = 'utf8') as f1:
        lenght = LengthOfFile(f1)
        for line in f1:
            lln = len(line) + len('\n')
            filePos += lln
            r = json.loads(line)
            authors = r['authors']
            authSet = addAuthId(authSet, authors)
            if i % 100000 == 0:
                perc =(filePos*100)/(lenght) 
                perc = str(perc)
                perc = perc[0:5]
                tm = time.asctime()
                tm = tm.split(' ')
                tm = tm[3]
                print('['+tm+'] Processed '+str(perc)+' - '+str(i)+' papers - ')
            i+=1
    end()
    return authSet

# creates a set containing all the authors ids in a papers array   
def getAuthsIdSet(papers):
    start()
    authSet = set([])
    for r in papers:       
        authors = r['authors']
        authSet = addAuthId(authSet, authors)
    end()
    return authSet

# Creates an empty (only ids and names) authors Dictionary 
# (the one to be written on file) from an array of papers
def getAuthJson(papers):
    authJson = dict()
    for p in papers:
        authors = p['authors']
        for ap in authors:
            if ((len(ap['ids']) > 0) and (not(ap['ids'][0] in authJson))):
                name = ap['name']
                authJson[ap['ids'][0]] = [name, dict(), [], [0, '']]
    return authJson

# Starting from an empty authors dictionary authJson1, as the one returned by generateAuthJson(),
# this function completes it computing the coAuth list, paperIds list and last pub
# and returns the complete authorsDictionary as output
def authorsJSONObj(papers, authJson1):
    l = len(papers)
    i=1
    start()
    for s in papers:
        paperAuths = set([])
        authors = s['authors']
        idP = s['id']
        try:
            year = s['year']
        except Exception:
            year = 0
            continue;
        for ap in authors:
            if ((len(ap['ids']) > 0) and (ap['ids'][0] in authJson1)):
                paperAuths.add(ap['ids'][0])
        for ap in authors:   
            if ((len(ap['ids']) > 0) and (ap['ids'][0] in authJson1)):
                idA = ap['ids'][0]
                updateCoAuth(authJson1, idA, paperAuths, year)
                authJson1[idA][2].append(idP)
                if year > authJson1[idA][3][0]:
                    authJson1[idA][3] = [year, idP]
        if(i%10000==0):
            perc = (i*100)/l
            perc = str(perc)
            perc = perc[0:5]
            tm = time.asctime()
            tm = tm.split(' ')
            tm = tm[3]
            print('['+tm+'] Processed '+str(perc)+' - '+str(i)+' papers - ') 
        i+=1
    end()
    return authJson1

# Set of functions for extractiong out and in citations id
# from an array of papers:
# just call getOutIn(papers, parersIds:set(), ret:boolean)
def printStats(P, PinIds, PoutIds, paperWithOut, paperWithIn):
    #Print stats:
    p = str(len(P))
    Pout = str(len(PoutIds))
    Pin = str(len(PinIds))
    avgPin = str(len(PinIds)/(len(P)))
    avgPin = avgPin[:5]
    avgPout = str(len(PoutIds)/(len(P)))
    avgPout = avgPout[:5]

    print('---------------------------------------------------------')
    print('|P| = '+p+' ::: |Pout| = '+Pout+' ::: |Pin| = '+Pin)
    print('|P U Pout| \\ intersection = '+str(len(P.union(PoutIds)))+' ::: |P U Pin| \\ intersection = '+str(len(P.union(PinIds))))
    print('|P U Pout U Pin| \\ intersections = '+str(len(P.union(PoutIds.union(PinIds)))))
    print('---------------------------------------------------------')
    print('Average Pin = '+avgPin+' ::: Average Pout = '+avgPout)
    print('#Papers with Pin = '+str(paperWithIn)+' ::: #Papers with Pout = '+str(paperWithOut))
    
def paperCheck(PIds, paperCitations):
    for idC in paperCitations:
        if not(idC in PIds):
            PIds.add(idC)

# Get out and in citations ids from a paper SET as input and prints some stats:
# if ret is True, Out and In IDs will be returned,
# otherwise some genela stats will be printed
def getOutIn(papers, P, ret):
    PoutIds = set()
    PinIds = set()
    paperWithOut = 0
    paperWithIn = 0
    for p in papers:
        try:
            outC = p['outCitations']
            if len(outC)>0:
                paperWithOut += 1
                paperCheck(PoutIds, outC)
        except Exception:
            continue;
        try:
            inC = p['inCitations']
            if len(inC)>0:
                paperWithIn += 1
                paperCheck(PinIds, inC)
        except Exception:
            continue;
    printStats(P, PinIds, PoutIds, paperWithOut, paperWithIn)
    if(ret):
        return PoutIds, PinIds

# Function that appends out and in citations, whose ids are in extraIds, 
# to a papers array, reading extra papers from path
def appendInOutPapers(papers, PIds, extraIds, path):
    with open(path, mode = "r", encoding = 'utf-8') as f:
        i = 0
        filePos = 0
        lenght = LengthOfFile(f)
        start()
        for l in f:
            p = json.loads(l)
            idP = p['id']
            #check for duplicates of p already in P
            if (not(idP in PIds) and (idP in extraIds)):
                papers.append(p)
            lln = len(l) + len('\n')
            filePos += lln
            if i % 100000 == 0:
                perc =(filePos*100)/(lenght) 
                perc = str(perc)
                perc = perc[0:5]
                tm = time.asctime()
                tm = tm.split(' ')
                tm = tm[3]
                print('['+tm+'] Processed '+str(perc)+' - '+str(i)+' papers - ')
            i+=1
        end()
        return papers

def getPaperSet(papers):
	pS = set()
	for p in papers:
	    pS.add(p['id'])
	return pS

def getAuthSet(authJSON):
	aS = set()
	for a in authJSON:
    	aS.add(a)
    return aS

####################
#       USAGE      #
####################
# get P, set of interesting papers:
P = filterFile(filterJournal, r"C:\***\papers.json") 
#>> DONE: 2943 filtered papers 

# get A, authors of at least one paper in P
authJSON = getAuthJson(P)
A = authorsJSONObj(P, authJSON)
# once A is ready you can write it with
# authorsForSearchFile(path, A)

# get P_in, P_out and P' and print some interesting stats
PIds = getPaperSet(P)
PoutIds, PinIds = getOutIn(P, PIds, True)
PExtra = PoutIds.union(PinIds)
PPrime = appendInOutPapers(P, PIds, PExtra, r"C:\***\papers.json")
#OUT:
#>> |P| = 2943 ::: |Pout| = 25431 ::: |Pin| = 62883
#>> |P U Pout| \ intersection = 26096 ::: |P U Pin| \ intersection = 63292
#>> |P U Pout U Pin| \ intersections = 73447
#>> ---------------------------------------------------------
#>> Average Pin = 21.36 ::: Average Pout = 8.641
#>> Papers with Pin = 2859 ::: #Papers with Pout = 2858

# to get A U A_out U A_in let's repeat the A routine:
authJSON1 = getAuthJson(papers)
A_U_AIn_U_AOut = authorsJSONObj(papers, authJSON1)
#>> len(A_U_AIn_U_AOut) = 60K 


# to get P_a U P_A_in U P_A_out, that are 
# all papers from all authors in A U A_out U A_in
PAIds = getAuthSet(A_U_AIn_U_AOut)
papersAAInOut = papersFromAllAuthors(r"C:\***\papers.json", PAIds)
#>> len(papersAAInOut) = 1.7M
# avgParers per author = 33 

######################################################################
#  Function to generate the testing file and the ranked papers file  #
######################################################################
#############################################
# Functions for ranking and building        #
# the project dataset related to the papers #
#############################################
#
# "papers":[
#    {idP, value(name), authorsId, year, jN, venue, inC, outC, top10Related:[idR, score] )}, the last no comma
#      id    0              1        2     3     4    5    6           7    idr   r(idP, idr)
# ]
#
# if score  < 0 there's a conflict
#function that writes the papers JSON ranked file in in path
def papersForSearchFile(path, pJSON):
    i = 1
    l = len(pJSON)
    with  open(path, mode='w', encoding = 'utf8')  as f:
        f.write('{"papers": [')
        for paper in pJSON:
            idP = paper
            p = pJSON[paper]
            h = p[7]
            lim = len(h)
            top10 = []
            for i in range(0, lim):
                el = heapq.heappop(h)
                r = el[0]
                idE = el[1]
                top10.append([r, idE])
                top10.sort(reverse = True)
            pF = {'idP':idP, 'value':p[0], 'authorsId': sorted(list(p[1])),\
                  'year':p[2], 'jN':p[3], 'venue':p[4], 'inC': sorted(list(p[5])),\
                  'outC': sorted(list(p[6])), 'top10':top10}
            f.write(json.dumps(pF))
            if i < l:
                f.write(', ')
            i+=1
        f.write(']}')   

# This functions returns all the coAuthors of all the authors in aSet
def getCoAuth(aSet, aJSON):
    coAuthSet = set()
    for a in aSet:
        coAa = aJSON[a][1]
        for coA in coAa:
            coAuthSet.add(coA)
    return coAuthSet

# CONFLICT DETECTION pt.2
# This function checks whether there are coAuthorships
# between the two sets of authors ids.
def isCoAuth(aSet1, aSet2, aJSON):
    coAuthSet1 = getCoAuth(aSet1, aJSON)
    coAuthSet2 = getCoAuth(aSet2, aJSON)
    return ((len(aSet1.intersection(coAuthSet2))>0) or ((len(aSet2.intersection(coAuthSet1))>0)))

def relatedness(aJSON, authSet1, authSet2, papersSets1, papersSets2):
    score = len(set(papersSets1[0]).intersection(set(papersSets2[0])))+\
            len(set(papersSets1[1]).intersection(set(papersSets2[1])))
    if isCoAuth(authSet1, authSet2, aJSON):
        return -score
    else:
        return score
    
def getPaperSet(pIn, pOut):
    return [pIn, pOut]

def getAuthorsSet(authors):
    authSet = set()
    if len(authors)>0:
        for auth in authors:
            idA = auth['ids'] 
            if len(idA)>0:
                authSet.add(idA[0])
    return authSet
                
def generatePapersJson(papers):
    papersJson = dict()
    i = 0
    jN = ''
    venue = ''
    for p in papers:
        add = True
        try:
            idP = p['id']
            title = p['title']
            authorsId = getAuthorsSet(p['authors'])
            year = p['year']
        except Exception:
            add = False
            continue;
        try:
            jN = p['journalName']
        except Exception:
            continue;
        try:
            venue = p['venue']
        except Exception:
            continue;
        inC = set(p['inCitations'])
        outC = set(p['outCitations'])
        if(add):
            papersJson[idP] = [title, authorsId, year, jN, venue, inC, outC, []]
        else:
            i = i+1
    print(str(len(papersJson))+' papers loaded, '+str(i)+' discarded')
    return papersJson
        
# Global variables and function that mantain 
# the top-10 min-heap of each paper
k = 4
capacity = 10
def insert(heap, idP, relatedness):
    v = (relatedness, idP)
    if len(heap) == 0:
        heapq.heappush(heap, v)
    else:
        val = v[0]
        if val > k:
            if len(heap) < capacity:
                heapq.heappush(heap, v)
            else:
                if( val > heap[0][0] ):
                    heapq.heappushpop(heap, v)
    return heap

def computeScores(papers, pJSON, aJSON):
    id1 = 0
    i = 1
    l = len(papers)
    added = 0
    for p1 in papers:
        id1 = p1['id']
        papersSets1 = getPaperSet(p1['inCitations'], p1['outCitations'])
        authSet1 = getAuthorsSet(p1['authors'])
        for p2 in papers:
            id2 = p2['id']
            if not(id1==id2):
                papersSets2 = getPaperSet(p2['inCitations'], p2['outCitations'])
                authSet2 = getAuthorsSet(p2['authors'])
                r = relatedness(aJSON, set(authSet1), set(authSet2), papersSets1, papersSets2)
                if(r>0):
                    added = added + 1
                    pJSON[id1][7] = insert(pJSON[id1][7], id2, r)
        i = i+1
        if i % 250 == 0:
            perc = (i*100)/l
            perc = str(perc)
            perc = perc[0:5]
            tm = time.asctime()
            tm = tm.split(' ')
            tm = tm[3]
            print('['+tm+'] Processed '+str(perc)+' - '+str(i)+' papers - ')
    print('added to top10 '+str(added))
    return pJSON

#papersJSONRanked generation
papers = []
with open(r"C:\***\p.json", mode = "r", encoding = 'utf-8') as f:
    for l in f:
        p = json.loads(l)
        papers.append(p)
len(papers)

authJSON = generateAuthJson(papers)
authJSON = authorsJSONObj(papers, authJSON)

pJSON = generatePapersJson(papers)
pJSONRanked = computeScores(papers, pJSON, authJSON)
papersForSearchFile(r"C:\****\pRanked.json", pJSON) 


# papersTestingv generation
# #dataset format: all in one row
# "papers":[
#    {idP, value(name), year, jN, venue )}, the last no comma
#      id    0            1   2     3      
# ],
# "authoringLinks":[
#     {"source": "authId", "target": "paperId", "value": 1},the last no comma
# ],
# "citations":[
#     {"source": "paperId1", "target": "paperId2", "value": 1},the last no comma
# ]
#}
def getP(path):
    with open(path, mode = "r", encoding = 'utf-8') as f:
        papers = []
        for l in f:
            p = json.loads(l)
            papers.append(p)
        return papers
    
def setAuthoring(authoring, authors, idP):
    for a in authors:
        heapq.heappush(authoring, (a, idP))
    return authoring

def setCitations(citations, idP, cIn, cOut):
    if len(cIn) > 0:
        for inc in cIn:
            el = (inc, idP)
            if not(el in citations):
                heapq.heappush(citations, el)
    if len(cOut) > 0:
        for outc in cOut:
            el = (idP, outc)
            if not(el in citations):
                heapq.heappush(citations, el)
    return citations

def getPapersTestingJSON(papers):
    start()
    citations = []
    authoring = []
    papersJson = dict()
    added = 0
    i = 0
    l = len(papers)
    jN = ''
    venue = ''
    for p in papers:
        add = True
        try:
            idP = p['id']
            title = p['title']
            authorsId = getAuthorsSet(p['authors'])
            year = p['year']
        except Exception:
            add = False
            continue;
        try:
            jN = p['journalName']
        except Exception:
            continue;
        try:
            venue = p['venue']
        except Exception:
            continue;
        inC = set(p['inCitations'])
        outC = set(p['outCitations'])
        authoring = setAuthoring(authoring, authorsId, idP)
        citations = setCitations(citations, idP, inC, outC)
        if(add):
            papersJson[idP] = [title, year, jN, venue]
            i = i + 1
        else:
            added = added+1
        if i % 250 == 0:
            perc = (i*100)/l
            perc = str(perc)
            perc = perc[0:5]
            tm = time.asctime()
            tm = tm.split(' ')
            tm = tm[3]
            print('['+tm+'] Processed '+str(perc)+' - '+str(i)+' papers - ')
    print(str(len(papersJson))+' papers loaded, '+str(added)+' discarded')
    end()
    return papersJson, authoring, citations

# "authoringLinks":[
#     {"source": "authId", "target": "paperId", "value": 1},the last no comma
# ],
# "citations":[
#     {"source": "paperId1", "target": "paperId2", "value": 1},the last no comma
# ]
#}
def writeCitations(cits, f):
    lim = len(cits)
    for i in range(0, lim):
        el = heapq.heappop(cits)
        source = el[0]
        target = el[1]
        value = 2
        cF = {'source':source, 'target':target, 'value':value}
        f.write(json.dumps(cF))
        if i < (lim-1):
            f.write(', ')
    f.write(']} ')

def writeAuth(auth, f):
    lim = len(auth)
    for i in range(0, lim):
        el = heapq.heappop(auth)
        source = el[0]
        target = el[1]
        value = 8
        aF = {'source':source, 'target':target, 'value':value}
        f.write(json.dumps(aF))
        if i < (lim-1):
            f.write(', ')
    f.write('], ')

        
def papersTestingForSearchFile(path, pJSON, auth, cit):
    i = 1
    l = len(pJSON)
    with  open(path, mode='w', encoding = 'utf8')  as f:
        f.write('{"papers": [')
        for paper in pJSON:
            idP = paper
            p = pJSON[paper]
            pF = {'idP':idP, 'value':p[0], 'year':p[1], 'jN':p[2], 'venue':p[3]}
            f.write(json.dumps(pF))
            if i < (l-1):
                f.write(', ')
            i+=1
        f.write('], ')
        f.write('"authoringLinks": [')
        writeAuth(auth, f)
        f.write('"citations": [')
        writeCitations(cit, f)
    print('DONE.')
        

def getLastest(papers):
    tmp = []
    for p in papers:
        if p['year'] >= 2016:
            tmp.append(p)
    return tmp


papers = []
authoring = []
citations = []
papers = getP(r"C:\***\p.json")
pTestingJSON, authoring, citations = getPapersTestingJSON(papers)
papersTestingForSearchFile(r"C:\***\pTest.json", pTestingJSON, authoring, citations)