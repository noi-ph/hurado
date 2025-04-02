import sys

input_fname = sys.argv[1]
judge_fname = sys.argv[2]
solver_fname = sys.argv[3]

with open(input_fname) as input_file:
    n_lines = int(next(input_file))
    input_lines = [next(input_file).strip() for _ in range(n_lines)]

def judge_output(submission_lines):
    if len(submission_lines) != len(input_lines):
        return 0
    else:
        return sum(
            1
            if submission_line == input_line.upper()
            else 0
            for input_line, submission_line in zip(input_lines, submission_lines)
        ) / len(submission_lines)


with open(judge_fname) as judge_file:
    judge_list = [judge_file.readline().strip() for _ in range(n_lines)]
    # extra_lines = judge_file.readlines()

with open(solver_fname) as solver_file:
    solver_list = [solver_file.readline().strip() for _ in range(n_lines)]
    # extra_lines = solver_file.readlines()

judge_score = judge_output(judge_list)
if judge_score != 1.0:
    print(input_lines)
    print(judge_list)
    raise RuntimeError("judge failed")

score = judge_output(solver_list)
if score == 1.0:
    print(score)
else:
    print(score)
