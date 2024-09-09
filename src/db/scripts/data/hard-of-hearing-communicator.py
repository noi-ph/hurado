import sys
input_fname = sys.argv[1]
judge_fname = sys.argv[2]
output_fname = sys.argv[3]

with open(input_fname) as input_file:
    input_queries = input_file.read().strip().split("\n")

with open(output_fname, "w") as output_file:
    for query in input_queries:
        print(query, flush=True)
        response = input()
        print(response, file=output_file)
