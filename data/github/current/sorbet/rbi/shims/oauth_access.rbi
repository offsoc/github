# typed: true

class OauthAccess

  # dynamically defined in GitHub::UtcTimestamp::ClassMethods
  sig { returns(T.nilable(Time)) }
  def expires_at; end

  sig { params(time: T.nilable(Time)).returns(T.nilable(Time)) }
  def expires_at=(time); end
end
