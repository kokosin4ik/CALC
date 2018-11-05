
#include <iostream>
#include <cmath>
class Calculations{
    public:
    virtual std::string calculate() = 0;
    Calculations()=default;
    ~Calculations()=default;
};

Calculations* getCalculator();
