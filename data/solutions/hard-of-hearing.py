try:
    while True:
        line = input()
        print(line.upper(), flush=True)
except EOFError:
    pass
