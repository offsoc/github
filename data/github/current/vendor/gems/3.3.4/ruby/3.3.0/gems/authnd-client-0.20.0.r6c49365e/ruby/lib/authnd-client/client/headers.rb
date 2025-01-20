# frozen_string_literal: true

require "base64"

module Authnd
  module Client
    ENABLED_FEATURES_HEADER = "X-GitHub-Features"

    # format_enabled_features_header formats the provided list of features for usage in a request header. Any features
    # encoded in the header will be interpretted by the authnd server to drive optional behavior.
    def self.format_enabled_features_for_header(features)
      raise ArgumentError, "enabled features must be a list" unless features.is_a?(Array)

      features.each do |feature|
        raise ArgumentError, "all features be strings" unless feature.is_a?(String)
      end

      Base64.strict_encode64(JSON.dump(features))
    end
  end
end
