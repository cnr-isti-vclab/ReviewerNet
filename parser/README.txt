This is a tutotial to download, create and deploy a user-defined instance of Reviewernet.org.

The script is written in Bash+Python.

1. open journals.py with a text editor and change the content of the python array with the names* of the journals/venues that will be used to build the topic-based datasets.  

2. execute script.sh

3. ....

Notes
----------------------
*Use always semanticscholar.org as reference for journal names and available papers because the same journal/venue is referenced in different ways across different papers.
We suggest to put at least three string for each journal in order to have better coverage in the fuzzy search.[see journals.py for an example]