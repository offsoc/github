# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: accounts/v1/budget.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("accounts/v1/budget.proto", :syntax => :proto3) do
    add_message "billing.accounts.v1.Budget" do
      optional :enforce_spending_limit, :bool, 1
      optional :spending_limit_in_subunits, :int32, 2
      optional :spending_limit_currency_code, :string, 3
      optional :budget_id, :uint64, 4
    end
  end
end

module MonolithTwirp
  module Billing
    module Accounts
      module V1
        Budget = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing.accounts.v1.Budget").msgclass
      end
    end
  end
end
