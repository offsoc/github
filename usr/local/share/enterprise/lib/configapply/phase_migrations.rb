# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # PhaseMigrations handles the "migrations" (2nd of 4) phase from #main
    module PhaseMigrations
      def config_phase_migrations
        log_status "Preparing storage device", :done
        log_status "Updating configuration", :done
        log_status "Reloading system services", :done
        log_status "Running migrations", :configuring
        log_status "Reloading application services", :pending

        t0 = Time.now
        # Lock HAProxy configs during run_migrations
        instrument_system("sudo systemctl stop haproxy-data-proxy-config.timer", "Locking haproxy-data-proxy config for migrations")
        instrument_system("sudo systemctl start haproxy-data-proxy-config.service", "Ensure haproxy-data-proxy is running the latest config")
        begin
          run_migrations
        ensure
          instrument_system("sudo systemctl start haproxy-data-proxy-config.timer", "Restarting proxy reloading")
        end
        log_time "Migrations", t0

        log_status "Running migrations", :done
      end
    end
  end
end
