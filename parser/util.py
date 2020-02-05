###########################################################################################
#
# Author: Mario Leonardo Salinas
# This library provides functions to:
#   . parse the SematicScholar corpus with a fuzzy search 
#     based upon the set of "Interesting Journals" (see Readme for dowload and credits)
#   . create the papers and authors' datasets
#   . read/write datasets   
#
###########################################################################################
from __future__ import division
import gzip
import time
import io
import string
import json
import re
from fuzzywuzzy import fuzz
from fuzzywuzzy import process

def export_partialJ(path, j_obj):
    with io.open(path, mode='w', encoding = 'utf8')  as f:
        for j in j_obj:
            f.write(unicode(json.dumps(j_obj[j])))
            f.write(unicode('\n'))


def import_partialJ(path):
    with io.open(path, mode='r', encoding = 'utf8')  as f:
        js = []
        for l in f:
            try:
                js.append(json.loads(l))
            except Exception:
                continue;
        return js

journals = import_partialJ("journals_large.txt")

exclude_words = set([
    'foreword',
    'preface',
    'editorial',
    'editorials'
    'acknowledgements'
])

exclude2 = set([
    'guest',
    'editor',
    'editors'
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
        splt.add(s.translate(string.maketrans('',''),string.punctuation).lower())
    return (len(exclude_words & splt)>0 or len(exclude2 & splt)>=2);

def keep_goodP(papers):
    i = 0
    keep = []
    drop = []
    for p in papers:
        if (len(p['authors']) == 0) or (len(p['authors']) >= 15) or contains_words(p['title']):
            drop.append(p)
        else:
            keep.append(p)
        i += 1
    #print("Kept: "+str(len(keep))+" - Discarder: "+str(len(drop)))
    #print("Total papers: "+str(i))
    return [keep, drop]      



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


def getPaperSet(papers):
    pS = set()
    my = 1995
    for p in papers:
        pS.add(p['id'])
        my = max(my, p['year'])
    return pS, my

def setCitations(citations, idP, cIn, cOut, PIds, inTot, inInP, outTot, outInP):
    if len(cIn) > 0:
        for inc in cIn:
            inTot += 1
            if(inc in PIds):
                inInP += 1
                el = (inc, idP)
                if not(el in citations):
                    citations.append(el)
    if len(cOut) > 0:
        for outc in cOut:
            outTot += 1
            if(outc in PIds):
                outInP += 1
                el = (idP, outc)
                if not(el in citations):
                    citations.append(el)
    return citations,inTot, inInP, outTot, outInP

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
    discard = 0
    i = 0
    l = len(papers)
    jN = ''
    j_id = ''
    v_id = ''
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
            discard +=1
            continue;
        try:
            jN = p['journalName']
            j_id = p['journalId']
        except Exception:
            pass;
        try:
            venue = p['venue']
            v_id = p['venueId']
        except Exception:
            pass;
        i+=1

        if(add):
            inC = set(p['inCitations'])
            outC = set(p['outCitations'])
            inPrev = inTot
            outPrev = outInP
            citations, inTot, inInP, outTot, outInP = setCitations(citations, idP, inC, outC, PIds, inTot, inInP, outTot, outInP)
            papersJson[idP] = [title, year, jN, venue, authorsId, (inTot-inPrev), (outInP-outPrev), j_id, v_id]
        
        if i % 1000 == 0:
            tm = time.asctime()
            print('['+tm+'] Processed '+str(i)+' papers')

    print(str(len(papersJson))+' papers loaded, '+str(discard)+' discarded')
    printInOutStats(inTot, inInP, outTot, outInP)
    return papersJson, citations

# "authoringLinks":[
#     {"source": "authId", "target": "paperId", "value": 1},the last no comma
# ],
# "citations":[
#     {"source": "paperId1", "target": "paperId2", "value": 1},the last no comma
# ]
#}
def writeCitations(cits, f):
    value = 5
    lim = len(cits)
    for i in range(0, lim):
        el = cits[i]
        source = el[0]
        target = el[1]
        cF = {'source':source, 'target':target, 'value':value}
        f.write(unicode(json.dumps(cF)))
        if i < (lim-1):
            f.write(unicode(', '))
    f.write(unicode(']} '))

def printInOutStats(inTot, inInP, outTot, outInP):
    print('Total inC = '+str(inTot)+' - inInP = '+str(inInP))
    print('Total outC = '+str(outTot)+' - outInP = '+str(outInP))    
       
def getP(path):
    P=[]
    with io.open(path, mode='r', encoding = 'utf8') as f:
        for l in f:
            P.append(json.loads(l))
    return P

def saveP(papers, path, pap_tot = 0):
    with io.open(path, mode='w', encoding = 'utf8') as f:
        for p in papers:
            f.write(unicode(json.dumps(p)))
            f.write(unicode("\n"))

def papersTestingForSearchFile(path, pJSON, cit):
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
            pF = {'id':idP, 'value':p[0], 'color':p[5], 'nOc':p[6], 'year':p[1], 'jN':p[2], 'venue':p[3], 'authsId': authsIDs, 'j_id':p[7], 'v_id':p[8]}
            f.write(unicode(json.dumps(pF)))
            if i < (l-1):
                f.write(unicode(', '))
            i+=1
        f.write(unicode('], '))
        f.write(unicode('"links": ['))
        writeCitations(cit, f)
    print('DONE.')

def rebuild_journals():
    journals_new = dict({})
    for i in range(len(journals)):
        j = journals[i]
        
        njns = []
        for jj in j['name_list']:
            jj = re.sub(r'[^a-zA-Z ]', '', jj)
            njns.append(jj.lower())

        journals_new[j['id']] = { 'id':j['id'], 'name_list':njns, 'count':0, 'score':0}
    return journals_new

def get_papjv(papers):
    pap_jv = dict({})
    pp = []
    for p in papers:
        try:        
            kj = p['journalId']
            kv = p['venueId']
            pp.append(p)
            pap_jv[p['id']] = [kj, kv]
        except:
            pass 
    return pap_jv, pp

def count_inCit(incits, papjv, kj, kv, journals):
    for cit in incits:
        if kj == kv and not(kj == ""):
            if not(cit in papjv) or not(papjv[cit][0] == kj):
                journals[kj]['score'] += 1
        elif not(kj == kv):
            if not(kj==""):
                if not(cit in papjv) or not(papjv[cit][0] == kj):
                    journals[kj]['score'] += 1
            if not(kv==""):
                if not(cit in papjv) or not(papjv[cit][1] == kv):
                    journals[kv]['score'] += 1
    return journals


def count_j(papers, papjv, journals):
    
    for j in range(len(papers)):
        p = papers[j]
        kj = p['journalId']
        kv = p['venueId']   
        """
        Computing the inCitation-score, that is the number of 
        citations recieved from a different journal/venue
        """
        journals = count_inCit(p['inCitations'], papjv, kj, kv, journals)
        
    return journals    


def scorejv(item, jns):
    score = 0
    item = re.sub(r'[^a-zA-Z ]', '', item).lower()
    cond = item in jns
    if not(cond):
        score = process.extractOne(item.lower(), jns, scorer=fuzz.token_sort_ratio)[1]
    else:
        score = 100
    return score
    
    
def fuzzy_search(path):
    add = 0
    exceptions = 0
    scoreTot = 0
    fuzzyP = []
    read = 0
    score_thres = 90
    score_thres1 = 80
    i = 1
    journals_new = rebuild_journals()
    #fuzzy_out = io.open(r"fuzzyp", mode= "w", encoding = "utf-8")
    #disc_out = io.open(r"discp", mode = "w", encoding="utf-8")
    with gzip.open(path, 'rb') as f:
    #with io.open(path, mode = "r", encoding = 'utf-8') as f:
        for l in f:
            p = json.loads(l)
            jn = p.get('journalName')
            v = p.get('venue')
            year = p.get('year')
            score = 0
            p1 = p
            

            if p.get('year') and p.get('year') >= 1995:
                scoresj = dict({})
                scoresv = dict({})

                if (jn and jn != "") or (v and v!= ""):
                    for j in journals:
                        sj = scorejv(jn, journals_new[j['id']]['name_list']) if jn and jn != ""  else 0
                        sv = scorejv(v, journals_new[j['id']]['name_list']) if v and v != "" else 0
                        if sj > 0:
                            scoresj[j['id']] = sj
                        if sv > 0:
                            scoresv[j['id']] = sv

                kj = max(scoresj, key=scoresj.get) if jn and jn != "" else ""
                kv = max(scoresv, key=scoresv.get) if v  and v != "" else ""
                kj = kj if kj and kj != "" and scoresj[kj] >= score_thres else None
                kv = kv if kv and kv != "" and scoresv[kv] >= score_thres else None

                scorej = scoresj[kj] if kj else 0
                scorev = scoresv[kv] if kv else 0

                score = max(scorej, scorev)

                p1['journalId'] = kj if kj else ''
                p1['venueId'] = kv if kv else ''

            if score >= score_thres1 and (len(p['inCitations']) + len(p['outCitations']) > 0):
                
                if p1.get('paperAbstract'):
                    del p1['paperAbstract']
                if ((kj == 'ACMTOG' or kv == 'SIGGRAPH' ) and year <= 2004):
                    p1['journalId'] = 'SIGGRAPH'
                    #p1['journalName'] = 'SIGGRAPH'
                #str_out = str(score)+"\t\t"+p1.get("title")[:20]+"\t\t"+jn[:20]+"\t\t"+kj+"\t\t"+v[:20]+"\t\t"+kv
                if score >= score_thres:
                    scoreTot += score
                    fuzzyP.append(p1)
                    #fuzzy_out.write(str_out)
                    #fuzzy_out.write("\n")
                    add += 1

            if(i%300000==0):
                tm = time.asctime()
                print('['+tm+'] In '+str(path)+ ' processed '+str(i)+' papers - added '+str(add))
            i+=1
    avgScore = 0
    
    if add != 0:
        avgScore = scoreTot/add

    print('In '+str(path)+' average score of fuzzy search: '+str(avgScore)+' - Passed: '+str(add))
    #fuzzy_out.close()
    #disc_out.close()
    return keep_goodP(fuzzyP)[0]

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
# {id, value(name) , coAuthList : [idACo, #pubs, lastYear, [papList]], paperIdList, lastPub : [year, idP] },
#           0              1                  0      1          2             2          3       0   1 
def updateCoAuth(auths, idA, aL, year, id_shared_pap):
    for a in aL:
        if a != idA:
            if not(a in auths[idA][1]):
                if a in auths:
                    #name = auths[a][0] [Redundancy removed:search for name by id]
                    auths[idA][1][a]=[1, year, [id_shared_pap]]
            else:
                auths[idA][1][a][0] += 1
                auths[idA][1][a][2].append(id_shared_pap)
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
            pass;
        for ap in authors:
            if ((len(ap['ids']) > 0) and (ap['ids'][0] in authJson1)):
                paperAuths.add(ap['ids'][0])
        for ap in authors:   
            if ((len(ap['ids']) > 0) and (ap['ids'][0] in authJson1)):
                idA = ap['ids'][0]
                updateCoAuth(authJson1, idA, paperAuths, year, idP)
                authJson1[idA][2].append(idP)
                if year > authJson1[idA][3][0]:
                    authJson1[idA][3] = [year, idP]
        if(i%10000==0):
            perc = (i*100)/l
            perc = str(perc)
            perc = perc[0:5]
            tm = time.asctime()
            print('['+tm+'] Processed '+str(perc)+' - '+str(i)+' papers - ') 
        i+=1
    end()
    return authJson1
