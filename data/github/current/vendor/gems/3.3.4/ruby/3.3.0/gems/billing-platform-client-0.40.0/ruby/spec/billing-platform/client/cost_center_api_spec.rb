RSpec.describe BillingPlatform::Client do
  include TwirpTestHelpers

  context "CostCenterApi" do
    describe "#get_all_cost_centers" do
      let(:request_params) do
        {
          customerId: "123",
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CostCenterApi", "GetAllCostCenters")
          .with(twirp_request(
            "billing_platform.api.v1.GetAllCostCentersRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetAllCostCentersResponse",
          )
      end

      it "calls CostCenterAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_all_cost_centers(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetAllCostCentersResponse
      end
    end

    describe "#get_cost_center" do
      let(:request_params) do
        {
          costCenterKey: {
            customerId: "123",
          },
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CostCenterApi", "GetCostCenter")
          .with(twirp_request(
            "billing_platform.api.v1.GetCostCenterRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetCostCenterResponse",
          )
      end

      it "calls CostCenterAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_cost_center(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetCostCenterResponse
      end
    end

    describe "#find_cost_center_for" do
      let(:request_params) do
        {
          entityDetail: {
            customerId: "123",
          },
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CostCenterApi", "FindFor")
          .with(twirp_request(
            "billing_platform.api.v1.FindCostCenterForRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.FindCostCenterForResponse",
          )
      end

      it "calls CostCenterAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").find_cost_center_for(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::FindCostCenterForResponse
      end
    end

    describe "#create_cost_center" do
      let(:request_params) do
        {
          customerId: "123",
          targetId: "",
          targetType: BillingPlatform::Api::V1::CostCenterType::AzureSubscription,
          name: "Test cost center",
          resources: [
            { id: "123", type: BillingPlatform::Base::ResourceType::Org },
          ],
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CostCenterApi", "CreateCostCenter")
          .with(twirp_request(
            "billing_platform.api.v1.CreateCostCenterRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.CreateCostCenterResponse",
          )
      end

      it "calls CostCenterAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").create_cost_center(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::CreateCostCenterResponse
      end
    end

    describe "#update_cost_center" do
      let(:request_params) do
        {
          key: {
            customerId: "123",
            uuid: "123-asd",
          },
          targetId: "az-123",
          name: "Test cost center",
          resourcesToAdd: [
            { id: "repo-123", type: BillingPlatform::Base::ResourceType::Repo }
          ],
          resourcesToRemove: [
            { id: "org-123", type: BillingPlatform::Base::ResourceType::Org }
          ],
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CostCenterApi", "UpdateCostCenter")
          .with(twirp_request(
            "billing_platform.api.v1.UpdateCostCenterRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.UpdateCostCenterResponse",
          )
      end

      it "calls CostCenterAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").update_cost_center(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::UpdateCostCenterResponse
      end
    end

    describe "#add_resource_to" do
      let(:request_params) do
        {
          key: {
            customerId: "123",
          },
          resources: [{
            id: "some-resource",
            type: :User,
          }]
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CostCenterApi", "AddResourceTo")
          .with(twirp_request(
            "billing_platform.api.v1.AddResourceToCostCenterRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.AddResourceToCostCenterResponse",
          )
      end

      it "calls CostCenterAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").add_resource_to_cost_center(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::AddResourceToCostCenterResponse
      end
    end

    describe "#remove_resource_from" do
      let(:request_params) do
        {
          key: {
            customerId: "123",
          },
          resources: [{
            id: "some-resource",
            type: :User,
          }]
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CostCenterApi", "RemoveResourceFrom")
          .with(twirp_request(
            "billing_platform.api.v1.RemoveResourceFromCostCenterRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.RemoveResourceFromCostCenterResponse",
          )
      end

      it "calls CostCenterAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").remove_resource_from_cost_center(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::RemoveResourceFromCostCenterResponse
      end
    end

    describe "#archive_cost_center" do
      let(:request_params) do
        {
          costCenterKey: {
            customerId: "123",
          },
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.CostCenterApi", "ArchiveCostCenter")
          .with(twirp_request(
            "billing_platform.api.v1.ArchiveCostCenterRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.ArchiveCostCenterResponse",
          )
      end

      it "calls CostCenterAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").archive_cost_center(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::ArchiveCostCenterResponse
      end
    end
  end
end
