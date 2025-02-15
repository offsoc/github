# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BusinessOrganizationBillingJob`.
# Please instead update this file by running `bin/tapioca dsl BusinessOrganizationBillingJob`.

class BusinessOrganizationBillingJob
  class << self
    sig do
      params(
        business: ::Business,
        org: ::Organization,
        block: T.nilable(T.proc.params(job: BusinessOrganizationBillingJob).void)
      ).returns(T.any(BusinessOrganizationBillingJob, FalseClass))
    end
    def perform_later(business, org, &block); end

    sig { params(business: ::Business, org: ::Organization).void }
    def perform_now(business, org); end
  end
end
