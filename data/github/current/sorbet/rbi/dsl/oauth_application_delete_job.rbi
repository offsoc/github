# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `OauthApplicationDeleteJob`.
# Please instead update this file by running `bin/tapioca dsl OauthApplicationDeleteJob`.

class OauthApplicationDeleteJob
  class << self
    sig do
      params(
        oauth_application_id: ::Integer,
        block: T.nilable(T.proc.params(job: OauthApplicationDeleteJob).void)
      ).returns(T.any(OauthApplicationDeleteJob, FalseClass))
    end
    def perform_later(oauth_application_id, &block); end

    sig { params(oauth_application_id: ::Integer).void }
    def perform_now(oauth_application_id); end
  end
end
