#include<iostream>
#include "cryptopp/aes.h"
#include "cryptopp/modes.h"
#include <cryptopp/secblock.h>
#include <cryptopp/osrng.h>
#include <cstring>
#include <iterator>
#include <sstream>

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

int main(int argc, char *argv[])
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
    std::string res = argv[1];
    size_t messageLen = res.size();
    unsigned char* plainText= (unsigned char*) argv[1];
    // std::cout<<argc<<std::endl;
    // std::cout<<messageLen<<std::endl;
    // // plainText[messageLen] = '\0';
    // // Decrypt
    CryptoPP::CFB_Mode<CryptoPP::AES>::Decryption cfbDecryption(key, key.size(), iv);
    cfbDecryption.ProcessData(plainText, plainText, messageLen);
    std::string result(reinterpret_cast< char const* >(plainText));
    auto position = result.find(iv_str);
    // std::cout<<result<<std::endl;
    // std::cout<<plainText<<std::endl;
    if(position != std::string::npos){
      result.erase(position, iv_str.length());
      std::cout<<result<<std::endl;
      std::cout<<1<<std::endl;
    }
    else std::cout<<0<<std::endl;
    return 0;
}
