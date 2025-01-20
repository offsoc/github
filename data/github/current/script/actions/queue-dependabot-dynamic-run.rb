#!/usr/bin/env safe-ruby
# frozen_string_literal: true

help = "Usage: queue-dependabot-dynamic-run.rb --nwo NWO --ref REF --runson RUNSON"

abort(help) unless [4, 6].include?(ARGV.length)
unless Rails.env.development? || ENV["DEPENDABOT_DYNAMIC_RUN_ENV_RESTRICTION"] == "false"
  abort("error: detected environment `#{Rails.env}`, if you know the risk of running this against `#{Rails.env}` set DEPENDABOT_DYNAMIC_RUN_ENV_RESTRICTION=false")
end

nwo = ""
ref = ""
runs_on = "ubuntu-latest" # Default for this

ARGV.each_slice(2) do |arg, value|
  if arg == "--nwo"
    nwo = value
  elsif arg == "--ref"
    ref = value
  elsif arg == "--runson"
    runs_on = value
  else
    abort(help)
  end
end

# defer the require so the user gets quick feedback on syntax/safety checks
require_relative "../../config/environment"

integration = Apps::Internal.integration(:dependabot)
abort("error: missing dependabot integration, run script/create-dependabot-github-app.rb and try again") if integration.nil?

repo = GitHub::Resources.with_name_with_owner(nwo)
abort("error: repository `#{nwo}` not found") if repo.nil?

# This yaml is taken from a production workflow, but the source lives here:
# https://github.com/github/dependabot-api/blob/main/app/actions/run_updater/actions/workflow.rb#L67
workflow_yaml = %{
---
name: 'docker in /. - Update #<jobID>'
'on': dynamic
jobs:
  Dependabot:
    runs-on:
    - #{runs_on}
    timeout-minutes: 55.0
    steps:
    - name: Setup node
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Mask secrets
      run: |
        echo "::add-mask::$(node -e 'console.log(JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH))[`inputs`][`jobToken`])')"
        echo "::add-mask::$(node -e 'console.log(JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH))[`inputs`][`credentialsToken`])')"
    - name: Create job directory
      run: mkdir -p  ./dependabot-job-a-jobID-unixTimestamp
    - name: Run Dependabot
      uses: github/dependabot-action@main
      env:
        DEPENDABOT_DISABLE_CLEANUP: '1'
        DEPENDABOT_ENABLE_CONNECTIVITY_CHECK: '0'
        GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}"

}

result = repo.run_dynamic_workflow(
  actor: integration.bot,
  workflow: workflow_yaml,
  inputs: {
    jobId: "a-jobID",
    jobToken: "a-jobToken",
    credentialsToken: "a-credentialsToken",
    dependabotApiUrl: "http://dependabot-actions.github.localhost",
    workingDirectory: "./dependabot-job-a-jobID-unixTimestamp",
  },
  ref: ref,
  workflow_name: "Dependabot Dynamic Workflow - Queued by script",
  slug: "queue_dependabot_dynamic_run",
  integration_name: "dependabot",
  entry_point: :script_actions_queue_dependabot_dynamic_run
)

puts("status: #{result.status}")
if result.call_succeeded?
  puts("execution_id: #{result.value.execution_id}")
  puts("workflow_run_id: #{result.value.workflow_run_id}")
else
  puts("error: #{result.options}")
end
