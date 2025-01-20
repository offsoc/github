# Zuorest

This is a lightweight wrapper around the Zuora REST API.

### Docs

[Zuora Docs](https://www.zuora.com/developer/api-reference)

## Upgrading github/github

```bash
./script/vendor-gem https://github.com/github/zuorest
```

## Usage

```ruby
Zuorest::Model::Base.zuora_rest_client = Zuorest::RestClient.new(server_url: "https://rest.apisandbox.zuora.com", access_key_id: "ZUORA_ACCESS_KEY", secret_access_key: "ZUORA_SECRET_ACCESS_KEY", client_id: "ZUORA_CLIENT_ID", client_secret: "ZUORA_CLIENT_SECRET")
order = Zuorest::Model::Order.find "O-00000021"
```

### Rest Client

The rest client can be used to make HTTP requests to any endpoint and will accept and return JSON payloads.

#### Configuration

The client uses Faraday as the HTTP client and can be configured by providing a block on initialization.

```
Zuorest::RestClient.new(server_url: "https://rest.apisandbox.zuora.com", access_key_id: "ZUORA_ACCESS_KEY", secret_access_key: "ZUORA_SECRET_ACCESS_KEY", client_id: "ZUORA_CLIENT_ID", client_secret: "ZUORA_CLIENT_SECRET") do |conn|
  conn.request :retry, max: 2
end
```

The object passed to the block is the Faraday connection which can be used to set middlewares and other options on the overall request.

#### Timeouts

Zuorest::RestClient provides the timeout options through the initializer as `open_timeout` and `timeout`. The defaults for these values is 60 seconds.

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `bundle exec rake test` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To instantiate a client against `https://apisandbox.zuora.com` in the console, get the credentials from the `Zuora - meuse Staging (Sandbox Credentials)` entry in the gitcoin 1Password.

Run `bin/console` and initialize a new Zuorest client using the secrets obtained from 1Password.

```ruby
Zuorest::Model::Base.zuora_rest_client = Zuorest::RestClient.new(server_url: "https://rest.apisandbox.zuora.com", access_key_id: "ZUORA_ACCESS_KEY", secret_access_key: "ZUORA_SECRET_ACCESS_KEY", client_id: "ZUORA_CLIENT_ID", client_secret: "ZUORA_CLIENT_SECRET")
```

To test your client, request data from the API.

```ruby
Zuorest::Model::Order.find "O-00000021"
```

To install this gem onto your local machine, run `bundle exec rake install`.

### Testing in Dotcom

To test Zuorest changes that are still in development in Dotcom you can update the gem in a Dotcom codespace to point to your branch by running: `script/vendor-gem https://github.com/github/zuorest -r <your branch>`.

### Releasing a new version

To release a new version of the gem, update the version number in `version.rb`. Then:

#### GitHub Package Repository

- **Automatic (default):** Releasing a new version to [GPR](https://github.com/orgs/github/packages) will happen automatically via CI as part of the `build-and-publish.yml` workflow when a new version number is pushed to the `master` branch and the updated version number does not exist as a tag yet.

#### Octofactory (depricated)

- **Manual:** Be on [the developer VPN](https://thehub.github.com/security/security-operations/developer-vpn-access/) and have deploy permissions to `zuorest-gems-releases-local` on [Octofactory](https://octofactory.githubapp.com/artifactory/webapp/#/home). Run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to Octofactory.

### Adding a new API
* Check that it's not addressed in the gem already.
* Figure out which category (eg product, payment, account, or perhaps a new one) this API belongs in
* Add the API to the corrsponding category.
* Add Validation if needed.
* Add a unit test.
* Update the version number in `version.rb`.
* Merge your changes to `master`.
* Wait for CI to publish your new version on GitHub Package Repository, or manually release a new version.
* Update dotcom with the new release `./script/vendor-gem git@github.com:github/zuorest.git`.

### Validation
* Validation of params in GET and PUT methods:
  * Length is 32 chars at max.
  * For IDs, we are not allowing any special chars (`alphanumeric` only), ex: `2c92c0fa624bb1f20162694a4c7937ab`.
  * For numbers, (Account Number, Subscription Number, ...), we only allow `-` along with `alphanumeric`, ex: `A-S1234567`.


### List of categories
* Account
* Action
* Contact
* Credit Balance Adjustment.rb
* Import
* Invoice
* Invoice Collect
* Notification History
* Payment
* Payment Method
* Payment Method Snapshot
* Product
* Product Rate Plan
* Product Rate Plan Charge
* Refund
* RSA Signature
* Subscription
* Usage

### List of APIs in Zuorest

|     #	    |   name	|   URL	|   Usage in dotcom	| Method
|---	    |---	|---	|---	|--- |
|     1	    |   get_payment_method	|   "/v1/object/payment-method/#{id}"	|   zuora_client.get_payment_method(id)	| GET |
|     2	    |   get_invoice	|   "/v1/object/invoice/#{id}"	|   zuora_client.get_invoice(id)	| GET |
|     3	    |   get_payment_method_snapshot	|   "/v1/object/payment-method-snapshot/#{id}"	|   zuora_client.get_payment_method_snapshot(id)	|GET |
|     4     |   get_refund	|   "/v1/object/refund/#{id}"	|   zuora_client.get_refund(id)	| GET |
|     5     |   get_subscription	|   "/v1/subscriptions/#{id}"	|   zuora_client.get_subscription(id)	| GET |
|     6	    |   get_account	|  "/v1/object/account/#{id}" 	|   zuora_client.get_account(id)	| GET |
|     7	    |   get_usage_status	|  "/v1/usage/#{id}/status" 	|   zuora_client.get_usage_status(id)	| GET |
|     8	    |   get_product_rate_plan_charge |  "/v1/object/product-rate-plan-charge/#{id}" 	|   zuora_client.get_product_rate_plan_charge(id)	| GET |
|     9	    |   get_import |  "/v1/object/import/#{id}" 	|   zuora_client.get_import(id)	| GET |
|     10     |   update_subscription	|   "/v1/subscriptions/#{id}"	|  zuora_client.update_subscription(id, data, headers) 	| PUT |
|     11    |   update_payment_method	|  "/v1/object/payment-method/#{id}" 	|  zuora_client.update_payment_method(id, data, headers) 	| PUT |
|     12    |   update_payment	|  "/v1/object/payment/#{id}" 	|  zuora_client.update_payment(id, data, headers) 	| PUT |
|     13    |   update_object_account	|  "/v1/object/account/#{id}" 	|  zuora_client.update_object_account(id, data, headers) 	| PUT |
|     14    |   cancel_subscription	|  "/v1/subscriptions/#{id}/cancel" 	|  zuora_client.cancel_subscription(id, data, headers) 	| PUT |
|     15    |   suspend_subscription	|  "/v1/subscriptions/#{id}/suspend" 	|  zuora_client.suspend_subscription(id, data, headers) 	| PUT |
|     16    |   resume_subscription	|  "/v1/subscriptions/#{id}/resume" 	|  zuora_client.resume_subscription(id, data, headers) 	| PUT |
|     17    |   create_payment	|  "v1/object/payment" 	|  zuora_client.create_payment(data, headers) 	| POST |
|     18    |   create_invoice_collect	|  "/v1/operations/invoice-collect" 	|  zuora_client.create_invoice_collect(data, headers) 	| POST |
|     19    |   create_usage	|  "/v1/usage" 	|  zuora_client.create_usage(data, headers) 	| POST |
|     20    |   update_action	|  "/v1/action/update" 	|  zuora_client.update_action(data, headers) 	| POST |
|     21    |   create_product	|  "/v1/object/product" 	|  zuora_client.create_product(data, headers) 	| POST |
|     22    |   create_product_rate_plan	|  "/v1/object/product-rate-plan" 	|  zuora_client.create_product_rate_plan(data, headers) 	| POST |
|     23    |   create_action	|  "/v1/action/create" 	|  zuora_client.create_action(data, headers) 	| POST |
|     24    |   create_account	|  "/v1/accounts" 	|  zuora_client.create_account(data, headers) 	| POST |
|     25    |   create_object_account	|  "/v1/object/account" 	|  zuora_client.create_object_account(data, headers) 	| POST |
|     26    |   create_subscription	|  "/v1/subscriptions" 	|  zuora_client.create_subscription(data, headers) 	| POST |
|     27    |   create_credit_balance_adjustment	|  "/v1/object/credit-balance-adjustment" 	|  zuora_client.create_credit_balance_adjustment(data, headers) 	| POST |
|     28    |   query_action	|  "/v1/action/query" 	|  zuora_client.query_action(data, headers) 	| POST |
|     29    |   create_rsa_signature	|  "/v1/rsa-signatures" 	|  zuora_client.create_rsa_signature(data, headers) 	| POST |
|     30    |   create_refund	|  "/v1/object/refund" 	|  zuora_client.create_refund(data, headers) 	| POST |
|     31    |   create_contact	|  "/v1/object/contact" 	|  zuora_client.create_contact(data, headers) 	| POST |
|     32    |   get_contact	 |  "/v1/object/contact/#{id}" 	|  zuora_client.get_contact(id) 	| GET |
|     33    |   create_payment_method	|  zuora_client.post("/v1/object/payment-method", data, headers) 	|  zuora_client.create_payment_method(data, headers) 	| POST |
|     34    |   get_product_id_for_name | "/v1/action/query" | zuora_client.get_product_id_for_name(product_name) | POST |
|     35    |   get_subscriptions_for_account | "/v1/subscriptions/accounts/#{account_key}" | zuora_client.get_subscriptions_for_account(account_key) | GET |
|     36    |   get_product | "/v1/object/product/#{id}" | zuora_client.get_product(id) | GET |
|     37    |   create_authorization | "/v1/payment-methods/#{id}" | zuora_client.create_authorization(id) | POST |
|     38    |   cancel_authorization | "/v1/payment-methods/#{id}/voidAuthorize" | zuora_client.cancel_authorization(id) | POST |
|     39    |   email_invoice |  "/v1/invoices/#{id}/emails" | zuora_client.email_invoice(id, data, headers) | POST |
|     40    |   get_payments  | "/v1/transactions/payments/accounts/#{account_id}" | zuora_client.get_payments(id, params, headers) | GET |
|     41    |   update_account	|  "/v1/accounts/#{id}" 	|  zuora_client.update_account(id, data, headers) 	| PUT |
|     42    |   generate_billing_documents	|  "/v1/accounts/#{id}/billing-documents/generate" 	|  zuora_client.generate_billing_documents(id, data, headers) 	| POST |

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/github/zuorest.
