require "zuorest/utils"

module Zuorest::PaymentMethod
  include Utils
  def get_payment_method(id, headers = {})
    Utils.validate_id(id)
    get("/v1/object/payment-method/#{id}", headers:)
  end

  def update_payment_method(id, body, headers = {})
    Utils.validate_id(id)
    put("/v1/object/payment-method/#{id}", body:, headers:)
  end

  def create_payment_method(body, headers = {})
    post("/v1/object/payment-method", body:, headers:)
  end
end
