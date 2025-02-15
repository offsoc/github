# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Billing::GitLfsStorageMeteringJob`.
# Please instead update this file by running `bin/tapioca dsl Billing::GitLfsStorageMeteringJob`.

class Billing::GitLfsStorageMeteringJob
  class << self
    sig do
      params(
        current_run: T.nilable(::Time),
        previous_network_id: T.nilable(::Integer),
        duration: T.nilable(::Integer),
        block: T.nilable(T.proc.params(job: Billing::GitLfsStorageMeteringJob).void)
      ).returns(T.any(Billing::GitLfsStorageMeteringJob, FalseClass))
    end
    def perform_later(current_run: T.unsafe(nil), previous_network_id: T.unsafe(nil), duration: T.unsafe(nil), &block); end

    sig do
      params(
        current_run: T.nilable(::Time),
        previous_network_id: T.nilable(::Integer),
        duration: T.nilable(::Integer)
      ).void
    end
    def perform_now(current_run: T.unsafe(nil), previous_network_id: T.unsafe(nil), duration: T.unsafe(nil)); end
  end
end
