# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `LegacyRemoveOrgMemberDataJob`.
# Please instead update this file by running `bin/tapioca dsl LegacyRemoveOrgMemberDataJob`.

class LegacyRemoveOrgMemberDataJob
  class << self
    sig do
      params(
        options: T.untyped,
        block: T.nilable(T.proc.params(job: LegacyRemoveOrgMemberDataJob).void)
      ).returns(T.any(LegacyRemoveOrgMemberDataJob, FalseClass))
    end
    def perform_later(options, &block); end

    sig { params(options: T.untyped).returns(T.untyped) }
    def perform_now(options); end
  end
end
