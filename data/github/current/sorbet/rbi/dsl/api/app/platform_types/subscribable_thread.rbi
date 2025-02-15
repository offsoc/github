# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::SubscribableThread`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::SubscribableThread`.

class Api::App::PlatformTypes::SubscribableThread < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T.nilable(String)) }
  def viewer_thread_subscription_form_action; end

  sig { returns(T::Boolean) }
  def viewer_thread_subscription_form_action?; end

  sig { returns(T.nilable(String)) }
  def viewer_thread_subscription_status; end

  sig { returns(T::Boolean) }
  def viewer_thread_subscription_status?; end
end
