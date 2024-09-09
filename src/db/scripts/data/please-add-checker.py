import sys
judge_fname = sys.argv[1]
output_fname = sys.argv[2]

with open(judge_fname) as judge_file, open(output_fname) as output_file:
    judge_list = [float(x) for x in judge_file.read().strip().split("\n")]
    output_list = [float(x) for x in output_file.read().strip().split("\n")]
hps = len(judge_list)
zipped = zip(judge_list, output_list)
score = sum(1 if abs(j - a) < 0.5 else 0 for j, a in zipped)

if score == hps:
    print("ac")
    print(score / hps)
else:
    print("wa")
    print(score / hps)
