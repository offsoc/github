# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `UserDeleteJob`.
# Please instead update this file by running `bin/tapioca dsl UserDeleteJob`.

class UserDeleteJob
  class << self
    sig do
      params(
        user_id: T.untyped,
        login: T.untyped,
        block: T.nilable(T.proc.params(job: UserDeleteJob).void)
      ).returns(T.any(UserDeleteJob, FalseClass))
    end
    def perform_later(user_id, login, &block); end

    sig { params(user_id: T.untyped, login: T.untyped).returns(T.untyped) }
    def perform_now(user_id, login); end
  end
end
