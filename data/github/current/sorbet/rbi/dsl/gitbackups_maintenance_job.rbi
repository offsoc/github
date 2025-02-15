# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitbackupsMaintenanceJob`.
# Please instead update this file by running `bin/tapioca dsl GitbackupsMaintenanceJob`.

class GitbackupsMaintenanceJob
  class << self
    sig do
      params(
        spec: T.untyped,
        opts: T.untyped,
        block: T.nilable(T.proc.params(job: GitbackupsMaintenanceJob).void)
      ).returns(T.any(GitbackupsMaintenanceJob, FalseClass))
    end
    def perform_later(spec, opts: T.unsafe(nil), &block); end

    sig { params(spec: T.untyped, opts: T.untyped).returns(T.untyped) }
    def perform_now(spec, opts: T.unsafe(nil)); end
  end
end
