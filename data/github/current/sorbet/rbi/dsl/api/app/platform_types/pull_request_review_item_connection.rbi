# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PullRequestReviewItemConnection`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PullRequestReviewItemConnection`.

class Api::App::PlatformTypes::PullRequestReviewItemConnection < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Integer) }
  def after_focus_count; end

  sig { returns(T::Boolean) }
  def after_focus_count?; end

  sig { returns(Integer) }
  def before_focus_count; end

  sig { returns(T::Boolean) }
  def before_focus_count?; end

  sig { returns(T.nilable(T::Array[Api::App::PlatformTypes::PullRequestReviewItemEdge])) }
  def edges; end

  sig { returns(T::Boolean) }
  def edges?; end

  sig { returns(Integer) }
  def filtered_count; end

  sig { returns(T::Boolean) }
  def filtered_count?; end

  sig do
    returns(T.nilable(T::Array[T.any(Api::App::PlatformTypes::PullRequestReviewThread, Api::App::PlatformTypes::PullRequestReviewComment)]))
  end
  def nodes; end

  sig { returns(T::Boolean) }
  def nodes?; end

  sig { returns(Integer) }
  def page_count; end

  sig { returns(T::Boolean) }
  def page_count?; end

  sig { returns(Api::App::PlatformTypes::PageInfo) }
  def page_info; end

  sig { returns(T::Boolean) }
  def page_info?; end

  sig { returns(Integer) }
  def total_count; end

  sig { returns(T::Boolean) }
  def total_count?; end
end
