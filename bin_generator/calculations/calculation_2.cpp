#include "Calculations.h"

class calculation_2: public Calculations{
    public:
    std::string calculate(){
        return "2.0";
    }
};


Calculations* getCalculator(){
    return  new calculation_2();
}