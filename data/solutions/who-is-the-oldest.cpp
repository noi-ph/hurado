#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<pair<int, string>> pairs;
    int a, b, c;
    cin >> a >> b >> c;
    pairs.push_back(make_pair(a, "Alvin"));
    pairs.push_back(make_pair(b, "Berto"));
    pairs.push_back(make_pair(c, "Carlo"));
    sort(pairs.begin(), pairs.end());
    cout << pairs[2].second << endl;
}
