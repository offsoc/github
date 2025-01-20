require "json"

class Zuorest::HttpError < Zuorest::Error
  attr_reader :status_code, :headers

  def initialize(status_code, body, headers = {})
    message = build_message(status_code, body)
    super(message)
    @status_code = status_code
    @headers = headers
    @body = body
  end

  def data
    @body
  end

  private

  def build_message(status_code, body)
    message = "HTTP #{status_code}"
    return message unless body.present?
    return message unless body.is_a?(Hash)

    body_hash = body.with_indifferent_access
    if body_hash.key?("Errors")
      body_hash["Errors"].each { |error| message << " #{error["Code"]} - #{error["Message"]}" }
    elsif body_hash.key?("reasons")
      body_hash["reasons"].each { |reason| message << " #{reason["code"]} - #{reason["message"]}" }
    end
    message
  end
end
