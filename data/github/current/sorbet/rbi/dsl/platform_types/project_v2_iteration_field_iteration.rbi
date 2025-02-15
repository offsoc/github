# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ProjectV2IterationFieldIteration`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ProjectV2IterationFieldIteration`.

class PlatformTypes::ProjectV2IterationFieldIteration < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Integer) }
  def duration; end

  sig { returns(T::Boolean) }
  def duration?; end

  sig { returns(String) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def start_date; end

  sig { returns(T::Boolean) }
  def start_date?; end

  sig { returns(String) }
  def title; end

  sig { returns(T::Boolean) }
  def title?; end

  sig { returns(String) }
  def title_html; end

  sig { returns(T::Boolean) }
  def title_html?; end
end
