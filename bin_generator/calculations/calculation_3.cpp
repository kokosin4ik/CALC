#include "Calculations.h"

class calculation_3 : public Calculations{
    public:
    std::string calculate(){
        return "3.0";
    }

};

Calculations* getCalculator(){
    return  new calculation_3();
}