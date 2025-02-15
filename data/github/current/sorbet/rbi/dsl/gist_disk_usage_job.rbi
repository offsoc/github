# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GistDiskUsageJob`.
# Please instead update this file by running `bin/tapioca dsl GistDiskUsageJob`.

class GistDiskUsageJob
  class << self
    sig do
      params(
        gist_id: T.untyped,
        block: T.nilable(T.proc.params(job: GistDiskUsageJob).void)
      ).returns(T.any(GistDiskUsageJob, FalseClass))
    end
    def perform_later(gist_id, &block); end

    sig { params(gist_id: T.untyped).returns(T.untyped) }
    def perform_now(gist_id); end
  end
end
