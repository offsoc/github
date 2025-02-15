# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Newsies::MarkAllNotificationsFromQueryJob`.
# Please instead update this file by running `bin/tapioca dsl Newsies::MarkAllNotificationsFromQueryJob`.

class Newsies::MarkAllNotificationsFromQueryJob
  class << self
    sig do
      params(
        user_id: T.untyped,
        state: T.untyped,
        filter_options: T.untyped,
        offset_id: T.untyped,
        start_time: T.untyped,
        block: T.nilable(T.proc.params(job: Newsies::MarkAllNotificationsFromQueryJob).void)
      ).returns(T.any(Newsies::MarkAllNotificationsFromQueryJob, FalseClass))
    end
    def perform_later(user_id, state, filter_options = T.unsafe(nil), offset_id = T.unsafe(nil), start_time = T.unsafe(nil), &block); end

    sig do
      params(
        user_id: T.untyped,
        state: T.untyped,
        filter_options: T.untyped,
        offset_id: T.untyped,
        start_time: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(user_id, state, filter_options = T.unsafe(nil), offset_id = T.unsafe(nil), start_time = T.unsafe(nil)); end
  end
end
