module Zuorest::ProductRatePlan
  def get_product_rate_plan(id, headers = {})
    Utils.validate_id(id)
    get("/v1/rateplan/#{id}/productRatePlan", headers:)
  end

  def create_product_rate_plan(body, headers = {})
    post("/v1/object/product-rate-plan", body:, headers:)
  end

  def update_product_rate_plan(id, body, headers = {})
    Utils.validate_id(id)
    put("/v1/object/product-rate-plan/#{id}", body:, headers:)
  end
end
