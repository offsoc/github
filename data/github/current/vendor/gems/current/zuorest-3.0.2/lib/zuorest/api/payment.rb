require "zuorest/utils"

module Zuorest::Payment
  include Utils
  def update_payment(id, body, headers = {})
    Utils.validate_id(id)
    put("/v1/object/payment/#{id}", body:, headers:)
  end

  def create_payment(body, headers = {})
    post("/v1/object/payment", body:, headers:)
  end

  def create_authorization(id, body, headers = {})
    Utils.validate_id(id)
    post("/v1/payment-methods/#{id}/authorize", body:, headers:)
  end

  def cancel_authorization(id, body, headers = {})
    Utils.validate_id(id)
    post("/v1/payment-methods/#{id}/voidAuthorize", body:, headers:)
  end

  def get_payments(account_id, params = {}, headers = {})
    Utils.validate_id(account_id)
    get("/v1/transactions/payments/accounts/#{account_id}", params:, headers:)
  end
end
