import sys
input_fname = sys.argv[1]
judge_fname = sys.argv[2]
answer_fname = sys.argv[3]

with open(input_fname) as input_file:
    input_queries = input_file.read().strip().split("\n")

with open(answer_fname, "w") as answer_file:
    for query in input_queries:
        print(query, flush=True)
        response = input()
        print(response, file=answer_file)
