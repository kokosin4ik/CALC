CalcClass =
CC=g++ -std=c++11
CFLAGS=-c -Wall  -Iinclude
CRYPTO= -lcryptopp
CRYPTOPATH=./encryption/
CALCPATH=./calculations/
SOURCES=encryption.cpp
DESOURCES=decrypt.cpp
BUILD=build/
OUT=out/enc/
DEOUT=out/dec/
CALCULATORS=$(BUILD)$(CalcClass:.cpp=.o)
OBJECTS=$(BUILD)$(SOURCES:.cpp=.o)
DEOBJECTS=$(BUILD)$(DESOURCES:.cpp=.o)
KEY=
SECBLOCK=
KEYCOUNT=
NAME=
DENAME=
encrypt: $(NAME)
$(NAME): $(OBJECTS) $(CALCULATORS)
	$(CC) $(OBJECTS) $(CALCULATORS) -o  $(OUT)$(NAME) $(CRYPTO) 
$(OBJECTS):$(CRYPTOPATH)$(SOURCES)  
	$(CC) $(CFLAGS) -D KEY=\"$(KEY)\"  -D SECBLOCK=\"$(SECBLOCK)\" $(CRYPTOPATH)$(SOURCES) -o $@ 

$(CALCULATORS):$(CALCPATH)$(CalcClass)
	$(CC) $(CFLAGS) $(CALCPATH)$(CalcClass) -o $@


decrypt:$(DENAME)

$(DENAME): $(DEOBJECTS) 
	$(CC) $(DEOBJECTS) -o  $(DEOUT)$(DENAME) $(CRYPTO) 
$(DEOBJECTS):$(CRYPTOPATH)$(DESOURCES)  
	$(CC) $(CFLAGS) -D KEY=\"$(KEY)\"  -D SECBLOCK=\"$(SECBLOCK)\" $(CRYPTOPATH)$(DESOURCES) -o $@ 

keys:
	$(CC)  $(CRYPTO)  -D KEYCOUNT=$(KEYCOUNT) -o $(BUILD)key_generator.o  $(CRYPTOPATH)key_generator.cpp

clean: clean_build clean_out

clean_build:
	rm $(BUILD)*.o
clean_out:
	rm $(OUT)* rm $(DEOUT)*