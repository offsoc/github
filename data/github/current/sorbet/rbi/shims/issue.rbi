# typed: strict

class Issue
  # TODO: spammy? is defined dynamically on include by the Spam::Spamable module.
  # We should make that method definition static eventually, but for now ...
  sig { returns(T::Boolean) }
  def spammy?; end

  ###
  # We cast the `compressed_body` attribute to a `CompressedString`, so our Tapioca Compiler can't determine the type correctly.
  # Adding a shim here for body and compressed_body so that these methods have type information.
  sig { returns(T.nilable(String)) }
  def compressed_body; end;

  sig { returns(T.nilable(String)) }
  def body; end;
  ###
end
