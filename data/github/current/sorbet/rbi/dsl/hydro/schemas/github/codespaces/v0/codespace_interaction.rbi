# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Codespaces::V0::CodespaceInteraction`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Codespaces::V0::CodespaceInteraction`.

class Hydro::Schemas::Github::Codespaces::V0::CodespaceInteraction
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      attempted_from_prebuild: T.nilable(T::Boolean),
      client: T.nilable(String),
      client_usage: T.nilable(Hydro::Schemas::Github::Codespaces::V0::Entities::ClientUsage),
      codespace: T.nilable(Hydro::Schemas::Github::Codespaces::V0::Entities::Codespace),
      forked_from_onboarding_repo: T.nilable(T::Boolean),
      source: T.nilable(String),
      type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(actor: nil, attempted_from_prebuild: nil, client: nil, client_usage: nil, codespace: nil, forked_from_onboarding_repo: nil, source: nil, type: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { returns(T::Boolean) }
  def attempted_from_prebuild; end

  sig { params(value: T::Boolean).void }
  def attempted_from_prebuild=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_attempted_from_prebuild; end

  sig { void }
  def clear_client; end

  sig { void }
  def clear_client_usage; end

  sig { void }
  def clear_codespace; end

  sig { void }
  def clear_forked_from_onboarding_repo; end

  sig { void }
  def clear_source; end

  sig { void }
  def clear_type; end

  sig { returns(String) }
  def client; end

  sig { params(value: String).void }
  def client=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Codespaces::V0::Entities::ClientUsage)) }
  def client_usage; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Codespaces::V0::Entities::ClientUsage)).void }
  def client_usage=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Codespaces::V0::Entities::Codespace)) }
  def codespace; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Codespaces::V0::Entities::Codespace)).void }
  def codespace=(value); end

  sig { returns(T::Boolean) }
  def forked_from_onboarding_repo; end

  sig { params(value: T::Boolean).void }
  def forked_from_onboarding_repo=(value); end

  sig { returns(String) }
  def source; end

  sig { params(value: String).void }
  def source=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def type=(value); end
end
