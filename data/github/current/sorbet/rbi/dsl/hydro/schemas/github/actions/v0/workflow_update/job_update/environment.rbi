# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::JobUpdate::Environment`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::JobUpdate::Environment`.

class Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::JobUpdate::Environment
  sig { params(name: T.nilable(String), url: T.nilable(String)).void }
  def initialize(name: nil, url: nil); end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_url; end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(String) }
  def url; end

  sig { params(value: String).void }
  def url=(value); end
end
