class Zuorest::Model::Account < Zuorest::Model::Base
  zuora_rest_namespace "/v1/accounts/"

  has_many :invoices, :rest_namespace => "/v1/transactions/invoices/accounts/"

  has_many :payment_methods, :rest_namespace => "/v1/payment-methods/credit-cards/accounts/", :result_key => "creditCards"

  has_many :subscriptions, :rest_namespace => "/v1/subscriptions/accounts/"
end
