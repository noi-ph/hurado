import sys
input_fname = sys.argv[1]
judge_fname = sys.argv[2]
answer_fname = sys.argv[3]

with open(judge_fname) as judge_file, open(answer_fname) as answer_file:
    judge_list = judge_file.read().split(" ")
    answer_list = answer_file.read().split(" ")
hps = len(judge_list)
zipped = zip(judge_list, answer_list)
score = sum(1 if j == a else 0 for j, a in zipped)

print(score / hps, file=sys.stdout)
if score == hps:
    print("translate:success", file=sys.stderr)
    sys.exit(0)
elif score > 0:
    print("translate:partial", file=sys.stderr)
    sys.exit(5)
else:
    print("translate:wrong", file=sys.stderr)
    sys.exit(1)
