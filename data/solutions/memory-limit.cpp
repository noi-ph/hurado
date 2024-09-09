#include <stdio.h>
#include <malloc.h>

int LIMIT = 1000000;

int main() {
    char** arr = (char**)malloc(LIMIT * sizeof(char*));
    for (int i = 0; i<LIMIT; i++) {
        arr[i] = (char*)malloc(1000 * sizeof(char));
        arr[i][i % 1000] = i % 256; // Force CoW to actually allocate the page
    }
    printf("Done\n");
}
