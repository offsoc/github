# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `UpdateExternalCustomerJob`.
# Please instead update this file by running `bin/tapioca dsl UpdateExternalCustomerJob`.

class UpdateExternalCustomerJob
  class << self
    sig do
      params(
        customer: ::Customer,
        block: T.nilable(T.proc.params(job: UpdateExternalCustomerJob).void)
      ).returns(T.any(UpdateExternalCustomerJob, FalseClass))
    end
    def perform_later(customer, &block); end

    sig { params(customer: ::Customer).void }
    def perform_now(customer); end
  end
end
