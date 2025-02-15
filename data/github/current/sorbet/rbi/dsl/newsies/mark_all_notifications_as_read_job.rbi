# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Newsies::MarkAllNotificationsAsReadJob`.
# Please instead update this file by running `bin/tapioca dsl Newsies::MarkAllNotificationsAsReadJob`.

class Newsies::MarkAllNotificationsAsReadJob
  class << self
    sig do
      params(
        user_id: T.untyped,
        last_read_at: T.untyped,
        list_type: T.untyped,
        list_id: T.untyped,
        block: T.nilable(T.proc.params(job: Newsies::MarkAllNotificationsAsReadJob).void)
      ).returns(T.any(Newsies::MarkAllNotificationsAsReadJob, FalseClass))
    end
    def perform_later(user_id, last_read_at, list_type = T.unsafe(nil), list_id = T.unsafe(nil), &block); end

    sig do
      params(
        user_id: T.untyped,
        last_read_at: T.untyped,
        list_type: T.untyped,
        list_id: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(user_id, last_read_at, list_type = T.unsafe(nil), list_id = T.unsafe(nil)); end
  end
end
