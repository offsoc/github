# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SearchEngineIndexing::EnqueueUsersForIndexingJob`.
# Please instead update this file by running `bin/tapioca dsl SearchEngineIndexing::EnqueueUsersForIndexingJob`.

class SearchEngineIndexing::EnqueueUsersForIndexingJob
  class << self
    sig do
      params(
        _arg0: T.untyped,
        _arg1: T.untyped,
        block: T.nilable(T.proc.params(job: SearchEngineIndexing::EnqueueUsersForIndexingJob).void)
      ).returns(T.any(SearchEngineIndexing::EnqueueUsersForIndexingJob, FalseClass))
    end
    def perform_later(*_arg0, **_arg1, &block); end

    sig { params(_arg0: T.untyped, _arg1: T.untyped).returns(T.untyped) }
    def perform_now(*_arg0, **_arg1); end
  end
end
