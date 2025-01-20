require "zuorest/utils"

module Zuorest::Refund
  include Utils
  def get_refund(id, headers = {})
    Utils.validate_id(id)
    get("/v1/object/refund/#{id}", headers:)
  end

  def create_refund(body, headers = {})
    post("/v1/object/refund", body:, headers:)
  end
end
