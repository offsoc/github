# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SamlSessionRevokeJob`.
# Please instead update this file by running `bin/tapioca dsl SamlSessionRevokeJob`.

class SamlSessionRevokeJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: SamlSessionRevokeJob).void)
      ).returns(T.any(SamlSessionRevokeJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
