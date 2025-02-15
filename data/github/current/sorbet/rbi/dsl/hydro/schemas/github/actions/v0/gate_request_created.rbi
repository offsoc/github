# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Actions::V0::GateRequestCreated`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Actions::V0::GateRequestCreated`.

class Hydro::Schemas::Github::Actions::V0::GateRequestCreated
  sig do
    params(
      check_run_id: T.nilable(Integer),
      check_suite_id: T.nilable(Integer),
      gate_id: T.nilable(Integer),
      gate_request_id: T.nilable(Integer),
      gate_type: T.nilable(T.any(Symbol, Integer)),
      integration: T.nilable(Hydro::Schemas::Github::V1::Entities::Integration),
      repository: T.nilable(Hydro::Schemas::Github::V2::Entities::Repository)
    ).void
  end
  def initialize(check_run_id: nil, check_suite_id: nil, gate_id: nil, gate_request_id: nil, gate_type: nil, integration: nil, repository: nil); end

  sig { returns(Integer) }
  def check_run_id; end

  sig { params(value: Integer).void }
  def check_run_id=(value); end

  sig { returns(Integer) }
  def check_suite_id; end

  sig { params(value: Integer).void }
  def check_suite_id=(value); end

  sig { void }
  def clear_check_run_id; end

  sig { void }
  def clear_check_suite_id; end

  sig { void }
  def clear_gate_id; end

  sig { void }
  def clear_gate_request_id; end

  sig { void }
  def clear_gate_type; end

  sig { void }
  def clear_integration; end

  sig { void }
  def clear_repository; end

  sig { returns(Integer) }
  def gate_id; end

  sig { params(value: Integer).void }
  def gate_id=(value); end

  sig { returns(Integer) }
  def gate_request_id; end

  sig { params(value: Integer).void }
  def gate_request_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def gate_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def gate_type=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Integration)) }
  def integration; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Integration)).void }
  def integration=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V2::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V2::Entities::Repository)).void }
  def repository=(value); end
end
