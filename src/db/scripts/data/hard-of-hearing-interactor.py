import sys
input_fname = sys.argv[1]
judge_fname = sys.argv[2]
score_fname = sys.argv[3]

with open(input_fname) as input_file:
    input_queries = input_file.read().strip().split("\n")

score = 0
hps = len(input_queries)
for query in input_queries:
    print(query)
    response = input()
    if query.upper() == response:
        score += 1

with open(score_fname) as score_file:
    print(score / hps, file=score_file)
    if score == hps:
        print("translate:success", file=score_file)
        sys.exit(0)
    elif score > 0:
        print("translate:partial", file=score_file)
        sys.exit(5)
    else:
        print("translate:wrong", file=score_file)
        sys.exit(1)
