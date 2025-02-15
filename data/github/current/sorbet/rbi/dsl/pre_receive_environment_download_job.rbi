# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PreReceiveEnvironmentDownloadJob`.
# Please instead update this file by running `bin/tapioca dsl PreReceiveEnvironmentDownloadJob`.

class PreReceiveEnvironmentDownloadJob
  class << self
    sig do
      params(
        env_id: T.untyped,
        block: T.nilable(T.proc.params(job: PreReceiveEnvironmentDownloadJob).void)
      ).returns(T.any(PreReceiveEnvironmentDownloadJob, FalseClass))
    end
    def perform_later(env_id, &block); end

    sig { params(env_id: T.untyped).returns(T.untyped) }
    def perform_now(env_id); end
  end
end
