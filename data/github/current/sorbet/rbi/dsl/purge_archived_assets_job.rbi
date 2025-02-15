# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PurgeArchivedAssetsJob`.
# Please instead update this file by running `bin/tapioca dsl PurgeArchivedAssetsJob`.

class PurgeArchivedAssetsJob
  class << self
    sig do
      params(
        num_in_sequence: ::Integer,
        kwargs: T.untyped,
        block: T.nilable(T.proc.params(job: PurgeArchivedAssetsJob).void)
      ).returns(T.any(PurgeArchivedAssetsJob, FalseClass))
    end
    def perform_later(num_in_sequence: T.unsafe(nil), **kwargs, &block); end

    sig { params(num_in_sequence: ::Integer, kwargs: T.untyped).void }
    def perform_now(num_in_sequence: T.unsafe(nil), **kwargs); end
  end
end
