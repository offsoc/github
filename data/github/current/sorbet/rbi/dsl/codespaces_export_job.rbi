# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `CodespacesExportJob`.
# Please instead update this file by running `bin/tapioca dsl CodespacesExportJob`.

class CodespacesExportJob
  class << self
    sig do
      params(
        codespace: T.untyped,
        encrypted_token: T.untyped,
        key_version: T.untyped,
        actor: T.untyped,
        new_repository_origin: T.untyped,
        block: T.nilable(T.proc.params(job: CodespacesExportJob).void)
      ).returns(T.any(CodespacesExportJob, FalseClass))
    end
    def perform_later(codespace:, encrypted_token:, key_version: T.unsafe(nil), actor: T.unsafe(nil), new_repository_origin: T.unsafe(nil), &block); end

    sig do
      params(
        codespace: T.untyped,
        encrypted_token: T.untyped,
        key_version: T.untyped,
        actor: T.untyped,
        new_repository_origin: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(codespace:, encrypted_token:, key_version: T.unsafe(nil), actor: T.unsafe(nil), new_repository_origin: T.unsafe(nil)); end
  end
end
