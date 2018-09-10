###########################################################################################
#
# Author: Mario Leonardo Salinas
# This library provides functions to:
#   . parse the SematicScholar corpus with a fuzzy search 
#     based upon the set of "Interesting Journals" (see Readme for dowload and credits)
#   . create the papers and authors' datasets
#   . read/write datasets   
#
# The usage is shwon from line 381 on.
#
###########################################################################################
from __future__ import division
import time
import json
import io
from fuzzywuzzy import fuzz
from fuzzywuzzy import process
import heapq

    
corpus = r"C:/**/0518corpus.json"
#Set of interesting Journals J : {ACM TOG, CGF, IEEE TVCG, SIGGRAPH, VisComp, C&G, IEEE Vis, IEEE CGA}
journals = ['ACM Transactions on Graphics', 'ACM Trans. on Graph.','ACM Trans. Graph.', \
            'ACM TOG','Computer Graphics Forum', 'Comp. Graph. Forum', \
            'IEEE Transactions on Visualization and Computer Graphics', \
            'IEEE Trans. Vis. Comput. Graph.', 'IEEE TVCG',\
           'Comput. Graphics Forum', 'Comput. Graph. Forum', 'SIGGRAPH' \
           'Visual Computer', 'Computer & Graphics','IEEE Visualization', \
           'IEEE Computer Graphics & Applications', 'IEEE Comp Graph & Apps', 'IEEE CGA']

def start():
    print('START at: ' + str(time.ctime()))
def end():
    print('END at: ' + str(time.ctime()))
    
def LengthOfFile(f):
    currentPos=f.tell()
    f.seek(0, 2)          # move to end of file
    length = f.tell()     # get current position
    f.seek(currentPos, 0) # go back to where we started
    return length

############################
#   papersGraph functions  #
############################

def setAuthoring(authoring, authors, idP):
    for a in authors:
        heapq.heappush(authoring, (a, idP))
    return authoring

def getPaperSet(papers):
    pS = set()
    for p in papers:
        pS.add(p['id'])
    return pS

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

def getPaperSet(papers):
    pS = set()
    for p in papers:
        pS.add(p['id'])
    return pS

def getAuthorsSet(authors):
    authSet = set()
    if len(authors)>0:
        for auth in authors:
            idA = auth['ids'] 
            if len(idA)>0:
                authSet.add(idA[0])
    return authSet

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
        inPrev = inTot
        outPrev = outInP
        citations, inTot, inInP, outTot, outInP = setCitations(citations, idP, inC, outC, PIds, inTot, inInP, outTot, outInP)
        i+=1
        if(add):
            papersJson[idP] = [title, year, jN, venue, authorsId, (inTot-inPrev), (outInP-outPrev)]
        else:
            added = added+1
        if i % 1000 == 0:
            tm = time.asctime()
            tm = tm.split(' ')
            tm = tm[3]
            print('['+tm+'] Processed '+str(i)+' papers')
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
    value = 5
    lim = len(cits)
    for i in range(0, lim):
        el = heapq.heappop(cits)
        source = el[0]
        target = el[1]
        cF = {'source':source, 'target':target, 'value':value}
        f.write(unicode(json.dumps(cF)))
        if i < (lim-1):
            f.write(unicode(', '))
    f.write(unicode(']} '))

def writeAuth(auth, f):
    lim = len(auth)
    for i in range(0, lim):
        el = heapq.heappop(auth)
        source = el[0]
        target = el[1]
        value = 5
        aF = {'source':source, 'target':target, 'value':value}
        f.write(unicode(json.dumps(aF)))
        if i < (lim-1):
            f.write(unicode(', '))
    f.write(unicode('], '))

def printInOutStats(inTot, inInP, outTot, outInP):
    print('Total inC = '+str(inTot)+' - inInP = '+str(inInP))
    print('Total outC = '+str(outTot)+' - outInP = '+str(outInP))    
       
def papersTestingForSearchFile(path, pJSON, auth, cit):
    i = 0
    l = len(pJSON)
    with io.open(path, mode='w', encoding = 'utf8') as f:
        f.write(unicode('{"nodes": ['))
        for paper in pJSON:
            idP = paper
            p = pJSON[paper]
            authsIDs = []
            for a in p[4]:
                authsIDs.append(a)
            pF = {'id':idP, 'value':p[0], 'color':p[5], 'nOc':p[6], 'year':p[1], 'jN':p[2], 'venue':p[3], 'authsId': authsIDs}
            f.write(unicode(json.dumps(pF)))
            if i < (l-1):
                f.write(unicode(', '))
            i+=1
        f.write(unicode('], '))
        f.write(unicode('"authoringLinks": ['))
        writeAuth(auth, f)
        f.write(unicode('"links": ['))
        writeCitations(cit, f, idP)
    print('DONE.')

