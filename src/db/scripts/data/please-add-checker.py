import sys
input_fname = sys.argv[1]
judge_fname = sys.argv[2]
output_fname = sys.argv[3]

with open(judge_fname) as judge_file, open(output_fname) as output_file:
    judge_list = [float(x) for x in judge_file.read().strip().split("\n")]
    output_list = [float(x) for x in output_file.read().strip().split("\n")]
hps = len(judge_list)
zipped = zip(judge_list, output_list)
score = sum(1 if abs(j - a) < 0.5 else 0 for j, a in zipped)

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
