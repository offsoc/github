# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PageCertificateRemoveDuplicateJob`.
# Please instead update this file by running `bin/tapioca dsl PageCertificateRemoveDuplicateJob`.

class PageCertificateRemoveDuplicateJob
  class << self
    sig do
      params(
        batch_size: T.untyped,
        block: T.nilable(T.proc.params(job: PageCertificateRemoveDuplicateJob).void)
      ).returns(T.any(PageCertificateRemoveDuplicateJob, FalseClass))
    end
    def perform_later(batch_size = T.unsafe(nil), &block); end

    sig { params(batch_size: T.untyped).returns(T.untyped) }
    def perform_now(batch_size = T.unsafe(nil)); end
  end
end
