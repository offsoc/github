# typed: true

module ActionMailer
  class MessageDelivery
    sig { returns(Mail::Part) }
    def html_part; end

    sig { returns(Mail::Part) }
    def text_part; end
  end
end
