#!/usr/bin/env safe-ruby
# typed: true
# frozen_string_literal: true

help = "Usage: queue-codespaces-dynamic-run.rb --nwo NWO --ref REF"

abort(help) if ARGV.length != 4
unless Rails.env.development? || ENV["CODESPACES_DYNAMIC_RUN_ENV_RESTRICTION"] == "false"
  abort("error: detected environment `#{Rails.env}`, if you know the risk of running this against `#{Rails.env}` set CODESPACES_DYNAMIC_RUN_ENV_RESTRICTION=false")
end

nwo = T.let("", T.nilable(String))
ref = T.let("", T.nilable(String))
ARGV.each_slice(2) do |arg, value|
  if arg == "--nwo"
    nwo = value
  elsif arg == "--ref"
    ref = value
  else
    abort(help)
  end
end

# defer the require so the user gets quick feedback on syntax/safety checks
require_relative "../../config/environment"

integration = Apps::Internal.integration(:codespaces_production)
abort("error: missing codespaces integration, run bin/setup-codespaces and try again") if integration.nil?

repo = GitHub::Resources.with_name_with_owner(nwo)
abort("error: repository `#{nwo}` not found") if repo.nil?

workflow_yaml = %{
on: push
jobs:
  codespaces:
    runs-on:  self-hosted
    steps:
      - run: exit 0
}

result = repo.run_dynamic_workflow(
  actor: integration.bot,
  workflow: workflow_yaml,
  inputs: nil,
  ref: ref,
  workflow_name: "Codespaces: Create Cached Codespace",
  slug: "create_cached_codespace",
  integration_name: "codespaces",
  entry_point: :script_actions_queue_codespaces_dynamic_run
)

puts("status: #{result.status}")
if result.call_succeeded?
  puts("execution_id: #{result.value.execution_id}")
  puts("workflow_run_id: #{result.value.workflow_run_id}")
else
  puts("error: #{result.options}")
end
