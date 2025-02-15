# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DpagesMaintenanceSchedulerJob`.
# Please instead update this file by running `bin/tapioca dsl DpagesMaintenanceSchedulerJob`.

class DpagesMaintenanceSchedulerJob
  class << self
    sig do
      params(
        args: T.untyped,
        delegate: T.untyped,
        block: T.nilable(T.proc.params(job: DpagesMaintenanceSchedulerJob).void)
      ).returns(T.any(DpagesMaintenanceSchedulerJob, FalseClass))
    end
    def perform_later(*args, delegate: T.unsafe(nil), &block); end

    sig { params(args: T.untyped, delegate: T.untyped).returns(T.untyped) }
    def perform_now(*args, delegate: T.unsafe(nil)); end
  end
end
