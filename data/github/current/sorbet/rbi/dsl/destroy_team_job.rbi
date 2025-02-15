# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DestroyTeamJob`.
# Please instead update this file by running `bin/tapioca dsl DestroyTeamJob`.

class DestroyTeamJob
  class << self
    sig do
      params(
        team_id: T.untyped,
        block: T.nilable(T.proc.params(job: DestroyTeamJob).void)
      ).returns(T.any(DestroyTeamJob, FalseClass))
    end
    def perform_later(team_id, &block); end

    sig { params(team_id: T.untyped).returns(T.untyped) }
    def perform_now(team_id); end
  end
end
