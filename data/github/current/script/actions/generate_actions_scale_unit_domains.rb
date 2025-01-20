#!/usr/bin/env ruby
# frozen_string_literal: true
require "open3"

# Hard-code MPS because this script queries MPS and MPS doesn't know about
# itself. MPS will also be the last VSSF service to be decommissioned.
mps_url = "mpsghub.actions.githubusercontent.com"
token_host_id = "00000052-0000-8888-8000-000000000000"
pipelines_host_id = "0000005a-0000-8888-8000-000000000000"
artifact_cache_host_id = "0000006d-0000-8888-8000-000000000000"
mms_host_id = "00000040-0000-8888-8000-000000000000"
runner_host_id = "0000006f-0000-8888-8000-000000000000"

command = <<-EOS
curl -s "https://#{mps_url}/_apis/servicedefinitions/LocationService2" | jq '.value[] | select(.parentIdentifier == "#{token_host_id}" or .parentIdentifier == "#{pipelines_host_id}" or .parentIdentifier == "#{artifact_cache_host_id}" or .parentIdentifier == "#{mms_host_id}" or .parentIdentifier == "#{runner_host_id}") | .locationMappings[] | select(.accessMappingMoniker == "ScaleUnitMapping") | .location' | tr -d '"/' | sed -e "s/^https://"
EOS

out, err, status = Open3.capture3(command)
raise "Failed to get domains: #{err}" unless status.success?

domains = out.split("\n")

domains << mps_url
domains = domains.uniq
domains = domains.sort

header_comment = "# THIS FILE IS GENERATED. DO NOT EDIT MANUALLY. USE script/generate_actions_scale_unit_domains.rb TO POPULATE THIS FILE."

File.open("lib/github/config/actions_scale_unit_domains.txt", "w") do |f|
  f.puts(header_comment)
  f.puts(domains)
end
