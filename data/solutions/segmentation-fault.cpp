#include <iostream>
using namespace std;

int main() {
    int* ptr = nullptr;  // Create a null pointer
    cerr << "This program will crash with a segmentation fault" << endl;
    *ptr = 42;           // Dereferencing null → SEGFAULT
    cout << "Wrong answer" << endl;
    return 0;
}
