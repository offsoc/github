# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Billing::SynchronizeAccountInformationJob`.
# Please instead update this file by running `bin/tapioca dsl Billing::SynchronizeAccountInformationJob`.

class Billing::SynchronizeAccountInformationJob
  class << self
    sig do
      params(
        billing_entity: T.untyped,
        block: T.nilable(T.proc.params(job: Billing::SynchronizeAccountInformationJob).void)
      ).returns(T.any(Billing::SynchronizeAccountInformationJob, FalseClass))
    end
    def perform_later(billing_entity, &block); end

    sig { params(billing_entity: T.untyped).returns(T.untyped) }
    def perform_now(billing_entity); end
  end
end
