# frozen_string_literal: true

module Enterprise
  module ConfigApply
    # WriteLogs contains methods for ConfigApply to write status and info output,
    # and exec subprocesses
    module WriteLogs

      CONFIG_STATUS_CALLS = [
        "Preparing storage device",
        "Updating configuration",
        "Reloading system services",
        "Running migrations",
        "Reloading application services",
        "Validating services",
      ]

      def system_log(command, env_vars = {})
        ret = Command.new(command, env_vars: env_vars).run

        return ret.success?, ret.exitstatus
      end

      # log with timestamp, matches ISO 8601 format
      def log(msg)
        logger.info(msg)
      end

      def log_status(key, status = :pending)
        @config_status ||= Enterprise::ConfigApply::WriteLogs::ConfigStatus.new(logger)
        @config_status.log_status(key, status)
      end

      # Resets the status (writes the "pending" state to disk) for the 6 code
      # sections that make use of the full status FSM
      def reset_status
        @config_status ||= Enterprise::ConfigApply::WriteLogs::ConfigStatus.new(logger)
        @config_status.reset_status
      end

      def log_time(name, start)
        return unless ENV["GHE_BENCHMARK"]

        t = Time.now.to_f - start.to_f
        logger.info("Benchmark #{name}: %.3fs" % t)
      end

      # progress event logging
      def log_event(msg, depth, span_data, state, exit_status = nil)
        return unless log_event?(span_data)
        log_level = case depth
                    when(0..1) then "WARN"
                    when(2..3) then "INFO"
                    when(4..5) then "DEBUG"
                    when(6..)  then "TRACE"
        end
        # event is a namespace
        # ghes is a namespace
        # ghes.node is a namespace
        # config_apply_run is a namespace
        # trace is a namespace
        # trace.span is a namespace
        structured = {
          "Timestamp" => Time.now.strftime("%Y-%m-%dT%H:%M:%S.%L"),
          "SeverityText" => log_level,
          "Body" => msg,
          "event_name" => name(span_data),
          "event_state" => state.to_s,
        }
        unless span_data.attributes["skipped"].nil?
          structured.merge!("skipped" => skipped(span_data))
        end
        if exit_status
          structured.merge!("exit_status" => exit_status)
        end
        structured.merge!(
          "topology" => topology(span_data),
          "hostname" => hostname,
          "config_apply_run_id" => span_config_apply_run_id(span_data),
        )
        # we don't know the phase at the root span
        if span_data.hex_parent_span_id != "0000000000000000"
          structured.merge!("phase" => phase(span_data))
        end
        structured.merge!(
          "trace_id" => span_data.hex_trace_id,
          "span_id" => span_data.hex_span_id,
          "span_parent_id" => span_data.hex_parent_span_id,
          "span_depth" => depth,
        )
        event_logger.info(structured.to_json)
      end

      def log_event_finish(description, depth, span_data, exception)
        if exception
          exit_status = exception.respond_to?(:exit_status) ? exception.exit_status : 1
          log_event(exception.message, depth, span_data, "error", exit_status)
        else
          log_event(description, depth, span_data, "finish")
        end
      end

      def span_config_apply_run_id(span_data)
        span_data.resource.attribute_enumerator.select { |a| a[0] == "config_apply_run_id" }.dig(0, 1).to_s
      end

      def topology(span_data)
        span_data.resource.attribute_enumerator.select { |a| a[0] == "topology" }.dig(0, 1).to_s
      end

      def name(span_data)
        span_data.name.to_s
      end

      def skipped(span_data)
        !!span_data.attributes["skipped"]
      end

      def phase(span_data)
        span_data.attributes["phase"].to_i
      end

      def log_event?(span_data)
        return true if span_data.attributes["log_event"].nil?
        !!span_data.attributes["log_event"]
      end

      class ConfigStatus
        attr_writer :status_file
        attr_reader :logger

        CONFIG_STATUS_CALLS = [
          "Preparing storage device",
          "Updating configuration",
          "Reloading system services",
          "Running migrations",
          "Reloading application services",
          "Validating services",
        ]

        def initialize(logger)
          @logger = logger
        end

        def status
          @status ||= []
        end

        def status_file
          return @status_file if @status_file && !@status_file.closed?
          @status_file = File.open("/data/user/common/ghe-config-apply.status.json", "w")
        end

        def set_status(key, status = :pending)
          status = status.to_s.upcase

          field = self.status.detect { |s| s["key"] == key }
          if field
            field["status"] = status
          else
            self.status << { "key" => key, "status" => status }
          end
        end

        def log_status(key, status = :pending)
          set_status(key, status)

          status_file.write(self.status.to_json)
        ensure
          status_file.close
          output_status(key)
        end

        def output_status(key)

          h = status.detect { |s| s["key"] == key }
          key, status = h["key"], status = h["status"]
          if status == "FAILED"
            logger.error "ERROR: #{key}"
          # as written, there's only 4 states — pending, configurating, done and failed
          # so currently this logic is actually "if status == "CONFIGURING"
          elsif status != "PENDING" && status != "DONE"
            logger.warn "#{key}..."
          end
        end

        def reset_status
          CONFIG_STATUS_CALLS.each do |key|
            set_status(key)
          end
          status_file.write(self.status.to_json)
        ensure
          status_file.close
        end
      end
    end
  end
end
