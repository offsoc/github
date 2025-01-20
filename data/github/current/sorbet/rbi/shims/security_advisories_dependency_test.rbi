# typed: true

# This file is a shim for SecurityAdvisoriesDependencyTest which inherits from Api::SerializerTestCase. If the method names are ever changed in Api::Serializer, they will need to change here as well.

class SecurityAdvisorySerializerTest
  sig { params(advisory: T.nilable(SecurityAdvisory), use_medium_severity: T.nilable(T::Boolean)).returns(Hash) }
  def security_advisory(advisory, use_medium_severity: nil); end

  sig { params(vulnerability: T.nilable(SecurityVulnerability)).returns(Hash) }
  def security_vulnerability(vulnerability); end
end
