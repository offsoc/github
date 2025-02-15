# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Copilot::FreeUserProcessorJob`.
# Please instead update this file by running `bin/tapioca dsl Copilot::FreeUserProcessorJob`.

class Copilot::FreeUserProcessorJob
  class << self
    sig do
      params(
        copilot_free_user_id: ::Integer,
        block: T.nilable(T.proc.params(job: Copilot::FreeUserProcessorJob).void)
      ).returns(T.any(Copilot::FreeUserProcessorJob, FalseClass))
    end
    def perform_later(copilot_free_user_id, &block); end

    sig { params(copilot_free_user_id: ::Integer).void }
    def perform_now(copilot_free_user_id); end
  end
end
