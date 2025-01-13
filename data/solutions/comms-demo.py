cases = int(input())

for i in range(cases):
    n = int(input())
    ans = n * (n + 1) // 2
    print(ans, flush=True)
