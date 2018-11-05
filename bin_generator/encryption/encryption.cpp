#include<iostream>
#include "cryptopp/aes.h"
#include "cryptopp/modes.h"
#include <cryptopp/secblock.h>
#include <cryptopp/osrng.h>
#include "../calculations/Calculations.h"
#include <cstring>
#include <iterator>
#include <sstream>
#include <fstream>

#ifndef KEY
#define KEY "4c80ef7e2ce8bc5d176cf94b05115b4"
#endif

#ifndef SECBLOCK
#define SECBLOCK "4c80ef7e2ce8bc5d176cf94b05115b4d691c2f5eaef2eb1e82920426911d44e"
#endif


std::vector<CryptoPP::byte> HexToBytes(const std::string& hex) {
  std::vector<CryptoPP::byte> bytes;

  for (unsigned int i = 0; i < hex.length(); i += 2) {
    std::string byteString = hex.substr(i, 2);
    CryptoPP::byte byte = (CryptoPP::byte) strtol(byteString.c_str(), NULL, 16);
    bytes.push_back(byte);
  }

  return bytes;
}

int main(int argc, char const *argv[])
{
    std::string str = KEY;
    std::string iv_str = SECBLOCK;
    // std::cout<<str<<std::endl;
    // std::cout<<SECBLOCK<<std::endl;
    CryptoPP::AutoSeededRandomPool rnd;

    std::vector<CryptoPP::byte> byte_vec = HexToBytes(str);
    CryptoPP::SecByteBlock key(&byte_vec[0], byte_vec.size());
    
    byte_vec = HexToBytes(iv_str);
    CryptoPP::SecByteBlock iv(&byte_vec[0], byte_vec.size());

    Calculations* calc = getCalculator();
    // std::cout<<calc ->calculate()<<std::endl;
    std::string msg = calc ->calculate() + iv_str;
    unsigned char* plainText = (unsigned char*)(msg.c_str());
    size_t messageLen = std::strlen((char*)plainText) + 1;
    // Encrypt
    CryptoPP::CFB_Mode<CryptoPP::AES>::Encryption cfbEncryption(key, key.size(), iv);
    cfbEncryption.ProcessData(plainText, plainText, messageLen);

    std::ofstream supliements("result.txt");
    if(supliements.is_open()){
        for(auto i =0; i < messageLen; i++){
            supliements<<*(plainText + i);
        }
    }else{
        std::cout<<"Cannot make file";
    }

    return 0;
}
