# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `ProximaAppSync::SynchronizeFirstPartyAppsJob`.
# Please instead update this file by running `bin/tapioca dsl ProximaAppSync::SynchronizeFirstPartyAppsJob`.

class ProximaAppSync::SynchronizeFirstPartyAppsJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: ProximaAppSync::SynchronizeFirstPartyAppsJob).void)
      ).returns(T.any(ProximaAppSync::SynchronizeFirstPartyAppsJob, FalseClass))
    end
    def perform_later(&block); end

    sig { void }
    def perform_now; end
  end
end
