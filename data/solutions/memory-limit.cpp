#include <iostream>
#include <malloc.h>
using namespace std;

int LIMIT = 10000000;
int CHUNK_SIZE = 1000000;

int main() {
    cerr << "This program will crash with a memory limit error" << endl;
    char** arr = (char**)malloc(LIMIT * sizeof(char*));
    for (int i = 0; i<LIMIT; i++) {
        arr[i] = (char*)malloc(CHUNK_SIZE * sizeof(char));
        arr[i][i % CHUNK_SIZE] = i % 256; // Force CoW to actually allocate the page
    }
    cout << "Done" << endl;
}
