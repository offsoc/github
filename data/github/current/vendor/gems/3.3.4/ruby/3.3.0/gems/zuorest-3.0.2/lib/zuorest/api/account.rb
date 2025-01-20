require "zuorest/utils"

module Zuorest::Account
  include Utils
  def get_account(id, headers = {})
    Utils.validate_id(id)
    get("/v1/object/account/#{id}", headers:)
  end

  def update_account(id, body, headers = {})
    Utils.validate_id(id)
    put("/v1/accounts/#{id}", body:, headers:)
  end

  def update_object_account(id, body, headers = {})
    Utils.validate_id(id)
    put("/v1/object/account/#{id}", body:, headers:)
  end

  def create_account(body, headers = {})
    post("/v1/accounts", body:, headers:)
  end

  def create_object_account(body, headers = {})
    post("/v1/object/account", body:, headers:)
  end

  def generate_billing_documents(id, body, headers = {})
    Utils.validate_id(id)
    post("/v1/accounts/#{id}/billing-documents/generate", body:, headers:)
  end
end
