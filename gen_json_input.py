import time
import json


data = [
    {"unnamed": 1, "A": 4, "B": 7},
    {"unnamed": 1, "A": 4, "B": 6.5},
    {"unnamed": 0, "A": 4, "B": 6},
    {"unnamed": 0, "A": 4, "B": 5.5},
    {"unnamed": 1, "A": 4, "B": 5},
    {"unnamed": 1, "A": 4, "B": 4.5},
    {"unnamed": 2, "A": 4, "B": 4.5},
    {"unnamed": 2, "A": 4, "B": 4.5},
    {"unnamed": 3, "A": 4, "B": 5},
    {"unnamed": 3, "A": 4, "B": 5.5},
    {"unnamed": 2, "A": 4, "B": 6},
    {"unnamed": 2, "A": 4, "B": 6.5},
]

TOP = 16
for i in range(TOP + 1):
    print(float(i) / 4, flush=True)
    time.sleep(0.3)
for i in range(TOP):
    print(float(TOP - 1 - i) / 4, flush=True)
    time.sleep(0.3)

for _ in range(8):
    for d in data:
        print(json.dumps(d), flush=True)
        time.sleep(0.7)

