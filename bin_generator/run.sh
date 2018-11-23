#! /bin/sh
#ipfs pin ls  --type recursive -q | xargs i pfs pin rm
var=$(ls ./calculations | grep -v "\.h"  | wc -l)
make keys KEYCOUNT="$var" > temp
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
    DENAME="$(echo "DE$CLASS_NAME" | cut -d '.' -f1 )"
    make encrypt CalcClass="$CLASS_NAME" KEY="$A" SECBLOCK="$B" NAME="$NAME" > temp
    make clean_build > temp
    make decrypt KEY="$A" SECBLOCK="$B" DENAME="$DENAME" > temp
    make clean_build > temp
done < "$filename"
rm temp
# ipfs add  out/dec/*  | awk '{print $2}' > encryption/keys/hashes_DENC 
# ipfs add  out/enc/*  | awk '{print $2}' > encryption/keys/hashes_ENC
paste -d"\t" encryption/keys/hashes_DENC encryption/keys/hashes_ENC 
