import sys
judge_fname = sys.argv[1]
output_fname = sys.argv[2]

with open(judge_fname) as judge_file, open(output_fname) as output_file:
    judge_list = judge_file.read().split(" ")
    output_list = output_file.read().split(" ")
hps = len(judge_list)
zipped = zip(judge_list, output_list)
score = sum(1 if j == a else 0 for j, a in zipped)

if score == hps:
    print("ac")
    print(score / hps)
else:
    print("wa")
    print(score / hps)
