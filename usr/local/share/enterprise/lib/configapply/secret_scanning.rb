# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module SecretScanning
      def secret_scanning_enabled?
        !!raw_config.dig("app", "secret-scanning", "enabled")
      end

      def check_secret_scanning_pre_reqs
        return unless single_node? || cluster_value_true?(cluster_node_name, "job-server")
        ok, _ = system_log("grep -iE '^flags.*ssse3' /proc/cpuinfo >/dev/null")
        if !ok
          log_status "The CPUs of your virtual appliance do not advertise or support Supplemental Streaming SIMD Extensions 3 instructions required by Secret Scanning. You will need to enable this feature if your host system supports it.", :failed
          exit(1)
        end
      end
    end
  end
end
