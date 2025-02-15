# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ProjectV2ItemFieldValueConnection`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ProjectV2ItemFieldValueConnection`.

class Api::App::PlatformTypes::ProjectV2ItemFieldValueConnection < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(T::Array[Api::App::PlatformTypes::ProjectV2ItemFieldValueEdge])) }
  def edges; end

  sig { returns(T::Boolean) }
  def edges?; end

  sig do
    returns(T.nilable(T::Array[T.any(Api::App::PlatformTypes::ProjectV2ItemFieldTextValue, Api::App::PlatformTypes::ProjectV2ItemFieldNumberValue, Api::App::PlatformTypes::ProjectV2ItemFieldDateValue, Api::App::PlatformTypes::ProjectV2ItemFieldSingleSelectValue, Api::App::PlatformTypes::ProjectV2ItemFieldRepositoryValue, Api::App::PlatformTypes::ProjectV2ItemFieldUserValue, Api::App::PlatformTypes::ProjectV2ItemFieldLabelValue, Api::App::PlatformTypes::ProjectV2ItemFieldMilestoneValue, Api::App::PlatformTypes::ProjectV2ItemFieldPullRequestValue, Api::App::PlatformTypes::ProjectV2ItemFieldIterationValue, Api::App::PlatformTypes::ProjectV2ItemFieldReviewerValue)]))
  end
  def nodes; end

  sig { returns(T::Boolean) }
  def nodes?; end

  sig { returns(Api::App::PlatformTypes::PageInfo) }
  def page_info; end

  sig { returns(T::Boolean) }
  def page_info?; end

  sig { returns(Integer) }
  def total_count; end

  sig { returns(T::Boolean) }
  def total_count?; end
end
