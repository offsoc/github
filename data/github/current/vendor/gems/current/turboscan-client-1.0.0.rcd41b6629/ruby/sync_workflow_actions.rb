#!/usr/bin/env ruby
# frozen_string_literal: true

require "fileutils"
require "set"

root_dir = File.expand_path("../", __dir__)
expected_workflows = Dir.glob("#{root_dir}/ts/workflows/references/*.expected")

# Exclude certain workflow used for RC testing as the actions are not the ones we want to check.
expected_workflows.delete("#{root_dir}/ts/workflows/references/codeql-action-rc.expected")
expected_workflows.delete("#{root_dir}/ts/workflows/references/dependabot_proxy.expected")

used_actions = expected_workflows.each_with_object(Set.new) do |path, out|
  content = File.read(path)
  matches = content.scan(/uses: (.*)\n/)
  out.merge(matches.flatten)
end

File.open("#{__dir__}/lib/turboscan/workflow.rb", "w") do |file|
  file.write("# frozen_string_literal: true\n\n")
  file.write("# Code generated by #{File.basename(__FILE__)}, DO NOT EDIT.\n\n")
  file.write("module Turboscan\n")
  file.write("  module Workflow\n")
  file.write("    ACTIONS_TO_CHECK = %w[\n")
  used_actions.to_a.sort.each do |action|
    file.write("      #{action}\n")
  end
  file.write("    ].freeze\n")
  file.write("  end\n")
  file.write("end\n")
  file.close
end

File.open("#{root_dir}/.github/workflows/dependabot-workflow-update.yml", "w") do |file|
  file.write("# Code generated by #{File.basename(__FILE__)}, DO NOT EDIT.\n\n")
  file.puts("# If you are here because of a Dependabot update, it means the workflow template for Default Setup is out of date.")
  file.puts("# Please open a PR to update the workflow template in the same way.")
  file.write("# Once that new workflow template is fully rolled out, Dependabot should close this one automatically.\n\n")
  file.write("name: Dependabot workflow (updates only)\n\n")
  file.puts("on:")
  file.write("  workflow_dispatch: {}\n\n")
  file.write("permissions: {}\n\n")
  file.puts("jobs:")
  file.puts("  placeholder-updates:")
  file.puts("    runs-on: ubuntu-latest")
  file.puts("    steps:")
  file.puts("      - name: Fail early # because this auto-generated file is only here to make sure we keep the Default Setup workflow templates up-to-date")
  file.puts("        run: exit 1")
  used_actions.to_a.sort.each do |action|
    file.puts("      - uses: #{action}")
  end
end
