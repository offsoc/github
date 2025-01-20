# typed: true

class SourceImportMailer < ApplicationMailer
  extend T::Sig

  sig {
    params(options: Hash).
    returns(ActionMailer::MessageDelivery)
   }
  def self.import_success(options); end

  sig {
    params(options: Hash).
    returns(ActionMailer::MessageDelivery)
   }
  def self.import_failure(options); end
end
