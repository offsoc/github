class ConfigApplyException < StandardError
  attr_reader :exit_status

  def initialize(msg, exit_status:)
    @exit_status = exit_status.to_i
    super(msg)
  end
end
