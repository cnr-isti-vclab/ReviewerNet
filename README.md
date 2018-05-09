# Semantic Browser
This website is a D3.js-based browser on a filtered version of the <a href="http://labs.semanticscholar.org/corpus/">Semantic
Scholar</a> corpus. The user can search for papers and build its own cluster of interesting papers that we call *P*, from which is 
generated *N(P)*, the neighbors of *P*, that are the in and out citations. Above the paper graph the one referred 
to the authors is displayed.
> *screenshot soon...*

## Getting started
Often program committee members are required to find reviewers that know well a subject but are not conflicted with the 
authors of the paper under scrutiny. We propose a tool that allow the user to build its topic-based graph searching papers from: 
*ACM Transactions on Graphics*, *Computer Graphics Forum* and *IEEE Transactions on Visualization and Computer Graphics*.
The user can also add authors to the *Conflicting Authors* list, the effect is described in the *author area* section.
In this it is immediately possible to identify all the possible candidate-reviewers.

### Usage
Just visit
> https://hybrs.github.io <br>
> *tested browsers: Chrome, Firefox, Safari* 


## Papers&Authors 
Mouse events that change the visualization are associated both to authors and papers. It is also possible to **remove authors and papers from the visualization** simply by double-click on their names in the *Conflicting Authors* and *Area Paper* list (doesn't really remove any author but can change the vizualization of authors conflicting with him/her). Read the toolbox section to find out
how to remove authors.

### The paper graph
* x-constrained by year of pubblication;
* personalizable color-map based on the number of in-citations;

### The author area
* ranked by a weighted sum of the number of papers in *P* and *N(P)*
* a rectange under the author's name spans from the oldest to the last year of pubblication.
* name in **red** indicates conflict with at least one author in the *Conflicting Authors* list;
* name in **purple** indicates that the author has been added to the *Conflicting Authors* list;

## The toolbox
This area of the page allows the user to personalize the view:
* **MNP**: is the *Mininimum Number of Papers* threshold. Once enabled, it removes from the *authors area* all the authors that have a number of visualized papers less than the indicated one.
* **MNoC**: is the *Mininimum Number of out-Citations* threshold. Once enabled, it lowers the opacity of papers that have a number of out-citations less than the indicated one.
* **Colormap**: allows the user to change the color-map associated with the number of in-citations. The steps are *0, 30, 100*.
* **Stats**: this table shows some interesting numbers:
  - **P**: is the number of paper explicitly added to the visualization (searchbar or double-click on a node);
  - **N(P)**: is the total number of visualized papers that includes both paper in *P* and all their neighbors, aka in/out-citations;
  - **A(P)**: is the number of authors of the interesting papers *P*;
  - **A(N(P))** is the number of authors in *N(P))*;
* **Display related authors**: once enabled this checkbox enriches the *author area* with all the related authors *A(N(P))*, that are all the authors in *P* and *N(P)*. If is not checked only authors from *P* will be displayed-

## Conflicting Authors list
This area allows the user to search for authors for which wants to find conflicts. The list of searched authors is displayed below the searchbar. It is also possible to add authors to this list simply by clicking on an author name in the *Paper Info* area.

## Area Paper
This area allows the user to search for papers to build the topic-based graph. The list of added papers is displayed below the searchbar.

## Paper Info
This box shows some useful information about the selected paper such as title, year of pub., venue and journal name, authors and citations. Authors and citations have their associated mouse handlers.
