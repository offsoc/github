RSpec.describe BillingPlatform::Client do
  include TwirpTestHelpers

  context "SubscriptionsApi" do
    describe "#get_subscribed_item" do
      let(:request_params) do
        {
          usageEntityId: "123",
          subscriptionId: 456,
          sku: "some_subscription",
        }

      end

      it "calls GetSubsribedItem endpoint" do

        subscribed_item_params = {
          subscriptionId: 1,
          status: :Active,
          subscribedAt: 3,
          lastBilledForAt: 4
        }
        subscribed_item = BillingPlatform::Api::V1::SubscribedItem.new(subscribed_item_params)

        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.SubscriptionsApi", "GetSubscribedItem")
          .with(twirp_request(
            "billing_platform.api.v1.GetSubscribedItemRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetSubscribedItemResponse",
            subscribedItem: subscribed_item,
          )

        response = described_class.new(hmac_key: "billing-platform").get_subscribed_item(**request_params)
        expect(response.data.subscribedItem).to eq subscribed_item
      end
    end

    describe "#get_subscribed_items" do
      let(:request_params) do
        {
          usageEntityId: "123",
          sku: "some_subscription",
        }

      end

      it "calls GetSubsribedItems endpoint" do

        subscribed_item_params = {
          subscriptionId: 1,
          status: :Active,
          subscribedAt: 3,
          lastBilledForAt: 4
        }
        subscribed_item = BillingPlatform::Api::V1::SubscribedItem.new(subscribed_item_params)

        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.SubscriptionsApi", "GetSubscribedItems")
          .with(twirp_request(
            "billing_platform.api.v1.GetSubscribedItemsRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetSubscribedItemsResponse",
            subscribedItems: [subscribed_item],
          )

        response = described_class.new(hmac_key: "billing-platform").get_subscribed_items(**request_params)
        expect(response.data.subscribedItems).to eq [subscribed_item]
      end
    end

    describe "#get_active_subscribed_items" do
      let(:request_params) do
        {
          usageEntityId: "123",
          sku: "some_subscription",
        }

      end

      it "calls GetActiveSubscribedItems endpoint" do
        subscribed_item_params = {
          subscriptionId: 1,
          status: :Active,
          subscribedAt: 3,
          lastBilledForAt: 4
        }
        subscribed_item = BillingPlatform::Api::V1::SubscribedItem.new(subscribed_item_params)

        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.SubscriptionsApi", "GetActiveSubscribedItems")
          .with(twirp_request(
            "billing_platform.api.v1.GetSubscribedItemsRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetSubscribedItemsResponse",
            subscribedItems: [subscribed_item],
          )

        response = described_class.new(hmac_key: "billing-platform").get_active_subscribed_items(**request_params)
        expect(response.data.subscribedItems).to eq [subscribed_item]
      end
    end

    describe "#get_subscribed_items_total" do
      let(:request_params) do
        {
          usageEntityId: "123",
          sku: "some_subscription",
        }
      end

      it "calls GetSubsribedItemsTotal endpoint" do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.SubscriptionsApi", "GetSubscribedItemsTotal")
          .with(twirp_request(
            "billing_platform.api.v1.GetSubscribedItemsRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetSubscribedItemsTotalResponse",
            quantity: 10,
          billedAmount: 45.5
          )

        response = described_class.new(hmac_key: "billing-platform").get_subscribed_items_total(**request_params)
        expect(response.data.quantity).to eq 10
        expect(response.data.billedAmount).to eq 45.5
      end
    end

    describe "#get_subscribed_items_monthly_total" do
      let(:request_params) do
        {
          usageEntityId: "123",
          sku: "some_subscription",
          year: 1968,
          month: 3
        }
      end

      it "calls GetSubscribedItemsMonthlyTotal endpoint" do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.SubscriptionsApi", "GetSubscribedItemsMonthlyTotal")
          .with(twirp_request(
            "billing_platform.api.v1.GetSubscribedItemsMonthlyTotalRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetSubscribedItemsTotalResponse",
            quantity: 10,
          billedAmount: 45.5
          )

          response = described_class.new(hmac_key: "billing-platform").get_subscribed_items_monthly_total(**request_params)
          expect(response.data.quantity).to eq 10
          expect(response.data.billedAmount).to eq 45.5
      end
    end

    describe "#add_license" do
      let(:request_params) do
        {
          sku: "some_subscription",
          subscriptionAt: 323,
          entityDetail: {
            customerId: "123",
            actorId: 238
          }
        }
      end

      it "calls AddLicense endpoint" do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.SubscriptionsApi", "AddLicense")
          .with(twirp_request(
            "billing_platform.api.v1.LicenseRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.LicenseResponse",
            isValidForBilling: true,
          )

          response = described_class.new(hmac_key: "billing-platform").add_license(**request_params)
          expect(response.data.isValidForBilling).to eq true
      end
    end

    describe "#remove_license" do
      let(:request_params) do
        {
          sku: "some_subscription",
          subscriptionAt: 323,
          entityDetail: {
            customerId: "123",
            actorId: 238
          }
        }
      end

      it "calls RemoveLicense endpoint" do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.SubscriptionsApi", "RemoveLicense")
          .with(twirp_request(
            "billing_platform.api.v1.LicenseRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.LicenseResponse",
            isValidForBilling: false,
          )

          response = described_class.new(hmac_key: "billing-platform").remove_license(**request_params)
          expect(response.data.isValidForBilling).to eq false
      end
    end
  end
end
