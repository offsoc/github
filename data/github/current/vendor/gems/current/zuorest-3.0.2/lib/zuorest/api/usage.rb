module Zuorest::Usage

  def get_usage_status(id, headers = {})
    Utils.validate_id(id)
    get("/v1/usage/#{id}/status", headers:)
  end

  def create_usage(body, headers = {})
    post("/v1/usage", body:, headers:)
  end
end
