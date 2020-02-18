# How to run an user-defined instance of Reviewernet.org

This is a tutotial to download, create and deploy a user-defined instance of Reviewernet.org.
This folder contains both Bash and Python scripts. The only file to run in order to have your instance of RN is download_and_parse.sh. 

[1. Requirements](#req)

[2. The SemanticScholar corpus](#corpus)

[3. dowload_and_parse.sh](#script)

[4. Execution](#exe)
<hr>

<a id="req"></a>

## 1. Requirements

To run the script succesfully you need:

- **100 GB** of free space on disk to store corpus gzipped partitions (corpus details in the next section)

- wget, to download the partitions

- python2.7 or higher, for parsing phase 

- [fuzzywuzzy](https://pypi.org/project/fuzzywuzzy/), a fuzzy string matching python library. If python-Levenshtein is also installed, 
 fuzzywuzzy uses Levenshtein Distance (up to 4-10x speedup)

<a id="corpus"></a>

## 2. The SemanticScholar corpus

The reference corpus can be found at http://api.semanticscholar.org/corpus/download/. This representation of the full Semantic Scholar corpus offers data relating to papers crawled from the web and subjected to a number of filters.

The papers are provided as a set of json objects, one per line. Papers are grouped in batches and shared as a collection of gzipped files; each file is about 660 MB, and the total collection is about 100 GB.

<a id="script"></a>

## 3. download_and_parse.sh

The provided script, given a list of journals/venues, downloads and parses the partitions in parallel, allowing a maximum number of 10 concurrent downloads and parsers. 
The only input needed is a set of journal/venue names (see next section for further details on usage), and in the end the output will be:

- a folder named *datasets* which contains the files needed to run a ReviewerNet session.

- 180 corpus partitions as gzip files 

- at most 180 parsed files

The completion time of the whole process with a speed connection of 1MB/s is about 10 hours^.

Once exectued, the script checks the presence of the needed libraries, asking the user to install fuzzywuzzy if not present; then the latest corpus manifest is downloaded.

At this point the **download&parse** process is started: each file listed in the manifest is downloaded - as a gzip - and filtered. The resulting files are stored with the *-filtered* suffix.

When all partitions have been downloaded and filtered the **merging
phase** can start. Filtered corpus partitions are merged together and the personalized datasets are built.

Eventually the script asks the user whether to delete or not the interemediate files (gzipped/filtered partitions).

At this point he *datasets* folder will contain the 3 files needed to run ReviewerNet, ending with *_pers* suffix.

<a id="exe"></a>

## 4. Execution

1. open *journals.txt* with a text editor and change the content of the JSON object with the names^^ of the journals/venues that will be used to build the topic-based datasets.  

2. execute *download_and_parse.sh manifest_link*

3. run a local/remote ReviewerNet session and click on *Upload instance* to upload the files you've just created; 

4. Use your own instance of ReviewerNet!
<hr>

### Notes

^The completion time has been measured on a dual-core laptop connected to a network with 2MB/s bandwidth. 

^^Use always https://www.semanticscholar.org/ as reference for journal names and available papers because the same journal/venue is referenced in different ways across different papers.
We suggest to put at least three string for each journal in order to have better coverage in the fuzzy search.[see journals.txt for an example]
