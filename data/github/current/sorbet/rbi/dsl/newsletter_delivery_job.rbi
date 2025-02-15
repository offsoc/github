# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `NewsletterDeliveryJob`.
# Please instead update this file by running `bin/tapioca dsl NewsletterDeliveryJob`.

class NewsletterDeliveryJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: NewsletterDeliveryJob).void)
      ).returns(T.any(NewsletterDeliveryJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
