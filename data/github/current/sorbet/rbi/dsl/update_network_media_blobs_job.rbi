# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `UpdateNetworkMediaBlobsJob`.
# Please instead update this file by running `bin/tapioca dsl UpdateNetworkMediaBlobsJob`.

class UpdateNetworkMediaBlobsJob
  class << self
    sig do
      params(
        options: T.untyped,
        block: T.nilable(T.proc.params(job: UpdateNetworkMediaBlobsJob).void)
      ).returns(T.any(UpdateNetworkMediaBlobsJob, FalseClass))
    end
    def perform_later(options, &block); end

    sig { params(options: T.untyped).returns(T.untyped) }
    def perform_now(options); end
  end
end
