# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `UpdateTableUserHiddenJob`.
# Please instead update this file by running `bin/tapioca dsl UpdateTableUserHiddenJob`.

class UpdateTableUserHiddenJob
  class << self
    sig do
      params(
        user_id: T.untyped,
        tables: T.untyped,
        block: T.nilable(T.proc.params(job: UpdateTableUserHiddenJob).void)
      ).returns(T.any(UpdateTableUserHiddenJob, FalseClass))
    end
    def perform_later(user_id, tables, &block); end

    sig { params(user_id: T.untyped, tables: T.untyped).returns(T.untyped) }
    def perform_now(user_id, tables); end
  end
end
