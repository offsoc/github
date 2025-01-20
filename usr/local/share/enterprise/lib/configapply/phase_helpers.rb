# frozen_string_literal: true

module Enterprise
  module ConfigApply
    # PhaseSupport contains methods shared by the three Phase* modules
    module PhaseHelpers
      # Note: TimeoutError is a name used elsewhere in the Ruby stdlib
      class LoopTimeoutError < RuntimeError; end

      # Deep fetch of a config value without raising an exception
      #
      # Returns nil if the config value does not exist.
      #
      # Example:
      #
      # Given this config in /data/user/common/github.conf:
      #
      #     [ collectd "graphite" ]
      #     enabled = true
      #
      # Then:
      #
      #     config_value('collectd', 'graphite', 'enabled') # => true
      #
      # Returns nil if the config key does not exist. Safe even if collectd's section
      # does not exist.
      #
      # Note, this references the @config instance variable defined in
      # ConfigApply::ServiceState, which passes @raw_config through #escape_object_for_file .
      def config_value(*args)
        args.reduce(@config ||= {}) { |m, k| m && m[k] }
      end

      def raw_config_value(*args)
        args.reduce(raw_config) { |m, k| m && m[k] }
      end

      # Runs the block inside a `loop` that monitors its (wall clock) runtime,
      # raising a RuntimeError after finishing a loop cycle it is out of time.
      # Manually `break` inside the block to end the loop.  Returns the value of the block.
      def loop_with_timeout(timeout)
        start_time = Time.now.to_f

        result = nil
        loop do
          result = yield
          raise LoopTimeoutError, "Time exceeded: #{timeout}s" if (Time.now.to_f - start_time) > timeout
        end
        result
      end

      def wait_for_socket(socket, path = "/")
        count = 0
        timeout = 600

        log "waiting for #{socket} "
        # Delete any earlier errors for this socket, so the results here prevail
        @failures.delete socket

        loop do
          begin
            sock = if /:/.match?(socket)
                     host, port = socket.split(/:/)
                     Net::BufferedIO.new(TCPSocket.new(host, port.to_i))
                   else
                     Net::BufferedIO.new(UNIXSocket.new(socket))
                   end
            request = Net::HTTP::Get.new(path)
            request.exec(sock, "1.1", path)
            response = Net::HTTPResponse.read_new(sock)
            if %w[200 301 302 307 404 400].include?(response.code)
              log "#{socket} came up ok!"
              break
            end
            if count >= timeout - 1
              err = "Soft fail on try ##{count} to hit '#{socket}': HTTP #{response.code}"
              @failures[socket] = err
              break
            end

            sleep(1)
          rescue Errno::ECONNRESET, Errno::ECONNREFUSED, Errno::ENOENT, Net::HTTPError, Net::ReadTimeout, EOFError => e
            if count >= timeout
              @failures[socket] = e.to_s
              break
            else
              sleep(1)
            end
          end
          count += 1
        end
      end

      def search_nodes_replica_count
        if cluster_ha_enabled?
          search_nodes(true).size - 1
        else
          search_nodes.size > 1 ? 1 : 0
        end
      end

      def update_auto_update_job
        if auto_update_check_enabled?
          system_log("/usr/local/bin/ghe-update-check -e")
        else
          system_log("/usr/local/bin/ghe-update-check -d")
        end
      end

      # helpers for phase methods
      class Phase
        attr_reader :number, :name, :description

        def initialize(number:, name:, description:, span_name:)
          @number       = number
          @name         = name
          @description  = description
          @span_name    = span_name
        end

        # name of the run method we call from main
        def run_method
          "run_phase_#{self.name}".gsub(/\W/,"_").downcase
        end

        # Otel Span name of the phase method that's called from the run method
        def span_name
          "Enterprise::ConfigApply::#{@span_name}"
        end
      end

      class Phases
        include Enumerable

        # A collection of phases
        # that also describes the nature of the config apply run
        def initialize(phases)
          err_msg = "phases array must contain 1 or 4 Phase objects"
          unless (phases.length == 1 || phases.length == 4)
            raise ArgumentError.new(err_msg)
          end
          phases.each { |p| raise ArgumentError.new(err_msg) unless p.is_a? Enterprise::ConfigApply::PhaseHelpers::Phase }
          @phases = phases
        end

        def each(&block)
          @phases.each(&block)
        end

        def single_phase?
          @phases.length == 1
        end

        # only returns a value when there is one phase
        def number
          return @phases.first.number if single_phase?
          nil
        end

        def numbers
          @phases.map { |p| p.number }
        end
      end

      PHASES = [
        Enterprise::ConfigApply::PhaseHelpers::Phase.new(number: 0, name: "Setup", description: "", span_name: "Run#run_phase_setup"),
        Enterprise::ConfigApply::PhaseHelpers::Phase.new(number: 1, name: "System Services", description: "Reloading system services", span_name: "PhaseSystemServices#config_phase_system_services"),
        Enterprise::ConfigApply::PhaseHelpers::Phase.new(number: 2, name: "Migrations", description: "Running migrations", span_name: "PhaseMigrations#config_phase_migrations"),
        Enterprise::ConfigApply::PhaseHelpers::Phase.new(number: 3, name: "Application Services", description: "Reloading application services", span_name: "PhaseAppServices#config_phase_app_services"),
        Enterprise::ConfigApply::PhaseHelpers::Phase.new(number: 4, name: "Validation", description: "Validating services", span_name: "PhaseValidation#config_phase_validation"),
      ]

      def phases
        # standalone appliance runs phases 1 to 4 (the setup phase is called at the start of phase 1)
        return Phases.new(PHASES[1..]) if (ENV["GHE_CONFIG_PHASE"].nil? || ENV["GHE_CONFIG_PHASE"].empty?)
        Phases.new(PHASES.select { |phase| phase.number == ENV["GHE_CONFIG_PHASE"].to_i })
      end

      def root_span_description
        select_phase ? select_phase.description : "Config apply run"
      end

      def root_span_name
        select_phase ? select_phase.span_name : "Enterprise::ConfigApply::Run#main"
      end

      def select_phase
        return nil if ENV["GHE_CONFIG_PHASE"].nil? || ENV["GHE_CONFIG_PHASE"].empty?
        # to_i doesn't raise an exception — returns 0 on string that's not a valid number
        raise ConfigApplyException.new("GHE_CONFIG_PHASE is not valid", exit_status: 1) unless (1..4).include?(ENV["GHE_CONFIG_PHASE"].to_i)
        PHASES.select { |phase| phase.number == ENV["GHE_CONFIG_PHASE"].to_i }.first
      end
    end
  end
end
