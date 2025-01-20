class Zuorest::Model::Order < Zuorest::Model::Base
  zuora_rest_namespace "/v1/orders/", reformatter: :unwrap_response

  def self.unwrap_response(data)
    # If this pattern appears in another model, we should move this logic
    # into Base, and have zuora_rest_namespace take a :key param
    if data["success"]
      data["order"]
    else
      raise "Request not successful"
    end
  end

  contains_many :subscriptions
end
