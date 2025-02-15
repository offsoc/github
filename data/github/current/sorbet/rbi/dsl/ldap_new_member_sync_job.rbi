# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `LdapNewMemberSyncJob`.
# Please instead update this file by running `bin/tapioca dsl LdapNewMemberSyncJob`.

class LdapNewMemberSyncJob
  class << self
    sig do
      params(
        user_id: T.untyped,
        block: T.nilable(T.proc.params(job: LdapNewMemberSyncJob).void)
      ).returns(T.any(LdapNewMemberSyncJob, FalseClass))
    end
    def perform_later(user_id, &block); end

    sig { params(user_id: T.untyped).returns(T.untyped) }
    def perform_now(user_id); end
  end
end
