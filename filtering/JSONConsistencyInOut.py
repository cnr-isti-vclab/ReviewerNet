def getPapersInOutConsistency(papers):
    pS = dict()
    for p in papers:
        idP = p['id']
        inC = set(p['inCitations'])
        outC = set(p['outCitations'])
        pS[idP] = [inC, outC]
    return pS

def solveConsistencyInOut(PDict):
    i = 0
    inCont = 0
    outCont = 0 
    inTot = 0
    outTot = 0
    for idP in PDict:
        inC = set(PDict[idP][0])
        outC = set(PDict[idP][1])
        for c in inC:
            inTot += 1
            if(c in PDict):
                inCont += 1
                outC1 = set(PDict[c][1])
                if not(idP in outC1):
                    PDict[c][1].add(idP)
                    i += 1
        for c in outC:
            outTot += 1
            if(c in PDict):
                outCont += 1
                inC1 = set(PDict[c][0])
                if not(idP in inC1):
                    PDict[c][0].add(idP)
                    i += 1
    print('Inconsistencies solved between papers in P: '+str(i))
    print(str(inCont)+' checked, '+str(inTot)+' total')
    print(str(outCont)+' checked, '+str(outTot)+' total')

#Get the set of interesting papers P
papers = getP(r"C:\***\p.json")
#creating a dictionary:
# id : [ [inC], [outC] ]
PDict = getPapersInOutConsistency(papers)
#Checking in/outC consistency for all papers in P
solveConsistencyInOut(PDict)

#>>> OUT:
#>> Inconsistencies solved between papers in P: 0
#>> 20548 checked, 167335 total
#>> 20548 checked, 79456 total

#Creating and writing the JSON

# papersTesting
# #dataset format: all in one row
# "papers":[
#    {idP, value(name), year, jN, venue, authIDs )}, the last no comma
#      id    0            1   2     3      4
# ],
# "authoringLinks":[
#     {"source": "authId", "target": "paperId", "value": 20},the last no comma
# ],
# "citations":[
#     {"source": "paperId1", "target": "paperId2", "value": 9:in/16:out},the last no comma
# ]
#}
    
def setAuthoring(authoring, authors, idP):
    for a in authors:
        heapq.heappush(authoring, (a, idP))
    return authoring

def setCitations(citations, idP, cIn, cOut, PIds, inTot, inInP, outTot, outInP):
    if len(cIn) > 0:
        for inc in cIn:
            inTot += 1
            if(inc in PIds):
                inInP += 1
                el = (inc, idP)
                if not(el in citations):
                    heapq.heappush(citations, el)
    if len(cOut) > 0:
        for outc in cOut:
            outTot += 1
            if(outc in PIds):
                outInP += 1
                el = (idP, outc)
                if not(el in citations):
                    heapq.heappush(citations, el)
    return citations,inTot, inInP, outTot, outInP

def getPapersTestingJSON(papers, PIds):
    inTot = 0
    inInP = 0
    outTot = 0
    outInP = 0
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
        citations, inTot, inInP, outTot, outInP = setCitations(citations, idP, inC, outC, PIds, inTot, inInP, outTot, outInP)
        if(add):
            papersJson[idP] = [title, year, jN, venue, authorsId]
        else:
            added = added+1       
    print(str(len(papersJson))+' papers loaded, '+str(added)+' discarded')
    printInOutStats(inTot, inInP, outTot, outInP)
    return papersJson, authoring, citations

# "authoringLinks":[
#     {"source": "authId", "target": "paperId", "value": 1},the last no comma
# ],
# "citations":[
#     {"source": "paperId1", "target": "paperId2", "value": 1},the last no comma
# ]
#}
def writeCitations(cits, f, idP):
    lim = len(cits)
    for i in range(0, lim):
        el = heapq.heappop(cits)
        source = el[0]
        target = el[1]
        value = 9
        if idP == source:
            value = 16
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
        value = 20
        aF = {'source':source, 'target':target, 'value':value}
        f.write(json.dumps(aF))
        if i < (lim-1):
            f.write(', ')
    f.write('], ')
        
def papersTestingForSearchFile(path, pJSON, auth, cit):
    i = 0
    l = len(pJSON)
    with  open(path, mode='w', encoding = 'utf8')  as f:
        f.write('{"nodes": [')
        for paper in pJSON:
            idP = paper
            p = pJSON[paper]
            authsIDs = []
            for a in p[4]:
                authsIDs.append(a)
            pF = {'id':idP, 'value':p[0], 'year':p[1], 'jN':p[2], 'venue':p[3], 'authsId': authsIDs}
            f.write(json.dumps(pF))
            if i < (l-1):
                f.write(', ')
            i+=1
        f.write('], ')
        f.write('"authoringLinks": [')
        writeAuth(auth, f)
        f.write('"links": [')
        writeCitations(cit, f, idP)
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
papers = getP(r"C:\****\p.json")
PTIds = getPaperSet(papers)
pTestingJSON, authoring, citations = getPapersTestingJSON(papers, PTIds)

#>> OUT:
#>> 2943 papers loaded, 0 discarded
#>> Total inC = 167335 - inInP = 20548
#>> Total outC = 79456 - outInP = 20548
#>> END at: Thu Mar  1 18:03:41 2018