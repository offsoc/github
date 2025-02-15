# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Copilot::V2::CopilotClickwrapSavedEvent`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Copilot::V2::CopilotClickwrapSavedEvent`.

class Hydro::Schemas::Github::Copilot::V2::CopilotClickwrapSavedEvent
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      business: T.nilable(Hydro::Schemas::Github::V1::Entities::Business),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)
    ).void
  end
  def initialize(actor: nil, business: nil, request_context: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Business)) }
  def business; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Business)).void }
  def business=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_business; end

  sig { void }
  def clear_request_context; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end
end
