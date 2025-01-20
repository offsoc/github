module Zuorest::InvoiceCollect
  def create_invoice_collect(body, headers = {})
    post("/v1/operations/invoice-collect", body:, headers:)
  end
end
