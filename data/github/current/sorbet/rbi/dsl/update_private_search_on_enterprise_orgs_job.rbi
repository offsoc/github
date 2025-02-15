# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `UpdatePrivateSearchOnEnterpriseOrgsJob`.
# Please instead update this file by running `bin/tapioca dsl UpdatePrivateSearchOnEnterpriseOrgsJob`.

class UpdatePrivateSearchOnEnterpriseOrgsJob
  class << self
    sig do
      params(
        business_id: T.untyped,
        options: T.untyped,
        block: T.nilable(T.proc.params(job: UpdatePrivateSearchOnEnterpriseOrgsJob).void)
      ).returns(T.any(UpdatePrivateSearchOnEnterpriseOrgsJob, FalseClass))
    end
    def perform_later(business_id, options = T.unsafe(nil), &block); end

    sig { params(business_id: T.untyped, options: T.untyped).returns(T.untyped) }
    def perform_now(business_id, options = T.unsafe(nil)); end
  end
end
