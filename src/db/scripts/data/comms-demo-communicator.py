import sys

input_fname = sys.argv[1]
judge_fname = sys.argv[2]
output_fname = sys.argv[3]

with open(input_fname) as input_file:
    input_queries = input_file.read().strip().split("\n")

# Print the number of queries
print(input_queries[0], flush=True)

with open(output_fname, "w") as output_file:
    for query in input_queries[1:]:
        print(query, flush=True)
        response = input()
        print(response, file=output_file)
