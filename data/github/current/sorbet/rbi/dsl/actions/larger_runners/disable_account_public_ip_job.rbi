# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Actions::LargerRunners::DisableAccountPublicIpJob`.
# Please instead update this file by running `bin/tapioca dsl Actions::LargerRunners::DisableAccountPublicIpJob`.

class Actions::LargerRunners::DisableAccountPublicIpJob
  class << self
    sig do
      params(
        account: T.any(::Business, ::Organization),
        block: T.nilable(T.proc.params(job: Actions::LargerRunners::DisableAccountPublicIpJob).void)
      ).returns(T.any(Actions::LargerRunners::DisableAccountPublicIpJob, FalseClass))
    end
    def perform_later(account, &block); end

    sig { params(account: T.any(::Business, ::Organization)).void }
    def perform_now(account); end
  end
end
