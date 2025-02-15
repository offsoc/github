# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::RefUpdateRule`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::RefUpdateRule`.

class Api::App::PlatformTypes::RefUpdateRule < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Boolean) }
  def allows_deletions; end

  sig { returns(T::Boolean) }
  def allows_deletions?; end

  sig { returns(T::Boolean) }
  def allows_force_pushes; end

  sig { returns(T::Boolean) }
  def allows_force_pushes?; end

  sig { returns(T::Boolean) }
  def blocks_creations; end

  sig { returns(T::Boolean) }
  def blocks_creations?; end

  sig { returns(String) }
  def pattern; end

  sig { returns(T::Boolean) }
  def pattern?; end

  sig { returns(T.nilable(Integer)) }
  def recommended_approving_review_count; end

  sig { returns(T::Boolean) }
  def recommended_approving_review_count?; end

  sig { returns(T.nilable(Integer)) }
  def required_approving_review_count; end

  sig { returns(T::Boolean) }
  def required_approving_review_count?; end

  sig { returns(T.nilable(T::Array[String])) }
  def required_status_check_contexts; end

  sig { returns(T::Boolean) }
  def required_status_check_contexts?; end

  sig { returns(T::Boolean) }
  def requires_code_owner_reviews; end

  sig { returns(T::Boolean) }
  def requires_code_owner_reviews?; end

  sig { returns(T::Boolean) }
  def requires_conversation_resolution; end

  sig { returns(T::Boolean) }
  def requires_conversation_resolution?; end

  sig { returns(T::Boolean) }
  def requires_linear_history; end

  sig { returns(T::Boolean) }
  def requires_linear_history?; end

  sig { returns(T::Boolean) }
  def requires_signatures; end

  sig { returns(T::Boolean) }
  def requires_signatures?; end

  sig { returns(T::Boolean) }
  def viewer_allowed_to_dismiss_reviews; end

  sig { returns(T::Boolean) }
  def viewer_allowed_to_dismiss_reviews?; end

  sig { returns(T::Boolean) }
  def viewer_can_push; end

  sig { returns(T::Boolean) }
  def viewer_can_push?; end
end
