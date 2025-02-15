# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `RestoreSoftDeletedPagesJob`.
# Please instead update this file by running `bin/tapioca dsl RestoreSoftDeletedPagesJob`.

class RestoreSoftDeletedPagesJob
  class << self
    sig do
      params(
        organization: T.untyped,
        block: T.nilable(T.proc.params(job: RestoreSoftDeletedPagesJob).void)
      ).returns(T.any(RestoreSoftDeletedPagesJob, FalseClass))
    end
    def perform_later(organization, &block); end

    sig { params(organization: T.untyped).returns(T.untyped) }
    def perform_now(organization); end
  end
end