def getP(path):
    with io.open(path, mode="r", encoding="utf-8") as f:
        papers = []
        for l in f:
            p = json.loads(l)
            papers.append(p)
        return papers
    
def getLastest(papers):
    tmp = []
    for p in papers:
        if p['year'] >= 2016:
            tmp.append(p)
    return tmp

def fuzzy_search(corpus_path, journals):
    add = 0
    scoreTot = 0
    fuzzyP = []
    read = 0
    i = 1
    start()
    with io.open(corpus_path, mode = "r", encoding = 'utf-8') as f:
        lenght = LengthOfFile(f)
        for l in f:
            read += len(l)+1
            p = json.loads(l)
            jn = p['journalName']
            v = p['venue']
            sv = 0
            sj = 0
            if not(jn == ''):
                sj = process.extractOne(jn, journals, scorer=fuzz.token_sort_ratio)[1]
            if (not(v == '') and (sj < 80)):
                sv = process.extractOne(v, journals, scorer=fuzz.token_sort_ratio)[1]
            score = max(sv, sj)
            if score > 80:
                scoreTot += score
                fuzzyP.append(p)
                add += 1
            if(i%100000==0):
                perc = (read*100)/lenght
                perc = str(perc)
                perc = perc[0:5]
                tm = time.asctime()
                tm = tm.split(' ')
                tm = tm[3]
                print('['+tm+'] Processed '+str(perc)+'% - '+str(i)+' papers - ')
            i+=1
    avgScore = scoreTot/add 
    end()
    print('Average score: '+str(avgScore)+' - Passed: '+str(add))

############################
#  authorsGraph functions  #
############################

#function that writes the authors JSON file in a file in path
def authorsForSearchFile(path, authJson1):
    with io.open(path, mode='w', encoding = 'utf8')  as f:
        f.write(unicode('{"authors": ['))
        i = 0
        l = len(authJson1)
        for a in authJson1:
            idA = a
            a = authJson1[a]
            aF = {'id':idA, 'value':a[0], 'coAuthList':a[1], 'paperList':a[2], 'lastPub':a[3]}
            f.write(unicode(json.dumps(aF)))
            if i < l-1:
                f.write(unicode(', '))
            i+=1
        f.write(unicode(']}'))

# function that updates an authorDict entry 
# according to the employed model:
# {id, value(name) , coAuthList : [idACo, #pubs, year], paperIdList, lastPub : [year, idP] },
#           0              1                  0      1     2             3          0   1 
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

def addAuthId(authSet, authors):
    if len(authors)>0:
        for auth in authors:
            idA = auth['ids'] 
            if len(idA)>0:
                idA = idA[0]
                authSet.add(idA)
    return authSet
       
def getAuthsIdSetF(path):
    start()
    i = 1
    filePos = 0
    lenght = 0
    authSet = set([])
    with io.open(path, mode='r', encoding = 'utf8') as f1:
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
 
def getAuthsIdSet(papers):
    start()
    authSet = set([])
    for r in papers:       
        authors = r['authors']
        authSet = addAuthId(authSet, authors)
    end()
    return authSet

def getAuthJson(papers):
    authJson = dict()
    for p in papers:
        authors = p['authors']
        for ap in authors:
            if ((len(ap['ids']) > 0) and (not(ap['ids'][0] in authJson))):
                name = ap['name']
                authJson[ap['ids'][0]] = [name, dict(), [], [0, '']]
    return authJson

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

### Get the fuzzy-searched dataset
#
#fuzzyP = fuzzy_search(corpus_path, journal_list)
##len(fp) = 15.213
#
### Get papers from file and create the dataset
#
#papers = getP(fuzzy_path)
#PTIds = getPaperSet(papers)
#start()
#print("Starting file creation...")
#pTestingJSON, authoring, citations = getPapersTestingJSON(papers, PTIds)
#papersTestingForSearchFile(destination_path, pTestingJSON, authoring, citations)
#end()
##>> OUT:
#
##>>15213 papers loaded, 0 discarded
##>>Total inC = 375540 - inInP = 87569
##>>Total outC = 310357 - outInP = 87569
# 
### Create and write the authors' dataset
#
#get A, authors of at least one paper in P
#authJSON = getAuthJson(papers)
#A = authorsJSONObj(papers, authJSON)
### once A is ready you can write it with
#authorsForSearchFile(path, A)
#auth_file = r"C:/**/a_v0518f.txt"
#authorsForSearchFile(auth_file, A)
##> len(A) = 19.464