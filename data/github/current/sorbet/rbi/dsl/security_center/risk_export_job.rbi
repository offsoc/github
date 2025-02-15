# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `SecurityCenter::RiskExportJob`.
# Please instead update this file by running `bin/tapioca dsl SecurityCenter::RiskExportJob`.

class SecurityCenter::RiskExportJob
  class << self
    sig do
      params(
        scope: T.any(::Business, ::Organization),
        user: ::User,
        query_string: ::String,
        requested_at: ::Time,
        user_session: T.nilable(::UserSession),
        block: T.nilable(T.proc.params(job: SecurityCenter::RiskExportJob).void)
      ).returns(T.any(SecurityCenter::RiskExportJob, FalseClass))
    end
    def perform_later(scope:, user:, query_string:, requested_at:, user_session: T.unsafe(nil), &block); end

    sig do
      params(
        scope: T.any(::Business, ::Organization),
        user: ::User,
        query_string: ::String,
        requested_at: ::Time,
        user_session: T.nilable(::UserSession)
      ).void
    end
    def perform_now(scope:, user:, query_string:, requested_at:, user_session: T.unsafe(nil)); end
  end
end
