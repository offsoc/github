# frozen_string_literal: true

module GitHub
  module Spokes
    module Proto
      module Gitauth
        def self.new_ok_host_status(host:, path:, replica_name: nil)
          V1::HostStatus.new \
            replica_name: replica_name,
            host: host,
            path: path,
            ok_result: {}
        end

        def self.new_error_host_status(host:, path:, error:, replica_name: nil)
          V1::HostStatus.new \
            replica_name: replica_name,
            host: host,
            path: path,
            error_result: {error_message: error}
        end
      end
    end
  end
end
