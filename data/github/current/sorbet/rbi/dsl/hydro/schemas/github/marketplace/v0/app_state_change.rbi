# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Marketplace::V0::AppStateChange`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Marketplace::V0::AppStateChange`.

class Hydro::Schemas::Github::Marketplace::V0::AppStateChange
  sig do
    params(
      app: T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::App),
      previous_state: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(app: nil, previous_state: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::App)) }
  def app; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Marketplace::V0::Entities::App)).void }
  def app=(value); end

  sig { void }
  def clear_app; end

  sig { void }
  def clear_previous_state; end

  sig { returns(T.any(Symbol, Integer)) }
  def previous_state; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def previous_state=(value); end
end
