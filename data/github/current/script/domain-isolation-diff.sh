#!/bin/bash

BASE_REF=$1
HEAD_REF=$2
HEAD_SHA=$3
PR_NUMBER=$4

MERGE_BASE=$(gh api -X GET "/repos/github/github/compare/$BASE_REF...$HEAD_REF" | jq -r ".merge_base_commit.sha")
bundle exec script/domain-isolation-query-violations --audit --reason domain_access --sha "$MERGE_BASE"
mkdir -p /tmp/query_diff/base
rsync -av --files-from=<(find . -type f -name 'domain_query_violations.yml' -print) --relative . /tmp/query_diff/base
/usr/bin/git clean -f
/usr/bin/git checkout $HEAD_SHA -- packages

RUN_ID=""
START_TIME=$(date +%s)
TIMEOUT=1800

while [ -z "$RUN_ID" ]; do
  CURRENT_TIME=$(date +%s)
  ELAPSED_TIME=$((CURRENT_TIME - START_TIME))

  if [ "$ELAPSED_TIME" -ge "$TIMEOUT" ]; then
    echo "Timeout reached. Exiting..."
    exit 0
  fi

  RUN_ID=$(gh run list --repo "github/github" --commit "$HEAD_SHA" --status "completed" --workflow "GitHub CI - Actions" --json databaseId | jq ".[] | .databaseId" | tail -n1)
  if [ -z "$RUN_ID" ]; then
    echo "Waiting for GitHub CI - Actions workflow to finish..."
    sleep 10
  fi
done

bundle exec script/domain-isolation-query-violations --audit --reason domain_access --sha "$HEAD_SHA"
mkdir -p /tmp/query_diff/head
rsync -av --files-from=<(find . -type f -name "domain_query_violations.yml" -print | grep -v "branch_queries") --relative . /tmp/query_diff/head

diff -r -u /tmp/query_diff/base /tmp/query_diff/head > query_diff.txt || true
if [ -s query_diff.txt ]; then
  COMMENT_BODY=$(cat query_diff.txt)
  FORMATTED_COMMENT=$(cat <<EOF
Your PR changes some database queries on tables that are part of the domain isolation project. Consider reaching out to the owners of these tables to discuss the changes.

<details>
<summary>Changed Queries</summary>

\`\`\`diff
$COMMENT_BODY
\`\`\`

</details>

---

This comment was brought to you by \`#domain-isolation\`. Feedback welcome.
EOF
)
  EXISTING_COMMENT_ID=$(gh api -X GET "/repos/github/github/issues/$PR_NUMBER/comments" --jq '.[] | select(.body | contains("#domain-isolation")) | .id' | tail -n1)

  if [ -n "$EXISTING_COMMENT_ID" ]; then
    gh api -X PATCH "/repos/github/github/issues/comments/$EXISTING_COMMENT_ID" -f body="$FORMATTED_COMMENT"
  else
    gh api -X POST "/repos/github/github/issues/$PR_NUMBER/comments" -f body="$FORMATTED_COMMENT"
  fi
else
  echo "Empty diff. Skipping..."
fi
