class Zuorest::Model::Invoice < Zuorest::Model::Base
  # Uses an older API that's no longer recommended by Zuora
  # https://www.zuora.com/developer/api-references/older-api/operation/Object_GETInvoice/
  zuora_rest_namespace "/v1/object/invoice/", reformatter: :from_crud_format

  # The data that comes back from /object/invoice API is in an uglier format
  # than the data that comes from /transactions/invoices/accounts
  # This method translates between those structures
  # Unfortunately, a few fields are missing from this API
  def self.from_crud_format(data)
    {
      "accountId": data["AccountId"],
      "accountNumber": nil, # Not available
      "accountName": nil,   # Not available
      "adjustmentAmount": data["AdjustmentAmount"],
      "amount": data["Amount"],
      "balance": data["Balance"],
      "body": data["Body"],
      "createdBy": data["CreatedById"],
      "creditBalanceAdjustmentAmount": data["CreditBalanceAdjustmentAmount"],
      "dueDate": data["DueDate"],
      "id": data["Id"],
      "invoiceDate": data["InvoiceDate"],
      "invoiceFiles": nil, # Not available
      "invoiceItems": nil, # Not available
      "invoiceNumber": data["InvoiceNumber"],
      "invoiceTargetDate": data["TargetDate"],
      "paymentAmount": data["PaymentAmount"],
      "status": data["Status"],
    }
  end

  # An invoice may have more than one invoiceItem with the same "unit of measure"
  # This returns the total count for all the items of that unit
  # Unfortunately this only works if you get to the invoice via an API other than the CRUD API
  # for example, via Account#invoices
  def total_of_unit(unit)
    invoice_items = self[:invoiceItems]
    return nil unless invoice_items
    items_of_type = invoice_items.select{|item| item[:unitOfMeasure] == unit}
    items_of_type.sum{|item| item[:quantity]}
  end
end
