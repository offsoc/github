# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::ProjectNextIterationFieldConfiguration`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::ProjectNextIterationFieldConfiguration`.

class Api::App::PlatformTypes::ProjectNextIterationFieldConfiguration < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Array[Api::App::PlatformTypes::ProjectNextIterationFieldIteration]) }
  def completed_iterations; end

  sig { returns(T::Boolean) }
  def completed_iterations?; end

  sig { returns(Integer) }
  def duration; end

  sig { returns(T::Boolean) }
  def duration?; end

  sig { returns(T::Array[Api::App::PlatformTypes::ProjectNextIterationFieldIteration]) }
  def iterations; end

  sig { returns(T::Boolean) }
  def iterations?; end

  sig { returns(Integer) }
  def start_day; end

  sig { returns(T::Boolean) }
  def start_day?; end
end
