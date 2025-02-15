# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `zuorest` gem.
# Please instead update this file by running `bin/tapioca gem zuorest`.

# source://zuorest//lib/zuorest/utils.rb#3
module Utils
  class << self
    # @return [Boolean]
    #
    # source://zuorest//lib/zuorest/utils.rb#4
    def is_alpha?(string); end

    # @return [Boolean]
    #
    # source://zuorest//lib/zuorest/utils.rb#8
    def is_alpha_and_hyphen?(string); end

    # @raise [Zuorest::ArgumentError]
    #
    # source://zuorest//lib/zuorest/utils.rb#12
    def required_argument!(name, value); end

    # @raise [Zuorest::ArgumentError]
    #
    # source://zuorest//lib/zuorest/utils.rb#16
    def validate_id(id); end

    # @raise [Zuorest::ArgumentError]
    #
    # source://zuorest//lib/zuorest/utils.rb#24
    def validate_key(key); end
  end
end

# source://zuorest//lib/zuorest/version.rb#1
module Zuorest; end

# source://zuorest//lib/zuorest/api/account.rb#3
module Zuorest::Account
  include ::Utils

  # source://zuorest//lib/zuorest/api/account.rb#20
  def create_account(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/account.rb#24
  def create_object_account(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/account.rb#28
  def generate_billing_documents(id, body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/account.rb#5
  def get_account(id, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/account.rb#10
  def update_account(id, body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/account.rb#15
  def update_object_account(id, body, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/action.rb#1
module Zuorest::Action
  # source://zuorest//lib/zuorest/api/action.rb#2
  def create_action(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/action.rb#10
  def query_action(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/action.rb#6
  def update_action(body, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/advanced_payment_manager.rb#1
module Zuorest::AdvancedPaymentManager
  # Public: Create a Zuora Advanced Payment Manager (APM) payment run
  #
  # Requires APM-specific client configuration.
  #
  # See https://www.zuora.com/developer/api-references/collections/operation/POST_PaymentRun/ for details.
  #
  # data - Hash of APM payment run configuration
  #
  # Returns a Hash including success/errors and APM payment run id.
  #
  # source://zuorest//lib/zuorest/api/advanced_payment_manager.rb#25
  def create_apm_payment_run(body, headers = T.unsafe(nil)); end

  # Public: Get a Zuora Advanced Payment Manager (APM) payment run
  #
  # Requires APM-specific client configuration.
  #
  # See https://www.zuora.com/developer/api-references/collections/operation/GET_PaymentRun/ for details.
  #
  # payment_run_id - String/Integer id of the APM payment run
  #
  # Returns a Hash of APM payment run details.
  #
  # source://zuorest//lib/zuorest/api/advanced_payment_manager.rb#11
  def get_apm_payment_run(payment_run_id, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api.rb#22
module Zuorest::Api
  include ::Utils
  include ::Zuorest::Account
  include ::Zuorest::AdvancedPaymentManager
  include ::Zuorest::EventTriggers
  include ::Zuorest::Invoice
  include ::Zuorest::Payment
  include ::Zuorest::PaymentMethodSnapshot
  include ::Zuorest::PaymentMethod
  include ::Zuorest::Refund
  include ::Zuorest::Subscription
  include ::Zuorest::Action
  include ::Zuorest::Contact
  include ::Zuorest::CreditBalanceAdjustment
  include ::Zuorest::InvoiceCollect
  include ::Zuorest::Product
  include ::Zuorest::ProductRatePlan
  include ::Zuorest::ProductRatePlanCharge
  include ::Zuorest::Usage
  include ::Zuorest::NotificationHistory
  include ::Zuorest::RSASignature
  include ::Zuorest::Import
end

# source://zuorest//lib/zuorest/argument_error.rb#1
class Zuorest::ArgumentError < ::ArgumentError; end

# source://zuorest//lib/zuorest/api/contact.rb#1
module Zuorest::Contact
  # source://zuorest//lib/zuorest/api/contact.rb#2
  def create_contact(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/contact.rb#6
  def get_contact(id, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/credit_balance_adjustment.rb#1
module Zuorest::CreditBalanceAdjustment
  include ::Utils

  # source://zuorest//lib/zuorest/api/credit_balance_adjustment.rb#4
  def create_credit_balance_adjustment(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/credit_balance_adjustment.rb#8
  def get_credit_balance_adjustment(id, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/error.rb#1
class Zuorest::Error < ::StandardError; end

# source://zuorest//lib/zuorest/api/event_triggers.rb#5
module Zuorest::EventTriggers
  include ::Utils

  # source://zuorest//lib/zuorest/api/event_triggers.rb#12
  def create_event_trigger(params:, headers: T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/event_triggers.rb#26
  def destroy_event_trigger(id, headers: T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/event_triggers.rb#16
  def get_event_trigger(id, headers: T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/event_triggers.rb#8
  def get_event_triggers(headers: T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/event_triggers.rb#21
  def update_event_trigger(id, params: T.unsafe(nil), headers: T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/gateway_timeout_error.rb#1
class Zuorest::GatewayTimeoutError < ::Zuorest::HttpError; end

# source://zuorest//lib/zuorest/http_error.rb#3
class Zuorest::HttpError < ::Zuorest::Error
  # @return [HttpError] a new instance of HttpError
  #
  # source://zuorest//lib/zuorest/http_error.rb#6
  def initialize(status_code, body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/http_error.rb#14
  def data; end

  # Returns the value of attribute headers.
  #
  # source://zuorest//lib/zuorest/http_error.rb#4
  def headers; end

  # Returns the value of attribute status_code.
  #
  # source://zuorest//lib/zuorest/http_error.rb#4
  def status_code; end

  private

  # source://zuorest//lib/zuorest/http_error.rb#20
  def build_message(status_code, body); end
end

# source://zuorest//lib/zuorest/api/import.rb#5
module Zuorest::Import
  # source://zuorest//lib/zuorest/api/import.rb#7
  def get_import(id, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/invoice.rb#4
module Zuorest::Invoice
  include ::Utils

  # source://zuorest//lib/zuorest/api/invoice.rb#14
  def email_invoice(id, body, headers = T.unsafe(nil)); end

  # https://www.zuora.com/developer/api-references/api/operation/Get_GetInvoice/
  # key - can be either the invoice ID or the number
  #
  # source://zuorest//lib/zuorest/api/invoice.rb#9
  def get_invoice(key, headers = T.unsafe(nil)); end

  # https://developer.zuora.com/api-references/api/operation/GET_InvoiceItems/
  # key - can be either the invoice ID or the number
  # page - the index number of the page to retrieve, defaults to 1
  # page_size - the number of records returned per page, defaults to 20
  #
  # source://zuorest//lib/zuorest/api/invoice.rb#23
  def get_invoice_invoice_items(key, page: T.unsafe(nil), page_size: T.unsafe(nil), headers: T.unsafe(nil)); end

  # https://www.zuora.com/developer/api-references/older-api/operation/Object_GETInvoice/
  #
  # source://zuorest//lib/zuorest/api/invoice.rb#36
  def get_object_invoice(id, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/invoice_collect.rb#1
module Zuorest::InvoiceCollect
  # source://zuorest//lib/zuorest/api/invoice_collect.rb#2
  def create_invoice_collect(body, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/model.rb#1
module Zuorest::Model; end

# source://zuorest//lib/zuorest/model/account.rb#1
class Zuorest::Model::Account < ::Zuorest::Model::Base
  # source://zuorest//lib/zuorest/model/base.rb#95
  def invoices; end

  # source://zuorest//lib/zuorest/model/base.rb#95
  def payment_methods; end

  # source://zuorest//lib/zuorest/model/base.rb#95
  def subscriptions; end
end

# source://zuorest//lib/zuorest/model/base.rb#6
class Zuorest::Model::Base
  # @return [Base] a new instance of Base
  #
  # source://zuorest//lib/zuorest/model/base.rb#145
  def initialize(body); end

  # source://zuorest//lib/zuorest/model/base.rb#159
  def [](key); end

  # Returns the value of attribute body.
  #
  # source://zuorest//lib/zuorest/model/base.rb#7
  def body; end

  # source://zuorest//lib/zuorest/model/base.rb#171
  def delete; end

  # source://zuorest//lib/zuorest/model/base.rb#149
  def id; end

  # source://zuorest//lib/zuorest/model/base.rb#155
  def reload!; end

  # Updates the Zuora object with attributes specified in the attrs hash.
  #
  # Returns response from the Zuora API.
  #
  # source://zuorest//lib/zuorest/model/base.rb#166
  def update!(attrs); end

  class << self
    # has_many defines a method that finds an object of another class
    # using a value in this object as the id
    #
    # name - name of the method to create
    # key - key of this objects body that contains the id
    #       defaults to a camelCased version of name + "Id"
    # class_name - the class that find will be called on,
    #              defaults to a guess based on `name`
    #
    # source://zuorest//lib/zuorest/model/base.rb#117
    def belongs_to(name, class_name: T.unsafe(nil), key: T.unsafe(nil)); end

    # source://zuorest//lib/zuorest/model/base.rb#56
    def class_name_for_name(name, plural: T.unsafe(nil)); end

    # contains_many defines a method that returns an array
    # of objects based on an array of hashes in this object's body
    #
    # name - name of the method to create
    # key - key of this objects body that contains the array of hashes
    # class_name - the class that the hash will be passed to
    #              defaults to a guess based on `name`
    #
    # source://zuorest//lib/zuorest/model/base.rb#69
    def contains_many(name, class_name: T.unsafe(nil), key: T.unsafe(nil)); end

    # source://zuorest//lib/zuorest/model/base.rb#48
    def find(id); end

    # find_by defines a method that searches for instances of this object
    # using an alternate REST namespace
    #
    # name - method will be created as find_by_{name}
    # rest_namespace - URL prefix for the REST request
    # result_key - the key of the response hash that contains the array of results
    #              defaults to a guess based upon our class name
    #
    # source://zuorest//lib/zuorest/model/base.rb#133
    def find_by(name, rest_namespace:, result_key: T.unsafe(nil)); end

    # source://zuorest//lib/zuorest/model/base.rb#44
    def get(id); end

    # has_many defines a method that searches for objects of another class
    # using this object's id as a key
    #
    # name - name of the method to create
    # result_key - key of this objects body that contains the array of hashes
    #              defaults to a camelCased version of name
    # class_name - the class that the hash will be passed to,
    #              defaults to a guess based on `name`
    #
    # source://zuorest//lib/zuorest/model/base.rb#90
    def has_many(name, rest_namespace:, class_name: T.unsafe(nil), result_key: T.unsafe(nil)); end

    # source://zuorest//lib/zuorest/model/base.rb#31
    def path_for_id(id); end

    # source://zuorest//lib/zuorest/model/base.rb#27
    def zuora_delete_namespace; end

    # source://zuorest//lib/zuorest/model/base.rb#36
    def zuora_rest_client; end

    # source://zuorest//lib/zuorest/model/base.rb#40
    def zuora_rest_client=(zuora_rest_client); end

    # source://zuorest//lib/zuorest/model/base.rb#9
    def zuora_rest_namespace(namespace = T.unsafe(nil), delete: T.unsafe(nil), reformatter: T.unsafe(nil)); end
  end
end

# source://zuorest//lib/zuorest/model/invoice.rb#1
class Zuorest::Model::Invoice < ::Zuorest::Model::Base
  # An invoice may have more than one invoiceItem with the same "unit of measure"
  # This returns the total count for all the items of that unit
  # Unfortunately this only works if you get to the invoice via an API other than the CRUD API
  # for example, via Account#invoices
  #
  # source://zuorest//lib/zuorest/model/invoice.rb#37
  def total_of_unit(unit); end

  class << self
    # The data that comes back from /object/invoice API is in an uglier format
    # than the data that comes from /transactions/invoices/accounts
    # This method translates between those structures
    # Unfortunately, a few fields are missing from this API
    #
    # source://zuorest//lib/zuorest/model/invoice.rb#10
    def from_crud_format(data); end
  end
end

# source://zuorest//lib/zuorest/model/order.rb#1
class Zuorest::Model::Order < ::Zuorest::Model::Base
  # source://zuorest//lib/zuorest/model/base.rb#73
  def subscriptions; end

  class << self
    # source://zuorest//lib/zuorest/model/order.rb#4
    def unwrap_response(data); end
  end
end

# source://zuorest//lib/zuorest/model/payment.rb#1
class Zuorest::Model::Payment < ::Zuorest::Model::Base
  # Returns true if response status is "Error"
  #
  # @return [Boolean]
  #
  # source://zuorest//lib/zuorest/model/payment.rb#12
  def error?; end

  # Gateway Response if response is error.
  #
  # Returns an error message or nil.
  #
  # source://zuorest//lib/zuorest/model/payment.rb#7
  def error_message; end

  private

  # source://zuorest//lib/zuorest/model/payment.rb#18
  def status; end
end

# source://zuorest//lib/zuorest/model/payment_method.rb#1
class Zuorest::Model::PaymentMethod < ::Zuorest::Model::Base
  class << self
    # source://zuorest//lib/zuorest/model/base.rb#137
    def find_by_account_id(value); end
  end
end

# source://zuorest//lib/zuorest/model/subscription.rb#1
class Zuorest::Model::Subscription < ::Zuorest::Model::Base
  # Determines if this subscription is currently active. Subscriptions whose versions are
  # not current are not considered active, even if their term dates are current.
  #
  # Returns true if current version.
  #
  # @return [Boolean]
  #
  # source://zuorest//lib/zuorest/model/subscription.rb#11
  def active?; end

  # source://zuorest//lib/zuorest/model/base.rb#73
  def rate_plans; end

  # Totals the unit specified from all the RatePlanCharges that comprise this subscription.
  #
  # Optionally takes a sku and sums only the units associated with charges for that sku.
  #
  # Returns a Float.
  #
  # source://zuorest//lib/zuorest/model/subscription.rb#20
  def total_of_unit(unit, sku: T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/model/subscription.rb#30
class Zuorest::Model::Subscription::RatePlan < ::Zuorest::Model::Base
  # source://zuorest//lib/zuorest/model/base.rb#73
  def rate_plan_charges; end

  # An subscription may have more than one charge with the same "unit of measure"
  # This returns the total count for all the charges of that unit.
  #
  # source://zuorest//lib/zuorest/model/subscription.rb#35
  def total_of_unit(unit); end
end

# source://zuorest//lib/zuorest/model/subscription.rb#40
class Zuorest::Model::Subscription::RatePlanCharge < ::Zuorest::Model::Base; end

# source://zuorest//lib/zuorest/api/notification_history.rb#3
module Zuorest::NotificationHistory
  include ::Utils

  # source://zuorest//lib/zuorest/api/notification_history.rb#5
  def get_callout_notification_history(params, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/payment.rb#3
module Zuorest::Payment
  include ::Utils

  # source://zuorest//lib/zuorest/api/payment.rb#19
  def cancel_authorization(id, body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/payment.rb#14
  def create_authorization(id, body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/payment.rb#10
  def create_payment(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/payment.rb#24
  def get_payments(account_id, params = T.unsafe(nil), headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/payment.rb#5
  def update_payment(id, body, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/payment_method.rb#3
module Zuorest::PaymentMethod
  include ::Utils

  # source://zuorest//lib/zuorest/api/payment_method.rb#15
  def create_payment_method(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/payment_method.rb#5
  def get_payment_method(id, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/payment_method.rb#10
  def update_payment_method(id, body, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/payment_method_snapshot.rb#3
module Zuorest::PaymentMethodSnapshot
  include ::Utils

  # source://zuorest//lib/zuorest/api/payment_method_snapshot.rb#5
  def get_payment_method_snapshot(id, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/product.rb#1
module Zuorest::Product
  # source://zuorest//lib/zuorest/api/product.rb#2
  def create_product(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/product.rb#21
  def get_product(id, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/product.rb#11
  def get_product_id_for_name(product_name); end

  # source://zuorest//lib/zuorest/api/product.rb#6
  def update_product(id, body, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/product_rate_plan.rb#1
module Zuorest::ProductRatePlan
  # source://zuorest//lib/zuorest/api/product_rate_plan.rb#7
  def create_product_rate_plan(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/product_rate_plan.rb#2
  def get_product_rate_plan(id, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/product_rate_plan.rb#11
  def update_product_rate_plan(id, body, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/product_rate_plan_charge.rb#1
module Zuorest::ProductRatePlanCharge
  # source://zuorest//lib/zuorest/api/product_rate_plan_charge.rb#3
  def get_product_rate_plan_charge(id, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/rsa_signature.rb#1
module Zuorest::RSASignature
  # source://zuorest//lib/zuorest/api/rsa_signature.rb#2
  def create_rsa_signature(body, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/api/refund.rb#3
module Zuorest::Refund
  include ::Utils

  # source://zuorest//lib/zuorest/api/refund.rb#10
  def create_refund(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/refund.rb#5
  def get_refund(id, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/rest_client.rb#7
class Zuorest::RestClient
  include ::Utils
  include ::Zuorest::Account
  include ::Zuorest::AdvancedPaymentManager
  include ::Zuorest::EventTriggers
  include ::Zuorest::Invoice
  include ::Zuorest::Payment
  include ::Zuorest::PaymentMethodSnapshot
  include ::Zuorest::PaymentMethod
  include ::Zuorest::Refund
  include ::Zuorest::Subscription
  include ::Zuorest::Action
  include ::Zuorest::Contact
  include ::Zuorest::CreditBalanceAdjustment
  include ::Zuorest::InvoiceCollect
  include ::Zuorest::Product
  include ::Zuorest::ProductRatePlan
  include ::Zuorest::ProductRatePlanCharge
  include ::Zuorest::Usage
  include ::Zuorest::NotificationHistory
  include ::Zuorest::RSASignature
  include ::Zuorest::Import
  include ::Zuorest::Api
  extend ::Forwardable

  # @return [RestClient] a new instance of RestClient
  #
  # source://zuorest//lib/zuorest/rest_client.rb#22
  def initialize(server_url:, access_key_id:, secret_access_key:, client_id:, client_secret:, name: T.unsafe(nil), apm_server_url: T.unsafe(nil), apm_username: T.unsafe(nil), apm_api_token: T.unsafe(nil), timeout: T.unsafe(nil), open_timeout: T.unsafe(nil), logger: T.unsafe(nil)); end

  # Internal: These readers are only used for testing and should not be used
  # outside of the gem code as the API may change
  #
  # source://zuorest//lib/zuorest/rest_client.rb#127
  def client_id; end

  # Internal: These readers are only used for testing and should not be used
  # outside of the gem code as the API may change
  #
  # source://zuorest//lib/zuorest/rest_client.rb#127
  def client_secret; end

  # Returns the value of attribute debug.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#15
  def debug; end

  # Sets the attribute debug
  #
  # @param value the value to set the attribute debug to.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#15
  def debug=(_arg0); end

  # source://zuorest//lib/zuorest/rest_client.rb#98
  def delete(path, headers: T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/rest_client.rb#82
  def get(path, params: T.unsafe(nil), headers: T.unsafe(nil)); end

  # Returns the value of attribute logger.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#15
  def logger; end

  # Sets the attribute logger
  #
  # @param value the value to set the attribute logger to.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#15
  def logger=(_arg0); end

  # Returns the value of attribute name.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#15
  def name; end

  # Sets the attribute name
  #
  # @param value the value to set the attribute name to.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#15
  def name=(_arg0); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def open_timeout(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def open_timeout=(*args, **_arg1, &block); end

  # source://zuorest//lib/zuorest/rest_client.rb#74
  def post(path, body: T.unsafe(nil), headers: T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/rest_client.rb#90
  def put(path, body: T.unsafe(nil), headers: T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/rest_client.rb#106
  def raw_get(path, headers = T.unsafe(nil)); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def timeout(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def timeout=(*args, **_arg1, &block); end

  private

  # Private: Get the authN header needed for Zuora Advanced Payment Manager (APM) API requests.
  #
  # Requires APM-specific client configuration.
  #
  # This is needed since APM uses a different authN scheme than the general Zuora REST API.
  # See https://www.zuora.com/developer/api-references/collections/overview/ for details.
  #
  # Returns a Hash
  #
  # source://zuorest//lib/zuorest/rest_client.rb#162
  def apm_auth_header; end

  # Private: Get a Zuora Advanced Payment Manager (APM) REST API URL
  #
  # Requires APM-specific client configuration.
  #
  # This is needed since APM uses a different hostname than the general Zuora REST API.
  # See https://www.zuora.com/developer/api-references/collections/overview/ for details.
  #
  # path - String URL path (e.g. "/api/v1/subscription_payment_runs")
  #
  # Returns a String
  #
  # source://zuorest//lib/zuorest/rest_client.rb#150
  def apm_url(path); end

  # Returns the value of attribute connection.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#131
  def connection; end

  # source://zuorest//lib/zuorest/rest_client.rb#173
  def connection_options; end

  # Returns the value of attribute default_headers.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#131
  def default_headers; end

  # source://zuorest//lib/zuorest/rest_client.rb#167
  def ensure_token_is_fresh; end

  # Response is a Faraday::Response
  #
  # source://zuorest//lib/zuorest/rest_client.rb#178
  def handle_response(response, method:, path:); end

  # Returns the value of attribute oauth2_client.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#131
  def oauth2_client; end

  # source://zuorest//lib/zuorest/rest_client.rb#134
  def oauth_header; end

  # Returns the value of attribute oauth_token.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#132
  def oauth_token; end

  # Sets the attribute oauth_token
  #
  # @param value the value to set the attribute oauth_token to.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#132
  def oauth_token=(_arg0); end

  # Returns the value of attribute server_url.
  #
  # source://zuorest//lib/zuorest/rest_client.rb#131
  def server_url; end
end

# source://zuorest//lib/zuorest/rest_client.rb#11
Zuorest::RestClient::DEFAULT_TIMEOUT = T.let(T.unsafe(nil), Integer)

# source://zuorest//lib/zuorest/rest_client.rb#17
class Zuorest::RestClient::NullLogger
  # source://zuorest//lib/zuorest/rest_client.rb#18
  def info(*_arg0, **_arg1); end
end

# source://zuorest//lib/zuorest/api/subscription.rb#3
module Zuorest::Subscription
  include ::Utils

  # source://zuorest//lib/zuorest/api/subscription.rb#15
  def cancel_subscription(key, body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/subscription.rb#30
  def create_subscription(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/subscription.rb#5
  def get_subscription(key, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/subscription.rb#34
  def get_subscriptions_for_account(account_key, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/subscription.rb#25
  def resume_subscription(key, body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/subscription.rb#20
  def suspend_subscription(key, body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/subscription.rb#10
  def update_subscription(key, body, headers = T.unsafe(nil)); end
end

# Check out the official docs for more info:
#   https://knowledgecenter.zuora.com/BB_Introducing_Z_Business/Policies/Concurrent_Request_Limits
#
# source://zuorest//lib/zuorest/too_many_requests_error.rb#3
class Zuorest::TooManyRequestsError < ::Zuorest::HttpError
  # @return [Boolean]
  #
  # source://zuorest//lib/zuorest/too_many_requests_error.rb#17
  def concurrent?; end

  # source://zuorest//lib/zuorest/too_many_requests_error.rb#5
  def message; end

  # The request limit quota for the time window closest to exhaustion.
  #
  # source://zuorest//lib/zuorest/too_many_requests_error.rb#28
  def rate_limit_info; end

  # The number of requests remaining in the time window closest to quota exhaustion.
  #
  # source://zuorest//lib/zuorest/too_many_requests_error.rb#33
  def rate_limit_remaining; end

  # The number of seconds until the quota resets for the time window closest to quota exhaustion.
  #
  # source://zuorest//lib/zuorest/too_many_requests_error.rb#38
  def rate_limit_reset; end

  # For concurrent request limits, this is the amount of seconds to wait
  # before attempting another request
  #
  # source://zuorest//lib/zuorest/too_many_requests_error.rb#23
  def retry_after; end
end

# source://zuorest//lib/zuorest/unsuccessful_response_error.rb#1
class Zuorest::UnsuccessfulResponseError < ::Zuorest::Error
  # @return [UnsuccessfulResponseError] a new instance of UnsuccessfulResponseError
  #
  # source://zuorest//lib/zuorest/unsuccessful_response_error.rb#4
  def initialize(reasons); end

  # source://zuorest//lib/zuorest/unsuccessful_response_error.rb#9
  def message; end

  # Returns the value of attribute reasons.
  #
  # source://zuorest//lib/zuorest/unsuccessful_response_error.rb#2
  def reasons; end

  private

  # source://zuorest//lib/zuorest/unsuccessful_response_error.rb#15
  def formatted_reasons; end
end

# source://zuorest//lib/zuorest/upload_io.rb#3
class Zuorest::UploadIO < ::Multipart::Post::UploadIO; end

# source://zuorest//lib/zuorest/api/usage.rb#1
module Zuorest::Usage
  # source://zuorest//lib/zuorest/api/usage.rb#8
  def create_usage(body, headers = T.unsafe(nil)); end

  # source://zuorest//lib/zuorest/api/usage.rb#3
  def get_usage_status(id, headers = T.unsafe(nil)); end
end

# source://zuorest//lib/zuorest/version.rb#2
Zuorest::VERSION = T.let(T.unsafe(nil), String)
