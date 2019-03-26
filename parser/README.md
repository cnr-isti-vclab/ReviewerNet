## Guide to a creation of a user-defined instance of Reviewernet.org

This is a tutotial to download, create and deploy a user-defined instance of Reviewernet.org.
This folder contains both Bash and Python scripts. The only file to run in order to have your instance of RN is script.sh. 

### Requirements

To run the script succesfully you need:

- **50 GB** of free space on disk to store corpus gzipped partitions (corpus details in the next section)

- wget, to download the partitions

- python2.7 or higher, for parsing phase 

- [fuzzywuzzy](https://pypi.org/project/fuzzywuzzy/), a fuzzy string matching python library. If python-Levenshtein is also installed, 
 fuzzywuzzy uses Levenshtein Distance (up to 4-10x speedup)

### The SemanticScholar corpus

The reference corpus can be found at http://labs.semanticscholar.org/corpus/. This representation of the full Semantic Scholar corpus offers data relating to papers crawled from the web and subjected to a number of filters.

The papers are provided as json objects, one per line. Papers are grouped in batches and shared as a collection of gzipped files; each file is about 990 MB, and the total collection is about 46 GB.

### script.sh

The provided script, given a list of journals/venues, downloads and parses the partitions in parallel, allowing a maximum number of 4 concurrent downloads. 
The only input needed is a set of journal/venue names (see next section for further details on usage), and in the end the output will be:

- a folder named ~~dataset~~ which contains the files needed to run a ReviewerNet session.

- 47 corpus partitions as gzip files 

- at most 47 parsed files.

The completion time of the whole process with a speed connection of 1MB/s is about 7 hours^.

### Execution

1. open journals.py with a text editor and change the content of the python array with the names* of the journals/venues that will be used to build the topic-based datasets.  

2. execute script.sh

3. ....

### Notes
<hr>
^The completion time has been measured on a dual-core laptop. 

^^Use always https://www.semanticscholar.org/ as reference for journal names and available papers because the same journal/venue is referenced in different ways across different papers.
We suggest to put at least three string for each journal in order to have better coverage in the fuzzy search.[see journals.py for an example]
