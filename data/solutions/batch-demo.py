# Set these to the score you want. Max of 4 for case 1, 6 for case 2.
SCORE_CASE_1A = 4
SCORE_CASE_1B = 8
SCORE_CASE_2A = 6
SCORE_CASE_2B = 12

LINES_CASE_1A = 4
LINES_CASE_1B = 8
LINES_CASE_2A = 6
LINES_CASE_2B = 12

TARGET_SCORES = {
    LINES_CASE_1A: SCORE_CASE_1A,
    LINES_CASE_1B: SCORE_CASE_1B,
    LINES_CASE_2A: SCORE_CASE_2A,
    LINES_CASE_2B: SCORE_CASE_2B,
}

n = int(input())

# Get a score based on configured values
target = TARGET_SCORES.get(n, n)

score = 0
for i in range(n):
    s = input()
    if score < target:
        print(s.upper())
        score += 1
    else:
        print(s)
