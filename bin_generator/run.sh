#! /bin/sh
#ipfs pin ls  --type recursive -q | xargs i pfs pin rm
var=$(ls ./calculations | grep -v "\.h"  | wc -l)
make keys KEYCOUNT="$var"
./build/key_generator.o

filename="./encryption/keys/keys.txt"
COUNTER=0
while read -r line; do
    name="$line"
    A="$(cut -d$'\t' -f1 <<<"$name")"
    B="$(cut -d$'\t' -f2 <<<"$name")"
    COUNTER=$[$COUNTER +1]
    CLASS_NAME=$(ls ./calculations | grep -v "\.h" | sort | head -"$COUNTER" | tail -1)
    NAME="$(echo "$CLASS_NAME" | cut -d '.' -f1 )"

    make CalcClass="$CLASS_NAME" KEY="$A" SECBLOCK="$B" NAME="$NAME"
    make clean_build
done < "$filename"

#ipfs add  out/*  | awk '{print $2}' > encryption/keys/hashes.txt