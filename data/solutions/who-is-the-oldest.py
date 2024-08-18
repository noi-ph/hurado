ages = [
    int(input()),
    int(input()),
    int(input()),
]
names = ['Alvin', 'Berto', 'Carlo']
pairs = zip(ages, names)
sorted_pairs = sorted(pairs)
print(sorted_pairs[2][1])
