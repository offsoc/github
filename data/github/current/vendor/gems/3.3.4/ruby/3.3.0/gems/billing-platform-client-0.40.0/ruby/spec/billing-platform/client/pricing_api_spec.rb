RSpec.describe BillingPlatform::Client do
  include TwirpTestHelpers

  context "PricingApi" do
    describe "#get_pricing" do
      let(:request_params) do
        {
          sku: "sku",
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.PricingApi", "GetPricing")
          .with(twirp_request(
            "billing_platform.api.v1.GetPricingRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetPricingResponse",
          )
      end

      it "calls PricingApi endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_pricing(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetPricingResponse
      end
    end

    describe "#get_pricings_by_product" do
      let(:request_params) do
        {
          productName: "product",
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.PricingApi", "GetPricingsByProduct")
          .with(twirp_request(
            "billing_platform.api.v1.GetPricingsByProductRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetPricingsByProductResponse",
          )
      end

      it "calls PricingApi endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_pricings_by_product(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetPricingsByProductResponse
      end
    end

    describe "#get_all_pricing" do
      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.PricingApi", "GetAllPricing")
          .with(twirp_request(
            "billing_platform.api.v1.GetAllPricingRequest",
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetAllPricingResponse",
          )
      end

      it "calls PricingApi endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_all_pricing

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetAllPricingResponse
      end
    end

    describe "#create_or_update_pricing" do
      let(:request_params) do
        {
          pricing: {
            sku: "sku",
            product: "product",
            price: 1,
          }
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.PricingApi", "UpsertPricing")
          .with(twirp_request(
            "billing_platform.api.v1.UpsertPricingRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.UpsertPricingResponse",
          )
      end

      it "calls PricingApi endpoint" do
        response = described_class.new(hmac_key: "billing-platform").create_or_update_pricing(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::UpsertPricingResponse
      end
    end
  end
end
