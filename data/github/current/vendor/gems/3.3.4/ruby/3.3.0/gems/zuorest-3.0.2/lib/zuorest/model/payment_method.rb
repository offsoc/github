class Zuorest::Model::PaymentMethod < Zuorest::Model::Base
  zuora_rest_namespace "/v1/payment-methods/credit-cards/", :delete => "/v1/payment-methods/"

  find_by :account_id, :rest_namespace => "/v1/payment-methods/credit-cards/accounts/", :result_key => "creditCards"
end

