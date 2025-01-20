# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # PhaseValidation handles the "Validating Services" (4th of 4) phase from #main
    module PhaseValidation
      def config_phase_validation
        log_status "Preparing storage device", :done
        log_status "Updating configuration", :done
        log_status "Reloading system services", :done
        log_status "Running migrations", :done
        log_status "Reloading application services", :done
        log_status "Validating services", :configuring

        t0 = Time.now
        log_time "Validation", t0
        if validate_services == false
          logger.warn "WARNING: Validation encountered a problem, see /data/user/common/ghe-config.log for details"
        end
        # TODO this actually should be ":failed" if the validation failed
        log_status "Validating services", :done
      end
    end
  end
end
