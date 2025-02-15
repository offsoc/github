# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `TradeControls::UserHighRiskGeoJob`.
# Please instead update this file by running `bin/tapioca dsl TradeControls::UserHighRiskGeoJob`.

class TradeControls::UserHighRiskGeoJob
  class << self
    sig do
      params(
        user: ::User,
        location: T.nilable(T::Hash[::Symbol, ::String]),
        email: T.nilable(::String),
        block: T.nilable(T.proc.params(job: TradeControls::UserHighRiskGeoJob).void)
      ).returns(T.any(TradeControls::UserHighRiskGeoJob, FalseClass))
    end
    def perform_later(user, location: T.unsafe(nil), email: T.unsafe(nil), &block); end

    sig { params(user: ::User, location: T.nilable(T::Hash[::Symbol, ::String]), email: T.nilable(::String)).void }
    def perform_now(user, location: T.unsafe(nil), email: T.unsafe(nil)); end
  end
end
