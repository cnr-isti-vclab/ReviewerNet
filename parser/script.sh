#!/bin/bash
#array pf PIDs fpr multitasking
declare -a PARSING_PIDS
declare -a DOWNLOAD_PIDS
DWN=0
# Function that check the presence of fuzzywuzzy python library. 
# This library provides fuzzy string matching. If python-Levenshtein is also installed, 
# fuzzywuzzy uses Levenshtein Distance [up to 4-10x speedup]
install_fuzzy(){
	RET=1
	patt=fuzzywuzzy
	x=$(pip list | grep $patt | wc -l)
	if [[ $x -ge 1 ]]; then 
	echo "$patt already installed";
	RET=0
	return $RET
	else 
	while true; do
	    read -p "Fuzzywuzzy not installed. This is a mandatory package to parse the corpus; do you want to install it? [y/n] " yn
	    case $yn in
	        [y]* ) pip install $patt; RET=$?; break;;
	        * ) printf "You choose to not install $patt, remember this is MANDATORY to parse the corpus.\nPlease install it and try again\n"; break;;
		esac
	done
	fi
	return $RET
}
# Function that check the presence of python-Levenshtein. 
install_pl(){
	RET=0
	patt=python-Levenshtein
	x=$(pip list | grep $patt | wc -l)
	if [[ $x -ge 1 ]]; then 
	printf "$patt already installed\n"
	return $RET
	else 
	RET=1
	while true; do
	    read -p "$patt not installed [requires Microsoft Visual C++ 14.0], this package it's not mandatory, but could provide a 4-10x speedup; do you want to install it? [y/n] " yn
	    case $yn in
	        [y]* ) pip install $patt; RET=$?; break;;
	        * ) printf "You choose to not install $patt, this could take longer time\n"; break;;
		esac
	done
	fi
	return $RET
}
#Wait for parsing jobs to finish
waitPPids() {
	while [ ${#PARSING_PIDS[@]} -ne 0 ]; do
	local range=$(eval echo {0..$((${#PARSING_PIDS[@]}-1))})
	local i
	for i in $range; do
	    if ! kill -0 ${PARSING_PIDS[$i]} 2> /dev/null; then
	    echo "Done decompressing and parsing partition -- PID ${PARSING_PIDS[$i]}"
	    unset PARSING_PIDS[$i]
	    fi
	    sleep 1s
	done
	PARSING_PIDS=("${PARSING_PIDS[@]}") # Expunge nulls created by unset.
	sleep 5m
	done
	echo "All partition parsed."
	echo "Merging all together..."
}
#Wait until there are less than 4 simultaneous download 
waitD4Pids() {
	while [ ${#DOWNLOAD_PIDS[@]} -ge 4 ]; do
	sleep 2m
	local range=$(eval echo {0..$((${#DOWNLOAD_PIDS[@]}-1))})
	local i
	for i in $range; do
		if ! kill -0 ${DOWNLOAD_PIDS[$i]} 2> /dev/null; then
		echo "Done downloading partition -- PID ${DOWNLOAD_PIDS[$i]}"
		unset DOWNLOAD_PIDS[$i]
		fi
		sleep 1s
	done
	DOWNLOAD_PIDS=("${DOWNLOAD_PIDS[@]}") # Expunge nulls created by unset.
	done
	return
}
#Wait until download is finished
waitDPids() {
	while [ ${#DOWNLOAD_PIDS[@]} -ne 0 ]; do
	local range=$(eval echo {0..$((${#DOWNLOAD_PIDS[@]}-1))})
	local i
	for i in $range; do
	    if ! kill -0 ${DOWNLOAD_PIDS[$i]} 2> /dev/null; then
	    echo "Done downloading partition -- PID ${DOWNLOAD_PIDS[$i]}"
	    unset DOWNLOAD_PIDS[$i]
	    fi
	    sleep 1s
	done
	DOWNLOAD_PIDS=("${DOWNLOAD_PIDS[@]}") # Expunge nulls created by unset.
	sleep 5m
	done
	echo "All partitions downloaded."
}

# Adds PARSING_PIDS to array 
addPPid(){
	desc=$1
	pid=$2
	echo "$desc -- PID $pid"
	PARSING_PIDS=(${PARSING_PIDS[@]} $pid)
}
# Adds DOWNLOADING_PIDS to array 
addDPid(){
	desc=$1
	pid=$2
	echo "$desc -- PID $pid"
	DOWNLOAD_PIDS=(${DOWNLOAD_PIDS[@]} $pid)
}
# Check if $2 is a substring of $1
contains() {
	string="$1"
	substring="$2"
	if test "${string#*$substring}" != "$string";then
	return 0    # $substring is in $string
	else
	return 1    # $substring is not in $string
	fi
}

# Download&parse JOB
download_and_parse_file(){
	wget --no-check-certificate -nv "$1$2"
	parse_file "$2" &
	addPPid "Processing ${2#*/}" $!
}
# Parse JOB
parse_file(){
	python2 parse_and_filter.py "$1"
	file=${1#*/}
	file="${file%.*}-filtered"
	if [[ -f $filteredf ]]; then
		echo "$1" >> parsed_files.txt
	fi
	echo "$1" >> parsed_files.txt
	
}

install_fuzzy

if [[ $? -eq 1 ]]; then
	printf "Fuzzywuzzy not installed. This is a mandatory package to parse the corpus\n"
	exit;
fi

install_pl

if [[ $? -eq 1 ]]; then
	printf "Could not install python-Levenshtein. Continuing...\n"
fi

ROOT="https://s3-us-west-2.amazonaws.com/ai2-s2-research-public/open-corpus/"
SUFFIX="-filtered"

rm -f parsed_files.txt
rm -f manifest*

echo "Downloading&parsing SemanticScholar corpus"

wget --no-check-certificate https://s3-us-west-2.amazonaws.com/ai2-s2-research-public/open-corpus/manifest.txt

if [[ ! $? ]]; then
	printf "Unable to download manifest. Please retry"
	exit;
fi

filename="manifest.txt"

while read -r line; do 
FILENAMES=""; 
IFS=' ' read -r -a FILENAMES <<< "$line" 
for i in "${FILENAMES[@]}";do
# Download and process corpus partition 
# [see readme for required packeges/libraries]
	if contains "$i" "corpus";then 
	#If file doesn't exist we need to download
		file=${i#*/}
		filteredf=${file%.*}$SUFFIX
		#filtered file already exists
		if [[ -f $filteredf ]]; then
			echo "$i" >> parsed_files.txt
		#filtered file & download not present, need to download&parse
		elif [[ ! -f $file ]]; then
		#Check that there are at most 4 concurret downloads
			if [[ $DWN -ge 4 ]]; then
			echo "Waiting for one of the ${#DOWNLOAD_PIDS[@]} downloads to be completed"
			waitD4Pids
			DWN=${#DOWNLOAD_PIDS[@]}
			fi
			echo "$DWN simultaneus download, can add a new one."
			((DWN++))
			download_and_parse_file "$ROOT" "$i" &
			addDPid "Downloading $ROOT$i" $!
		#donwload present but no filtered file, only parsing
		else
		parse_file "$i" & 
		addPPid "Processing ${i#*/}" $!
		fi
	fi 
done 
done < "$filename"

echo "Waiting for ${#DOWNLOAD_PIDS[@]} downloads to complete"
waitDPids
echo "Waiting for ${#PARSING_PIDS[@]} partitions to be decompressed and parsed"
waitPPids

echo "Creating datasets from parsed partitions"
python2 merge_data.py

options=(
    "Delete both compressed and filtered partitions and quit"
    "Delete only compressed partitions and quit"
    "Delete only filtered partitions and quit"
    "Delete nothing and quit."
)

PS3="Datasets created, what do you want to do now? (1-${#options[@]}): "

clear

select option in "${options[@]}"; do
    case "$REPLY" in 
        1) echo	"Deleting all..."; rm -f *.gz; rm -f *-filtered; echo "Files deleted, quitting."; break ;;
        2) echo	"Deleting compressed partitions..."; rm -f *.gz; echo "Files deleted, quitting."; break ;;
        3) echo	"Deleting filtered partitions..."; rm -f *-filtered; echo "Files deleted, quitting."; break ;;
        *) echo "Nothing to delete, quitting."; break ;;
    esac
done

rm -f parsed_files.txt
rm -f manifest*

rm -Rf datasets
mkdir datasets
mv *pers.txt ./datasets/