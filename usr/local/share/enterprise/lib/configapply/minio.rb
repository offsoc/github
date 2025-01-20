# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Minio

      def minio_enabled?
        !!raw_config.dig("app", "minio", "enabled")
      end

    end
  end
end
