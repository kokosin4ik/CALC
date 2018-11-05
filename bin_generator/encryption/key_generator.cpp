#include<iostream>
#include "cryptopp/aes.h"
#include "cryptopp/modes.h"
#include <cryptopp/secblock.h>
#include <cryptopp/osrng.h>
#include <algorithm>
#include <sstream>
#include <iostream>
#include <iterator>
#include <iomanip>
#include <fstream>


#ifndef KEYCOUNT
#define KEYCOUNT 0
#endif

int main(int argc, char const *argv[])
{
   
    std::ofstream supliements("encryption/keys/keys.txt");
    if(supliements.is_open()){
        CryptoPP::AutoSeededRandomPool rnd;
        for(int i = 0; i < KEYCOUNT; i++){
            CryptoPP::SecByteBlock key(0x00, CryptoPP::AES::DEFAULT_KEYLENGTH);
            
            rnd.GenerateBlock( key, key.size() );
            std::string str (key.begin(), key.end());
            CryptoPP::SecByteBlock iv(CryptoPP::AES::BLOCKSIZE);
            rnd.GenerateBlock(iv, iv.size());
            std::ostringstream result;
            result << std::hex ;
            std::copy(key.begin(), key.end(), std::ostream_iterator<unsigned int>(result, ""));
            str = result.str();
            while(str.length() < CryptoPP::AES::DEFAULT_KEYLENGTH * 2)
                str = "0" + str;
            supliements << str<<'\t';


            std::ostringstream result_block;
            result_block << std::hex ;
            std::copy(iv.begin(), iv.end(), std::ostream_iterator<unsigned int>(result_block, ""));
            str = result_block.str();
            while(str.length() < CryptoPP::AES::BLOCKSIZE * 2)
                str = "0" + str;
            supliements << str <<'\n';


        }
        supliements.close();
    }else
        std::cout<<"ERR"<<std::endl;
    return 0;
}
