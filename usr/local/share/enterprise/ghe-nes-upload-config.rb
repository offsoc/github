#!/usr/bin/env ruby

# ghe-nes-upload-config serializes the cluster_config as json, and
# uploads this data to the NES service.  It should only be run once
# as part of the ghe-cluster-config-apply process. It should not be
# run outside of ghe-cluster-config-apply, otherwise the config in
# NES will not match reality.
# It exits early if NES is not enabled.
require "json"
require "net/http"
require "/data/enterprise-manage/current/lib/ghe-config"
require_relative "lib/configapply/config_files.rb"
require_relative "lib/configapply/mode_helpers.rb"
require_relative "lib/configapply/budgets.rb"
require_relative "lib/configapply/nes.rb"

class GheNesUploadConfig
  include Enterprise::ConfigApply::ConfigFiles
  include Enterprise::ConfigApply::ModeHelpers
  include Enterprise::ConfigApply::Budgets
  include Enterprise::ConfigApply::Nes

  def upload_config
    return 0 unless nes_enabled? # Exit early if NES is not enabled.

    # grab our cluster.conf and convert to JSON
    cluster_json = cluster_config.to_json
    # The NES api expects a JSON string as input, so we have to double-encode
    # the cluster_json by wrapping it in a string.
    cluster_json = JSON.generate("#{cluster_json}")

    # upload our cluster json to NES service
    http = Net::HTTP.new("localhost", 5555)
    headers = {"Content-Type" => "application/json"}
    resp = http.put("/v1/clusterconf", cluster_json, headers)
    if resp.code != "200"
      warn "Failed to upload config to NES. Response code: #{resp.code}"
      return 1
    end

    return 0
  rescue StandardError => e
    warn "Unknown Error uploading to NES: #{e.message}"
    return 1
  end
end


if $0 == __FILE__
  exit GheNesUploadConfig.new.upload_config
end
