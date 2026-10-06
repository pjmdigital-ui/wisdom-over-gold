#!/bin/bash
# Appends the remaining Wait + Send Email action pairs (Weeks 3-52) to
# the "Seek First Weekly Newsletter" workflow, one week at a time,
# stopping immediately on any failure so a broken run doesn't silently
# continue past a bad week.
set -e
cd "$(dirname "$0")"

for week in $(seq -w 4 52); do
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
