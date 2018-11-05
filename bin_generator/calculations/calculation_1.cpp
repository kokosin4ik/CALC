#include "Calculations.h"

class calculation_1 : public Calculations{
    public:
    std::string calculate(){
        return "1.0";
    }

};

Calculations* getCalculator(){
    return  new calculation_1();
}