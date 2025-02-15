# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::ProjectColumn`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::ProjectColumn`.

class Hydro::Schemas::Github::V1::Entities::ProjectColumn
  sig { params(id: T.nilable(Integer), name: T.nilable(String)).void }
  def initialize(id: nil, name: nil); end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_name; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end
end
