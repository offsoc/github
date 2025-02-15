# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `UninstallIntegrationInstallationJob`.
# Please instead update this file by running `bin/tapioca dsl UninstallIntegrationInstallationJob`.

class UninstallIntegrationInstallationJob
  class << self
    sig do
      params(
        actor_id: T.untyped,
        installation_id: T.untyped,
        staff_actor: T.untyped,
        block: T.nilable(T.proc.params(job: UninstallIntegrationInstallationJob).void)
      ).returns(T.any(UninstallIntegrationInstallationJob, FalseClass))
    end
    def perform_later(actor_id, installation_id, staff_actor: T.unsafe(nil), &block); end

    sig { params(actor_id: T.untyped, installation_id: T.untyped, staff_actor: T.untyped).returns(T.untyped) }
    def perform_now(actor_id, installation_id, staff_actor: T.unsafe(nil)); end
  end
end
