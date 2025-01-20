require "zuorest/utils"

module Zuorest::PaymentMethodSnapshot
  include Utils
  def get_payment_method_snapshot(id, headers = {})
    Utils.validate_id(id)
    get("/v1/object/payment-method-snapshot/#{id}", headers:)
  end
end
