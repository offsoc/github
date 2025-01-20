RSpec.describe BillingPlatform::Client do
  include TwirpTestHelpers

  context "InvoiceApi" do
    describe "#get_invoices" do
      let(:request_params) do
        {
          customerId: "123",
        }
      end

      before do
        stub_twirp_rpc("http://localhost:8989/twirp", "billing_platform.api.v1.InvoiceAPI", "GetInvoices")
          .with(twirp_request(
            "billing_platform.api.v1.GetInvoicesRequest",
            **request_params,
          ))
          .to_return twirp_response(
            "billing_platform.api.v1.GetInvoicesResponse"
          )
      end

      it "calls InvoiceAPI endpoint" do
        response = described_class.new(hmac_key: "billing-platform").get_invoices(**request_params)

        expect(response.data.invoices).to be_empty
      end
    end
  end
end
