RSpec.describe BillingPlatform::Client do
  include TwirpTestHelpers

  context "CustomerApi" do
    describe "#create_or_update_customer" do
      let(:request_params) do
        {
          customer: {
            customerId: "123",
            billingTarget: "Zuora",
            zuoraAccountId: "234",
            zuoraAccountNumber: "A345",
          }
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "UpsertCustomer")
          .with(twirp_request(
            "billing_platform.api.v1.CreateCustomerRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.CreateCustomerResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").create_or_update_customer(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::CreateCustomerResponse
      end
    end

    describe "#create_or_patch_customer" do
      let(:request_params) do
        {
          customer: {
            customerId: "123",
            billingTarget: "Zuora",
            zuoraAccountNumber: "A345",
          }
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "PatchCustomer")
          .with(twirp_request(
            "billing_platform.api.v1.PatchCustomerRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.PatchCustomerResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").create_or_patch_customer(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::PatchCustomerResponse
      end
    end

    describe "#get_customer" do
      let(:request_params) do
        {
          customerId: "123",
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "GetCustomer")
          .with(twirp_request(
            "billing_platform.api.v1.GetCustomerRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetCustomerResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_customer(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetCustomerResponse
      end
    end

    describe "#get_customers" do
      let(:request_params) do
        {
          customerIds: ["123", "345"]
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "GetCustomers")
          .with(twirp_request(
            "billing_platform.api.v1.GetCustomersRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetCustomersResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_customers(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetCustomersResponse
      end
    end

    describe "#create_or_update_budget" do
      let(:request_params) do
        {
          budget: {
            key: {
              customerId: "123",
            },
            targetAmount: 100.00,
            budgetLimitType: :AlertingOnly,
          }
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "UpsertBudget")
          .with(twirp_request(
            "billing_platform.api.v1.UpsertBudgetRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.UpsertBudgetResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").create_or_update_budget(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::UpsertBudgetResponse
      end
    end

    describe "#get_budget" do
      let(:request_params) do
        {
          key: {
            customerId: "123",
          },
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "GetBudget")
          .with(twirp_request(
            "billing_platform.api.v1.GetBudgetRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetBudgetResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_budget(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetBudgetResponse
      end
    end

    describe "#get_budget_by_uuid" do
      let(:request_params) do
        {
          customerId: "123",
          uuid: "123-123"
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "GetBudgetByUuid")
          .with(twirp_request(
            "billing_platform.api.v1.GetBudgetByUuidRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetBudgetByUuidResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_budget_by_uuid(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetBudgetByUuidResponse
      end
    end

    describe "#delete_budget" do
      let(:request_params) do
        {
          customerId: "123",
          uuid: "123-123"
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "DeleteBudget")
          .with(twirp_request(
            "billing_platform.api.v1.DeleteBudgetRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.DeleteBudgetResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").delete_budget(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::DeleteBudgetResponse
      end
    end

    describe "#get_all_budgets" do
      let(:request_params) do
        {
          customerId: "123",
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "GetAllBudgets")
          .with(twirp_request(
            "billing_platform.api.v1.GetAllBudgetsRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetAllBudgetsResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_all_budgets(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetAllBudgetsResponse
      end
    end

    describe "#get_budget_state" do
      let(:request_params) do
        {
          key: {
            customerId: "123",
          },
          year: 2023,
          month: 1,
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "GetBudgetState")
          .with(twirp_request(
            "billing_platform.api.v1.GetBudgetStateRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetBudgetStateResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_budget_state(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetBudgetStateResponse
      end
    end

    describe "#can_proceed_with_usage" do
      let(:request_params) do
        {
          usageKey: {
            sku: "sku",
            product: "product",
            quantity: 1,
            usageAt: Time.now.to_i,
            entityDetail: {
              customerId: "123"
            }
          },
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "CanProceedWithUsage")
          .with(twirp_request(
            "billing_platform.api.v1.CanProceedWithUsageRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.CanProceedWithUsageResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").can_proceed_with_usage(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::CanProceedWithUsageResponse
      end
    end

    describe "#get_discount" do
      let(:request_params) do
        {
          key: {
            customerId: "123",
            uuid: "3ace09d2-f888-11ed-b67e-0242ac120002"
          },
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "GetDiscount")
          .with(twirp_request(
            "billing_platform.api.v1.GetDiscountRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetDiscountResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_discount(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetDiscountResponse
      end
    end

    describe "#get_all_discounts" do
      let(:request_params) do
        {
          customerId: "123",
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "GetAllDiscounts")
          .with(twirp_request(
            "billing_platform.api.v1.GetAllDiscountsRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetAllDiscountsResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_all_discounts(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetAllDiscountsResponse
      end
    end

    describe "#create_discount" do
      let(:request_params) do
        {
          discount: {
            customerId: "123",
            targets: [],
            percentage: 10.5,
            targetAmount: 0,
            uuid: ""
          }
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "CreateDiscount")
          .with(twirp_request(
            "billing_platform.api.v1.CreateDiscountRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.CreateDiscountResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").create_discount(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::CreateDiscountResponse
      end
    end

    describe "#get_discount_state" do
      let(:request_params) do
        {
          key: {
            customerId: "123",
            uuid: "3ace09d2-f888-11ed-b67e-0242ac120002"
          },
          year: 2023,
          month: 1,
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CustomerApi", "GetDiscountState")
          .with(twirp_request(
            "billing_platform.api.v1.GetDiscountStateRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetDiscountStateResponse",
          )
      end

      it "calls CustomerAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_discount_state(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetDiscountStateResponse
      end
    end
  end
end
