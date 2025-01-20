module Zuorest::Action
  def create_action(body, headers = {})
    post("/v1/action/create", body:, headers:)
  end

  def update_action(body, headers = {})
    post("/v1/action/update", body:, headers:)
  end

  def query_action(body, headers = {})
    post("/v1/action/query", body:, headers:)
  end
end
