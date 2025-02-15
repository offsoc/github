# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Copilot::SeatManagement::SeatAssignedJob`.
# Please instead update this file by running `bin/tapioca dsl Copilot::SeatManagement::SeatAssignedJob`.

class Copilot::SeatManagement::SeatAssignedJob
  class << self
    sig do
      params(
        organization_id: ::Integer,
        user_id: ::Integer,
        seat: T.nilable(::Copilot::Seat),
        block: T.nilable(T.proc.params(job: Copilot::SeatManagement::SeatAssignedJob).void)
      ).returns(T.any(Copilot::SeatManagement::SeatAssignedJob, FalseClass))
    end
    def perform_later(organization_id, user_id, seat: T.unsafe(nil), &block); end

    sig { params(organization_id: ::Integer, user_id: ::Integer, seat: T.nilable(::Copilot::Seat)).void }
    def perform_now(organization_id, user_id, seat: T.unsafe(nil)); end
  end
end
