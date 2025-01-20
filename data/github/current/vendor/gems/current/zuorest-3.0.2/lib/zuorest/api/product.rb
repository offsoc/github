module Zuorest::Product
  def create_product(body, headers = {})
    post("/v1/object/product", body:, headers:)
  end

  def update_product(id, body, headers = {})
    Utils.validate_id(id)
    put("/v1/object/product/#{id}", body:, headers:)
  end

  def get_product_id_for_name(product_name)
    result = query_action queryString: <<-ZOQL
      SELECT Id FROM Product WHERE Name = '#{product_name}'
    ZOQL
    return unless result['size'].positive?

    record = result.fetch('records', []).first
    record['Id'] if record
  end

  def get_product(id, headers = {})
    Utils.validate_id(id)
    get("/v1/object/product/#{id}", headers:)
  end
end
