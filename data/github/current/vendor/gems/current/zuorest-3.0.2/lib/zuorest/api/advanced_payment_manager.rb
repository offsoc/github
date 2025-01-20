module Zuorest::AdvancedPaymentManager
  # Public: Get a Zuora Advanced Payment Manager (APM) payment run
  #
  # Requires APM-specific client configuration.
  #
  # See https://www.zuora.com/developer/api-references/collections/operation/GET_PaymentRun/ for details.
  #
  # payment_run_id - String/Integer id of the APM payment run
  #
  # Returns a Hash of APM payment run details.
  def get_apm_payment_run(payment_run_id, headers = {})
    url = apm_url("/api/v1/subscription_payment_runs/#{payment_run_id}")
    get(url, headers: headers.merge(apm_auth_header))
  end

  # Public: Create a Zuora Advanced Payment Manager (APM) payment run
  #
  # Requires APM-specific client configuration.
  #
  # See https://www.zuora.com/developer/api-references/collections/operation/POST_PaymentRun/ for details.
  #
  # data - Hash of APM payment run configuration
  #
  # Returns a Hash including success/errors and APM payment run id.
  def create_apm_payment_run(body, headers = {})
    url = apm_url("/api/v1/subscription_payment_runs")
    post(url, body:, headers: headers.merge(apm_auth_header))
  end
end
