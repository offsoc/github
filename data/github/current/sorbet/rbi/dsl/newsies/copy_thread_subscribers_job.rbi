# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Newsies::CopyThreadSubscribersJob`.
# Please instead update this file by running `bin/tapioca dsl Newsies::CopyThreadSubscribersJob`.

class Newsies::CopyThreadSubscribersJob
  class << self
    sig do
      params(
        list_type: ::String,
        list_id: ::Integer,
        thread_type: ::String,
        thread_id: ::Integer,
        subscribers_info: T::Array[{user_id: T.any(::Integer, ::String), reason: T.any(::String, ::Symbol, T::Hash[T.untyped, T.untyped]), ignored: T.nilable(T::Boolean)}],
        block: T.nilable(T.proc.params(job: Newsies::CopyThreadSubscribersJob).void)
      ).returns(T.any(Newsies::CopyThreadSubscribersJob, FalseClass))
    end
    def perform_later(list_type, list_id, thread_type, thread_id, subscribers_info, &block); end

    sig do
      params(
        list_type: ::String,
        list_id: ::Integer,
        thread_type: ::String,
        thread_id: ::Integer,
        subscribers_info: T::Array[{user_id: T.any(::Integer, ::String), reason: T.any(::String, ::Symbol, T::Hash[T.untyped, T.untyped]), ignored: T.nilable(T::Boolean)}]
      ).void
    end
    def perform_now(list_type, list_id, thread_type, thread_id, subscribers_info); end
  end
end
