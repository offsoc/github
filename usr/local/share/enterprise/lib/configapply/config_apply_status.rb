# frozen_string_literal: true

module Enterprise
  module ConfigApply
    # Status contains methods for writing the config apply run status
    module Status
      def config_apply_run_id
        ENV.fetch('GHE_CONFIG_APPLY_RUN_ID', SecureRandom.hex(8))
      end

      def write_config_apply_status_file(exit_status: 0, failure_message: nil, backtrace: nil, status_file_path: STATUS_FILE)
        status = {
          "run_id" => config_apply_run_id,
          "timestamp" => Time.now.strftime("#{ISO8601_FORMAT}"),
          "exit_status" => exit_status,
          "failure_message" => failure_message,
          "backtrace" => backtrace&.join("\n")
        }

        # Write our status file
        File.open(status_file_path, "w") do |f|
          f.write(JSON.pretty_generate(status) + "\n")
        end
      end
    end
  end
end
