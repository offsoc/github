# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `ExportSponsorshipsJob`.
# Please instead update this file by running `bin/tapioca dsl ExportSponsorshipsJob`.

class ExportSponsorshipsJob
  class << self
    sig do
      params(
        sponsorable: T.any(::Organization, ::User),
        year: T.nilable(T.any(::Integer, ::String)),
        month: T.nilable(T.any(::String, ::Symbol)),
        format: T.any(::String, ::Symbol),
        timeframe: T.nilable(::String),
        actor: T.nilable(::User),
        block: T.nilable(T.proc.params(job: ExportSponsorshipsJob).void)
      ).returns(T.any(ExportSponsorshipsJob, FalseClass))
    end
    def perform_later(sponsorable, year:, month:, format:, timeframe:, actor:, &block); end

    sig do
      params(
        sponsorable: T.any(::Organization, ::User),
        year: T.nilable(T.any(::Integer, ::String)),
        month: T.nilable(T.any(::String, ::Symbol)),
        format: T.any(::String, ::Symbol),
        timeframe: T.nilable(::String),
        actor: T.nilable(::User)
      ).void
    end
    def perform_now(sponsorable, year:, month:, format:, timeframe:, actor:); end
  end
end
