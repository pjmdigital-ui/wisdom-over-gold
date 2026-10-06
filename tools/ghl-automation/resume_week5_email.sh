#!/bin/bash
# Week 5's Wait already succeeded before the batch failed; this just
# retries the Week 5 Email step, then continues normally with 6-52.
set -e
cd "$(dirname "$0")"

subject=$(python3 -c "
import json
d = json.load(open('../../build/newsletter-emails/subjects.json'))
print(d['5'])
")
echo "=== Week 5: Email (retry) ($subject) ==="
node wf_append_email.js "Week 5 Email" "$subject" "../../build/newsletter-emails/week-05.html"
echo "=== Week 5 done ==="

for week in $(seq -w 6 52); do
  week_num=$((10#$week))
  echo "=== Week $week_num: Wait ==="
  node wf_append_wait.js

  subject=$(python3 -c "
import json
d = json.load(open('../../build/newsletter-emails/subjects.json'))
print(d['$week_num'])
")
  echo "=== Week $week_num: Email ($subject) ==="
  node wf_append_email.js "Week $week_num Email" "$subject" "../../build/newsletter-emails/week-$week.html"

  echo "=== Week $week_num done ==="
done

echo "ALL_WEEKS_COMPLETE"
