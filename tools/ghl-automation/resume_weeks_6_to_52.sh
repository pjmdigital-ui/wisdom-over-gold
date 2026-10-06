#!/bin/bash
# Resumes the newsletter workflow batch build from Week 6 (Weeks 1-5
# are confirmed live and correct).
set -e
cd "$(dirname "$0")"

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
