RSpec.describe BillingPlatform::Client do
  include TwirpTestHelpers

  context "UsageApi" do
    describe "#get_top_org_repo_usage_line_items" do
      let(:request_params) do
        {
          customerId: 123,
          limit: 5,
          year: 2023,
          month: 2,
          day: 7,
          hour: 14,
          billingPeriod: :Hourly,
          groupBy: :NoGroupBy,
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.UsageApi", "GetTopOrgRepoUsageLineItems")
          .with(twirp_request(
            "billing_platform.api.v1.TopOrgRepoUsageRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.TopOrgRepoUsageResponse",
          )
      end

      it "calls TopUsageLineItems endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_top_org_repo_usage_line_items(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::TopOrgRepoUsageResponse
      end
    end

    describe "#get_usage_total" do
      param_test_cases = [
        [
          "all params",
          {
            usageEntityId: "123",
            sku: "actions_linux_64_core",
            year: 2023,
            month: 2,
            day: 7,
            hour: 14,
            billingPeriod: :Hourly
          }
        ],
        [
          "missing sku",
          {
            usageEntityId: "123",
            year: 2023,
            month: 2,
            day: 7,
            hour: 14,
            billingPeriod: :Hourly
          }
        ],
        [
          "missing hour",
          {
            usageEntityId: "123",
            sku: "actions_linux_64_core",
            year: 2023,
            month: 2,
            day: 7,
            billingPeriod: :Hourly
          }
        ],
        [
          "missing billingPeriod",
          {
            usageEntityId: "123",
            sku: "actions_linux_64_core",
            year: 2023,
            month: 2,
            day: 7,
            hour: 14,
          }
        ]
      ]

      param_test_cases.each do |test_case, params|
        it "calls UsageAPI endpoint - #{test_case}" do
          stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.UsageApi", "GetUsageTotal")
          .with(twirp_request(
            "billing_platform.api.v1.GetUsageRequest",
            **params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetUsageResponse",
            sku: "actions_linux_64_core",
            quantity: 123,
            billableAmount: 5.99
          )
          response = described_class.new(hmac_key: "billing-platform").get_usage_total(**params)

          expect(response.data.sku).to eq "actions_linux_64_core"
          expect(response.data.quantity).to eq 123
          expect(response.data.billableAmount).to eq 5.99
        end
      end
    end

    describe "#get_discount_total" do
      let(:request_params) do
        {
          usageEntityId: "123",
          sku: "actions_linux_64_core",
          year: 2023,
          month: 2,
          day: 7,
          hour: 14,
          billingPeriod: :Hourly
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.UsageApi", "GetDiscountTotal")
          .with(twirp_request(
            "billing_platform.api.v1.GetUsageRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetUsageResponse",
          )
      end

      it "calls UsageAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_discount_total(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetDiscountTotalResponse
      end
    end

    describe "#get_usage_line_items" do
      param_test_cases = [
        [
          "all params",
          {
            usageEntityId: "123",
            sku: "actions_linux_64_core",
            orgId: 100,
            repoId: 123,
            year: 2023,
            month: 2,
            day: 7,
            hour: 14,
            billingPeriod: :Hourly,
            groupBy: :NoGroupBy
          }
        ],
        [
          "missing sku",
          {
            usageEntityId: "123",
            year: 2023,
            month: 2,
            day: 7,
            hour: 14,
            billingPeriod: :Hourly
          }
        ],
        [
          "missing hour",
          {
            usageEntityId: "123",
            sku: "actions_linux_64_core",
            year: 2023,
            month: 2,
            day: 7,
            billingPeriod: :Hourly
          }
        ],
        [
          "missing billingPeriod",
          {
            usageEntityId: "123",
            sku: "actions_linux_64_core",
            year: 2023,
            month: 2,
            day: 7,
            hour: 14,
          }
        ],
        [
          "missing org id",
          {
            usageEntityId: "123",
            repoId: 100,
            year: 2023,
            month: 2,
            day: 7,
            hour: 14,
          }
        ],
        [
          "missing repo id",
          {
            usageEntityId: "123",
            orgId: 102,
            year: 2023,
            month: 2,
            day: 7,
            hour: 14,
          }
        ]
      ]

      param_test_cases.each do |test_case, params|
        it "calls UsageAPI endpoint - #{test_case}" do
          stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.UsageApi", "GetUsageLineItems")
          .with(twirp_request(
            "billing_platform.api.v1.GetUsageRequest",
            **params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetUsageLineItemsResponse",
          )

          response = described_class.new(hmac_key: "billing-platform").get_usage_line_items(**params)

          expect(response.data.class).to eq BillingPlatform::Api::V1::GetUsageLineItemsResponse
        end
      end
    end

    describe "#get_invoice" do
      let(:request_params) do
        {
          customerId: "123",
          year: 2023,
          month: 2
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.UsageApi", "GetInvoice")
          .with(twirp_request(
            "billing_platform.api.v1.GetInvoiceRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetInvoiceResponse"
          )
      end

      it "calls UsageAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_invoice(**request_params)

        expect(response.data.invoice).to be_nil
      end
    end

    describe "#get_watermark_level" do
      let(:request_params) do
          {
            usageEntityId: "123",
            sku: "actions_storage",
            orgId: 15,
            repoId: 456
          }
      end

      it "calls UsageAPI endpoint" do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.UsageApi", "GetWatermarkLevel")
        .with(twirp_request(
          "billing_platform.api.v1.GetWatermarkLevelRequest",
          **request_params,
        ))
        .to_return twirp_response(
          "billing_platform.api.v1.GetWatermarkLevelResponse",
          sku: "actions_storage",
          quantity: 123,
        )
        response = described_class.new(hmac_key: "billing-platform").get_watermark_level(**request_params)

        expect(response.data.sku).to eq "actions_storage"
        expect(response.data.quantity).to eq 123
      end
    end
  end
end
