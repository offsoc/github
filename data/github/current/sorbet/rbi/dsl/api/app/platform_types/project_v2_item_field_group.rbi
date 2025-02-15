# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ProjectV2ItemFieldGroup`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ProjectV2ItemFieldGroup`.

class Api::App::PlatformTypes::ProjectV2ItemFieldGroup < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Api::App::PlatformTypes::ProjectV2Field)) }
  def field; end

  sig { returns(T::Boolean) }
  def field?; end

  sig do
    returns(T.nilable(T.any(Api::App::PlatformTypes::ProjectV2Field, Api::App::PlatformTypes::ProjectV2SingleSelectField, Api::App::PlatformTypes::ProjectV2IterationField)))
  end
  def group_by_field; end

  sig { returns(T::Boolean) }
  def group_by_field?; end

  sig { returns(T.nilable(String)) }
  def title; end

  sig { returns(T::Boolean) }
  def title?; end

  sig do
    returns(T.nilable(T.any(Api::App::PlatformTypes::ProjectV2GroupAssigneeValue, Api::App::PlatformTypes::ProjectV2GroupDateValue, Api::App::PlatformTypes::ProjectV2GroupIssueTypeValue, Api::App::PlatformTypes::ProjectV2GroupIterationValue, Api::App::PlatformTypes::ProjectV2GroupMilestoneValue, Api::App::PlatformTypes::ProjectV2GroupNumberValue, Api::App::PlatformTypes::ProjectV2GroupRepositoryValue, Api::App::PlatformTypes::ProjectV2GroupSingleSelectValue, Api::App::PlatformTypes::ProjectV2GroupTextValue)))
  end
  def value; end

  sig { returns(T::Boolean) }
  def value?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::ProjectV2View)) }
  def view; end

  sig { returns(T::Boolean) }
  def view?; end
end
