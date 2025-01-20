class Zuorest::UnsuccessfulResponseError < Zuorest::Error
  attr_reader :reasons

  def initialize(reasons)
    super()
    @reasons = Array.wrap(reasons)
  end

  def message
    "Unsuccessful Zuora response (#{formatted_reasons})"
  end

  private

  def formatted_reasons
    reasons.map do |reason|
      "#{reason["message"]} (#{reason["code"]})"
    end.join(", ")
  end
end
