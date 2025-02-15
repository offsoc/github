# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DestroyBusinessJob`.
# Please instead update this file by running `bin/tapioca dsl DestroyBusinessJob`.

class DestroyBusinessJob
  class << self
    sig do
      params(
        business_id: ::Integer,
        actor: T.nilable(::User),
        block: T.nilable(T.proc.params(job: DestroyBusinessJob).void)
      ).returns(T.any(DestroyBusinessJob, FalseClass))
    end
    def perform_later(business_id, actor: T.unsafe(nil), &block); end

    sig { params(business_id: ::Integer, actor: T.nilable(::User)).void }
    def perform_now(business_id, actor: T.unsafe(nil)); end
  end
end
