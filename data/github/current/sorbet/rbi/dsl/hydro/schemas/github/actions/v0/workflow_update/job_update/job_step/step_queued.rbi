# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::JobUpdate::JobStep::StepQueued`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::JobUpdate::JobStep::StepQueued`.

class Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::JobUpdate::JobStep::StepQueued
  sig { params(unused_field: T.nilable(T::Boolean)).void }
  def initialize(unused_field: nil); end

  sig { void }
  def clear_unused_field; end

  sig { returns(T::Boolean) }
  def unused_field; end

  sig { params(value: T::Boolean).void }
  def unused_field=(value); end
end
