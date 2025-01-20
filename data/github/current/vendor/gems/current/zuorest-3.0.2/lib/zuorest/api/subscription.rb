require "zuorest/utils"

module Zuorest::Subscription
  include Utils
  def get_subscription(key, headers = {})
    Utils.validate_key(key)
    get("/v1/subscriptions/#{key}", headers:)
  end

  def update_subscription(key, body, headers = {})
    Utils.validate_key(key)
    put("/v1/subscriptions/#{key}", body:, headers:)
  end

  def cancel_subscription(key, body, headers = {})
    Utils.validate_key(key)
    put("/v1/subscriptions/#{key}/cancel", body:, headers:)
  end

  def suspend_subscription(key, body, headers = {})
    Utils.validate_key(key)
    put("/v1/subscriptions/#{key}/suspend", body:, headers:)
  end

  def resume_subscription(key, body, headers = {})
    Utils.validate_key(key)
    put("/v1/subscriptions/#{key}/resume", body:, headers:)
  end

  def create_subscription(body, headers = {})
    post("/v1/subscriptions", body:, headers:)
  end

  def get_subscriptions_for_account(account_key, headers = {})
    get("/v1/subscriptions/accounts/#{account_key}", headers:)
  end
end
