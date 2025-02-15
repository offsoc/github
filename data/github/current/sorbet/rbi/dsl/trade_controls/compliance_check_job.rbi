# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `TradeControls::ComplianceCheckJob`.
# Please instead update this file by running `bin/tapioca dsl TradeControls::ComplianceCheckJob`.

class TradeControls::ComplianceCheckJob
  class << self
    sig do
      params(
        user_id: ::Integer,
        ip: T.nilable(::String),
        email: T.nilable(::String),
        location: T.nilable(T::Hash[::Symbol, ::String]),
        event_source: T.nilable(::String),
        block: T.nilable(T.proc.params(job: TradeControls::ComplianceCheckJob).void)
      ).returns(T.any(TradeControls::ComplianceCheckJob, FalseClass))
    end
    def perform_later(user_id, ip: T.unsafe(nil), email: T.unsafe(nil), location: T.unsafe(nil), event_source: T.unsafe(nil), &block); end

    sig do
      params(
        user_id: ::Integer,
        ip: T.nilable(::String),
        email: T.nilable(::String),
        location: T.nilable(T::Hash[::Symbol, ::String]),
        event_source: T.nilable(::String)
      ).void
    end
    def perform_now(user_id, ip: T.unsafe(nil), email: T.unsafe(nil), location: T.unsafe(nil), event_source: T.unsafe(nil)); end
  end
end
