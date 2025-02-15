# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DeliverRepositoryPushNotificationJob`.
# Please instead update this file by running `bin/tapioca dsl DeliverRepositoryPushNotificationJob`.

class DeliverRepositoryPushNotificationJob
  class << self
    sig do
      params(
        payload: T.untyped,
        block: T.nilable(T.proc.params(job: DeliverRepositoryPushNotificationJob).void)
      ).returns(T.any(DeliverRepositoryPushNotificationJob, FalseClass))
    end
    def perform_later(payload, &block); end

    sig { params(payload: T.untyped).returns(T.untyped) }
    def perform_now(payload); end
  end
end
