# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `UserSuspendDormantJob`.
# Please instead update this file by running `bin/tapioca dsl UserSuspendDormantJob`.

class UserSuspendDormantJob
  class << self
    sig do
      params(
        threshold: T.untyped,
        block: T.nilable(T.proc.params(job: UserSuspendDormantJob).void)
      ).returns(T.any(UserSuspendDormantJob, FalseClass))
    end
    def perform_later(threshold, &block); end

    sig { params(threshold: T.untyped).returns(T.untyped) }
    def perform_now(threshold); end
  end
end
