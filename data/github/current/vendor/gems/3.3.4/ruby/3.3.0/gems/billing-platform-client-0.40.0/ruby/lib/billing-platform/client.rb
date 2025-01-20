# frozen_string_literal: true

require_relative "version"
require_relative "twirp/hmac/request_signing_middleware"

require_relative "../proto/base_pb"
require_relative "../proto/base_twirp"
require_relative "../proto/cost-center-api_pb"
require_relative "../proto/cost-center-api_twirp"
require_relative "../proto/customer-api_pb"
require_relative "../proto/customer-api_twirp"
require_relative "../proto/pricing-api_pb"
require_relative "../proto/pricing-api_twirp"
require_relative "../proto/product-api_pb"
require_relative "../proto/product-api_twirp"
require_relative "../proto/usage-api_pb"
require_relative "../proto/usage-api_twirp"
require_relative "../proto/admin-api_pb"
require_relative "../proto/admin-api_twirp"
require_relative "../proto/invoice-api_pb"
require_relative "../proto/invoice-api_twirp"
require_relative "../proto/subscriptions-api_pb"
require_relative "../proto/subscriptions-api_twirp"
require_relative "../proto/usage-report-api_pb"
require_relative "../proto/usage-report-api_twirp"

module BillingPlatform
  class Client

    attr_reader :cost_center_api,
      :customer_api,
      :pricing_api,
      :product_api,
      :usage_api,
      :admin_api,
      :invoice_api,
      :usage_report_api,
      :subscriptions_api

    def initialize(host: nil, path_prefix: "twirp", hmac_key:, &blk)
      @host = host || default_host_mapping[inferred_env] || default_host_mapping[:development]
      @url = [@host.chomp("/"), *path_prefix.split("/").reject { |s| s.nil? || s == "" }].join("/")
      @hmac_key = hmac_key

      connection = setup_default_connection(&blk)
      @cost_center_api = BillingPlatform::Api::V1::CostCenterApiClient.new(connection)
      @customer_api = BillingPlatform::Api::V1::CustomerApiClient.new(connection)
      @pricing_api = BillingPlatform::Api::V1::PricingApiClient.new(connection)
      @product_api = BillingPlatform::Api::V1::ProductApiClient.new(connection)
      @usage_api = BillingPlatform::Api::V1::UsageApiClient.new(connection)
      @admin_api = BillingPlatform::Api::V1::AdminApiClient.new(connection)
      @invoice_api = BillingPlatform::Api::V1::InvoiceAPIClient.new(connection)
      @subscriptions_api = BillingPlatform::Api::V1::SubscriptionsApiClient.new(connection)
      @usage_report_api = BillingPlatform::Api::V1::UsageReportApiClient.new(connection)
    end

    ### Admin API
    def admin_process_dead_letter_queue(num:, queueName: '')
      @admin_api.process_dead_letter_queue(num:, queueName:)
    end

    def admin_trigger_azure_emission(customerId: '', year:, month:, day:)
      @admin_api.trigger_azure_emission(customerId:, year:, month:, day:)
    end

    def admin_trigger_invoice_generation(customerId:, year:, month:)
      @admin_api.trigger_invoice_generation(customerId:, year:, month:)
    end

    def admin_trigger_watermark_workflow(customerId: '', sku: '', year:, month:, day:, hour:)
      @admin_api.trigger_watermark_workflow(customerId:, sku: '', year:, month:, day:, hour:)
    end

    def admin_generate_usage(customerId: '', sku: '', orgId: 0, repoId: 0, quantity: 0.0, amount: 0.0)
      @admin_api.generate_usage(customerId:, sku:, orgId:, repoId:, quantity:, amount:)
    end

    def admin_trigger_high_watermark_rollover_job(customerId: '', sku: '', year:, month:, dryRun:)
      @admin_api.trigger_high_watermark_rollover_job(customerId:, sku:, year:, month:, dryRun:)
    end

    ### Cost Center API

    def get_all_cost_centers(customerId:)
      @cost_center_api.get_all_cost_centers(customerId:)
    end

    def get_cost_center(costCenterKey:)
      @cost_center_api.get_cost_center(costCenterKey:)
    end

    def find_cost_center_for(entityDetail:)
      @cost_center_api.find_for(entityDetail:)
    end

    def create_cost_center(customerId:, targetId:, targetType:, name:, resources:)
      @cost_center_api.create_cost_center(customerId:, targetId:, targetType:, name:, resources:)
    end

    def update_cost_center(key:, targetId:, name:, resourcesToAdd:, resourcesToRemove:)
      @cost_center_api.update_cost_center(key:, targetId:, name:, resourcesToAdd:, resourcesToRemove:)
    end

    def upsert_cost_center(costCenter:)
      @cost_center_api.upsert_cost_center(costCenter:)
    end

    def add_resource_to_cost_center(key:, resources:)
      @cost_center_api.add_resource_to(key:, resources:)
    end

    def remove_resource_from_cost_center(key:, resources:)
      @cost_center_api.remove_resource_from(key:, resources:)
    end

    def archive_cost_center(costCenterKey:)
      @cost_center_api.archive_cost_center(costCenterKey:)
    end

    ### Customer API

    def create_or_update_customer(customer:)
      @customer_api.upsert_customer(customer:)
    end

    def create_or_patch_customer(customer:)
      @customer_api.patch_customer(customer:)
    end

    def get_customer(customerId:)
      @customer_api.get_customer(customerId:)
    end

    def get_customers(customerIds:)
      @customer_api.get_customers(customerIds:)
    end

    def create_or_update_budget(budget:)
      @customer_api.upsert_budget(budget:)
    end

    def delete_budget(customerId:, uuid:)
      @customer_api.delete_budget(customerId:, uuid:)
    end

    def get_budget(key:)
      @customer_api.get_budget(key:)
    end

    def get_budget_by_uuid(customerId:, uuid:)
      @customer_api.get_budget_by_uuid(customerId:, uuid:)
    end

    def get_all_budgets(customerId:)
      @customer_api.get_all_budgets(customerId:)
    end

    def get_budget_state(key:, year:, month:)
      @customer_api.get_budget_state(key:, year:, month:)
    end

    def can_proceed_with_usage(usageKey:)
      @customer_api.can_proceed_with_usage(usageKey:)
    end

    def get_discount(key:)
      @customer_api.get_discount(key:)
    end

    def get_all_discounts(customerId:)
      @customer_api.get_all_discounts(customerId:)
    end

    def get_all_discount_states(customerId:, year:, month:)
      @customer_api.get_all_discount_states(customerId:, year:, month:)
    end

    def create_discount(discount:)
      @customer_api.create_discount(discount:)
    end

    def get_discount_state(key:, year:, month:)
      @customer_api.get_discount_state(key:, year:, month:)
    end

    ### Pricing API

    def get_pricing(sku:)
      @pricing_api.get_pricing(sku:)
    end

    def get_pricings_by_product(productName:)
      @pricing_api.get_pricings_by_product(productName:)
    end

    def get_all_pricing
      @pricing_api.get_all_pricing({})
    end

    def create_or_update_pricing(pricing:)
      @pricing_api.upsert_pricing(pricing:)
    end

    ### Product API

    def get_all_products
      @product_api.get_all_products({})
    end

    def get_product(productName)
      @product_api.get_product({ product: productName })
    end

    def create_or_update_product(product)
      @product_api.upsert_product(product:)
    end

    ### Usage API

    def get_top_org_repo_usage_line_items(customerId:, costCenterId: nil, limit: 5, year: nil, month: nil, day: nil, hour: nil, billingPeriod: nil, groupBy: nil, organizationIds: nil)
      @usage_api.get_top_org_repo_usage_line_items(customerId:, costCenterId:, limit:, year:, month:, day:, hour:, billingPeriod:, groupBy:, organizationIds:)
    end

    def get_usage_total(usageEntityId:, product: '', sku: '', year: nil, month: nil, day: nil, hour: nil, billingPeriod: nil)
      @usage_api.get_usage_total(usageEntityId:, product:, sku:, year:, month:, day:, hour:, billingPeriod:)
    end

    def get_discount_total(usageEntityId:, product: '', sku:, year:, month:, day:, hour:, billingPeriod:)
      @usage_api.get_discount_total(usageEntityId:, product: , sku:, year:, month:, day:, hour:, billingPeriod:)
    end

    def get_usage_line_items(usageEntityId:, product: '', sku: '', year: nil, month: nil, day: nil, hour: nil, billingPeriod: nil, orgId: nil, repoId: nil, groupBy: nil)
      @usage_api.get_usage_line_items(usageEntityId:, product:, sku:, year:, month:, day:, hour:, billingPeriod:, orgId:, repoId:, groupBy:)
    end

    def get_discount_line_items(usageEntityId:, product: '', sku: '', year: nil, month: nil, day: nil, hour: nil, billingPeriod: nil, orgId: nil, repoId: nil, groupBy: nil)
      @usage_api.get_discount_line_items(usageEntityId:, product:, sku:, year:, month:, day:, hour:, billingPeriod:, orgId:, repoId:, groupBy:)
    end

    def get_net_usage_line_items(usageEntityId:, product: '', sku: '', year: nil, month: nil, day: nil, hour: nil, billingPeriod: nil, orgId: nil, repoId: nil, groupBy: nil)
      @usage_api.get_net_usage_line_items(usageEntityId:, product:, sku:, year:, month:, day:, hour:, billingPeriod:, orgId:, repoId:, groupBy:)
    end

    def get_repo_usage(usageEntityId:, year: nil, month: nil, day: nil, hour: nil, billingPeriod: nil)
      @usage_api.get_repo_usage(usageEntityId:, year:, month:, day:, hour:, billingPeriod:)
    end

    def get_invoice(customerId:, year:, month:)
      @usage_api.get_invoice(customerId:, year:, month:)
    end

    def get_watermark_level(usageEntityId:, sku:, repoId:, orgId:)
      @usage_api.get_watermark_level(usageEntityId:, sku:, repoId:, orgId:)
    end

    def get_usage_chart_data(usageEntityId:, product: '', sku: '', year: nil, month: nil, day: nil, hour: nil, billingPeriod: nil, orgId: nil, repoId: nil, groupBy: nil, costCenterId: nil, filteredOrgs: nil, filteredRepos: nil)
      @usage_api.get_usage_chart_data(usageEntityId:, product:, sku:, year:, month:, day:, hour:, billingPeriod:, orgId:, repoId:, groupBy:, costCenterId:, filteredOrgs:, filteredRepos:)
    end

    ### Invoice API

    def get_invoices(customerId:)
      @invoice_api.get_invoices(customerId:)
    end

    ### Subscriptions API
    def get_subscribed_item(usageEntityId:, subscriptionId:, sku:)
      @subscriptions_api.get_subscribed_item(usageEntityId:, subscriptionId:, sku:)
    end

    def get_subscribed_items(usageEntityId:, sku:)
      @subscriptions_api.get_subscribed_items(usageEntityId:, sku:)
    end

    def get_active_subscribed_items(usageEntityId:, sku:)
      @subscriptions_api.get_active_subscribed_items(usageEntityId:, sku:)
    end

    def get_subscribed_items_total(usageEntityId:, sku:)
      @subscriptions_api.get_subscribed_items_total(usageEntityId:, sku:)
    end
    def get_subscribed_items_monthly_total(usageEntityId:, sku:, year:, month:)
      @subscriptions_api.get_subscribed_items_monthly_total(usageEntityId:, sku:, year:, month:)
    end
    def add_license(sku:, subscriptionAt:, entityDetail:)
      @subscriptions_api.add_license(sku:, subscriptionAt:, entityDetail:)
    end
    def remove_license(sku:, subscriptionAt:, entityDetail:)
      @subscriptions_api.remove_license(sku:, subscriptionAt:, entityDetail:)
    end
    ### Usage Report API

    def get_usage_report(usageEntityId:, year: nil, month: nil, day: nil, hour: nil, billingPeriod: nil, includeCostCenterUsage: false)
      @usage_report_api.get_usage_report(usageEntityId:, year:, month:, day:, hour:, billingPeriod:, includeCostCenterUsage:)
    end

    def queue_usage_report_export(customerId:, startDate:, endDate:, actorId:, organizationIds:)
      @usage_report_api.queue_usage_report_export(customerId:, startDate:, endDate:, actorId:, organizationIds:)
    end

    private

    attr_reader :url

    def inferred_env
      if !ENV["HEAVEN_DEPLOYED_ENV"].nil?
        return :production if ENV["HEAVEN_DEPLOYED_ENV"].match?(/\A(?:production|prod|review-lab)\b/)
        return :staging if ENV["HEAVEN_DEPLOYED_ENV"].match?(/\Astaging\b/)
      end
      env = ENV.fetch("RAILS_ENV") { ENV.fetch("RACK_ENV", "development") }
      env.to_sym
    end

    def default_host_mapping
      @default_host_mapping ||= {
        development: "http://localhost:8989",
        staging: "https://billing-platform-staging.service.iad.github.net",
        production: "https://billing-platform-production.service.iad.github.net",
      }
    end

    def setup_default_connection(&blk)
      Faraday.new(url: url) do |conn|
        configure_connection(conn, &blk)

        conn.adapter Faraday.default_adapter
      end
    end

    def configure_connection(conn, &blk)
      conn.headers = conn.headers.merge(default_headers)
      conn.use BillingPlatform::Twirp::HMAC::RequestSigningMiddleware, @hmac_key
      yield(conn) if blk
      conn
    end

    def default_headers
      @default_headers ||= { "User-Agent" => "BillingPlatform client v#{BillingPlatform::VERSION}" }
    end
  end
end
