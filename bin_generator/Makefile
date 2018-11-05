CalcClass =
CC=g++ -std=c++11
CFLAGS=-c -Wall  -Iinclude
CRYPTO= -lcryptopp
CRYPTOPATH=./encryption/
CALCPATH=./calculations/
SOURCES=encryption.cpp
BUILD=build/
OUT=out/
CALCULATORS=$(BUILD)$(CalcClass:.cpp=.o)
OBJECTS=$(BUILD)$(SOURCES:.cpp=.o)
KEY=
SECBLOCK=
KEYCOUNT=
NAME=
all: $(NAME)
$(NAME): $(OBJECTS) $(CALCULATORS) 
	$(CC) $(OBJECTS) $(CALCULATORS) -o  $(OUT)$(NAME) $(CRYPTO) 
$(OBJECTS):$(CRYPTOPATH)$(SOURCES)  
	$(CC) $(CFLAGS) -D KEY=\"$(KEY)\"  -D SECBLOCK=\"$(SECBLOCK)\" $(CRYPTOPATH)$(SOURCES) -o $@ 

$(CALCULATORS):$(CALCPATH)$(CalcClass)
	$(CC) $(CFLAGS) $(CALCPATH)$(CalcClass) -o $@

keys:
	$(CC)  $(CRYPTO)  -D KEYCOUNT=$(KEYCOUNT) -o $(BUILD)key_generator.o  $(CRYPTOPATH)key_generator.cpp

clean: clean_build clean_out

clean_build:
	rm $(BUILD)*.o
clean_out:
	rm $(OUT)*