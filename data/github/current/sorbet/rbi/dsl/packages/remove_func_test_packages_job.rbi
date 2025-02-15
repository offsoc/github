# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Packages::RemoveFuncTestPackagesJob`.
# Please instead update this file by running `bin/tapioca dsl Packages::RemoveFuncTestPackagesJob`.

class Packages::RemoveFuncTestPackagesJob
  class << self
    sig do
      params(
        batch_size: T.untyped,
        duration: T.untyped,
        offset: T.untyped,
        block: T.nilable(T.proc.params(job: Packages::RemoveFuncTestPackagesJob).void)
      ).returns(T.any(Packages::RemoveFuncTestPackagesJob, FalseClass))
    end
    def perform_later(batch_size: T.unsafe(nil), duration: T.unsafe(nil), offset: T.unsafe(nil), &block); end

    sig { params(batch_size: T.untyped, duration: T.untyped, offset: T.untyped).returns(T.untyped) }
    def perform_now(batch_size: T.unsafe(nil), duration: T.unsafe(nil), offset: T.unsafe(nil)); end
  end
end
