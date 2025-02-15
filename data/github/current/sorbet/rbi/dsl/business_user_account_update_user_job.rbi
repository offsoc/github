# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BusinessUserAccountUpdateUserJob`.
# Please instead update this file by running `bin/tapioca dsl BusinessUserAccountUpdateUserJob`.

class BusinessUserAccountUpdateUserJob
  class << self
    sig do
      params(
        business: T.untyped,
        user_account_ids: T.untyped,
        block: T.nilable(T.proc.params(job: BusinessUserAccountUpdateUserJob).void)
      ).returns(T.any(BusinessUserAccountUpdateUserJob, FalseClass))
    end
    def perform_later(business, user_account_ids: T.unsafe(nil), &block); end

    sig { params(business: T.untyped, user_account_ids: T.untyped).returns(T.untyped) }
    def perform_now(business, user_account_ids: T.unsafe(nil)); end
  end
end
