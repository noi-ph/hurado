import sys

judge_fname = sys.argv[1]
solver_fname = sys.argv[2]

with open(judge_fname) as judge_file:
    input_lines = judge_file.readlines()
    n_lines = len(input_lines)
    judge_list = [line.strip() for line in input_lines]

with open(solver_fname) as solver_file:
    solver_list = [solver_file.readline().strip() for _ in range(n_lines)]
    extra_lines = solver_file.readlines()

score = sum(1 if j == s else 0 for j, s in zip(judge_list, solver_list))
score -= len(extra_lines)

hps = len(judge_list)

if score > hps:
    print("ac")
    print(score / hps)
else:
    print("wa")
    print(score / hps)
