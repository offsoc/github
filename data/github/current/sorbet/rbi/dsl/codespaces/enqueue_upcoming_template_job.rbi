# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Codespaces::EnqueueUpcomingTemplateJob`.
# Please instead update this file by running `bin/tapioca dsl Codespaces::EnqueueUpcomingTemplateJob`.

class Codespaces::EnqueueUpcomingTemplateJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: Codespaces::EnqueueUpcomingTemplateJob).void)
      ).returns(T.any(Codespaces::EnqueueUpcomingTemplateJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
