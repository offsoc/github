module Zuorest::CreditBalanceAdjustment
  include Utils

  def create_credit_balance_adjustment(body, headers = {})
    post("/v1/object/credit-balance-adjustment", body:, headers:)
  end

  def get_credit_balance_adjustment(id, headers = {})
    Utils.validate_id(id)
    get("/v1/object/credit-balance-adjustment/#{id}", headers:)
  end
end
