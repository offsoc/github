# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SecurityCenter::DeadLetterJob`.
# Please instead update this file by running `bin/tapioca dsl SecurityCenter::DeadLetterJob`.

class SecurityCenter::DeadLetterJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: SecurityCenter::DeadLetterJob).void)
      ).returns(T.any(SecurityCenter::DeadLetterJob, FalseClass))
    end
    def perform_later(&block); end

    sig { void }
    def perform_now; end
  end
end
