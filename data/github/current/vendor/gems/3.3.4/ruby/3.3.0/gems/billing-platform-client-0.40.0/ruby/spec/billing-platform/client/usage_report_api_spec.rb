RSpec.describe BillingPlatform::Client do
  include TwirpTestHelpers

  context "UsageReportApi" do
    describe "#get_usage_report" do
      let(:request_params) do
       {
          usageEntityId: "123",
          year: 2023,
          month: 2,
          day: 7,
          hour: 14,
          billingPeriod: :Hourly,
          includeCostCenterUsage: false,
        }
      end

      it "calls UsageReportAPI endpoint" do
        stub_twirp_rpc(
          "http://localhost:8989/twirp",
          "billing_platform.api.v1.UsageReportApi",
           "GetUsageReport"
        ).with(twirp_request(
          "billing_platform.api.v1.GetUsageReportRequest",
          **request_params,
        )) .to_return twirp_response("billing_platform.api.v1.GetUsageReportResponse",)

        response = described_class.new(hmac_key: "billing-platform").get_usage_report(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::GetUsageReportResponse
      end
    end

    describe "#queue_usage_report_export" do
      let(:request_params) do
       {
          customerId: "123",
          actorId: 456,
          organizationIds: [789],
          startDate: 1714058444,
          endDate: 1714058444,
        }
      end

      it "calls QueueUsageReportExport endpoint" do
        stub_twirp_rpc(
          "http://localhost:8989/twirp",
          "billing_platform.api.v1.UsageReportApi",
           "QueueUsageReportExport"
        ).with(twirp_request(
          "billing_platform.api.v1.QueueUsageReportExportRequest",
          **request_params,
        )) .to_return twirp_response("billing_platform.api.v1.QueueUsageReportExportResponse",)

        response = described_class.new(hmac_key: "billing-platform").queue_usage_report_export(**request_params)

        expect(response.data.class).to eq BillingPlatform::Api::V1::QueueUsageReportExportResponse
      end
    end
  end
end
