# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `oa-enterprise` gem.
# Please instead update this file by running `bin/tapioca gem oa-enterprise`.

# source://oa-enterprise//lib/omniauth/enterprise.rb#3
module OmniAuth
  class << self
    # source://oa-core/0.3.2.g3930d46/lib/omniauth/core.rb#81
    def config; end

    # source://oa-core/0.3.2.g3930d46/lib/omniauth/core.rb#85
    def configure; end

    # source://oa-core/0.3.2.g3930d46/lib/omniauth/core.rb#89
    def mock_auth_for(provider); end

    # source://oa-core/0.3.2.g3930d46/lib/omniauth/core.rb#12
    def strategies; end
  end
end

# source://oa-enterprise//lib/omniauth/enterprise.rb#4
module OmniAuth::Strategies; end

# source://oa-enterprise//lib/omniauth/strategies/cas.rb#5
class OmniAuth::Strategies::CAS
  include ::OmniAuth::Strategy

  # @return [CAS] a new instance of CAS
  #
  # source://oa-enterprise//lib/omniauth/strategies/cas.rb#11
  def initialize(app, options = T.unsafe(nil), &block); end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def app; end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def env; end

  def find_user(uid); end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def name; end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def options; end

  def reconcile_access(user); end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def response; end

  protected

  # source://oa-enterprise//lib/omniauth/strategies/cas.rb#38
  def auth_hash; end

  def callback_phase; end
  def callback_phase_prelude; end

  # source://oa-enterprise//lib/omniauth/strategies/cas.rb#18
  def request_phase; end
end

# source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#6
class OmniAuth::Strategies::CAS::Configuration
  # @option params
  # @option params
  # @option params
  # @option params
  # @param params [Hash] configuration options
  # @return [Configuration] a new instance of Configuration
  #
  # source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#23
  def initialize(params); end

  # @return [Boolean]
  #
  # source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#51
  def disable_ssl_verification?; end

  # Build a CAS login URL from +service+.
  #
  # @param service [String] the service (a.k.a. return-to) URL
  # @return [String] a URL like `http://cas.mycompany.com/login?service=...`
  #
  # source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#32
  def login_url(service); end

  # Build a service-validation URL from +service+ and +ticket+.
  # If +service+ has a ticket param, first remove it. URL-encode
  # +service+ and add it and the +ticket+ as paraemters to the
  # CAS serviceValidate URL.
  #
  # @param service [String] the service (a.k.a. return-to) URL
  # @param ticket [String] the ticket to validate
  # @return [String] a URL like `http://cas.mycompany.com/serviceValidate?service=...&ticket=...`
  #
  # source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#45
  def service_validate_url(service, ticket); end

  private

  # Adds +service+ as an URL-escaped parameter to +base+.
  #
  # @param base [String] the base URL
  # @param service [String] the service (a.k.a. return-to) URL.
  # @return [String] the new joined URL.
  #
  # source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#88
  def append_service(base, service); end

  # source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#57
  def parse_params(params); end

  # @raise [ArgumentError]
  #
  # source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#77
  def validate_is_url(name, possibly_a_url); end
end

# source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#8
OmniAuth::Strategies::CAS::Configuration::DEFAULT_LOGIN_URL = T.let(T.unsafe(nil), String)

# source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#10
OmniAuth::Strategies::CAS::Configuration::DEFAULT_SERVICE_VALIDATE_URL = T.let(T.unsafe(nil), String)

# source://oa-enterprise//lib/omniauth/strategies/cas/configuration.rb#75
OmniAuth::Strategies::CAS::Configuration::IS_NOT_URL_ERROR_MESSAGE = T.let(T.unsafe(nil), String)

# source://oa-enterprise//lib/omniauth/strategies/cas/service_ticket_validator.rb#8
class OmniAuth::Strategies::CAS::ServiceTicketValidator
  # Build a validator from a +configuration+, a
  # +return_to+ URL, and a +ticket+.
  #
  # @param configuration [OmniAuth::Strategies::CAS::Configuration] the CAS configuration
  # @param return_to_url [String] the URL of this CAS client service
  # @param ticket [String] the service ticket to validate
  # @return [ServiceTicketValidator] a new instance of ServiceTicketValidator
  def initialize(configuration, return_to_url, ticket); end

  # Request validation of the ticket from the CAS server's
  # serviceValidate (CAS 2.0) function.
  #
  # Swallows all XML parsing errors (and returns +nil+ in those cases).
  #
  # @raise any connection errors encountered.
  # @return [Hash, nil] a user information hash if the response is valid; +nil+ otherwise.
  def user_info; end

  private

  # finds an `<cas:authenticationSuccess>` node in
  # a `<cas:serviceResponse>` body if present; returns nil
  # if the passed body is nil or if there is no such node.
  #
  # source://oa-enterprise//lib/omniauth/strategies/cas/service_ticket_validator.rb#61
  def find_authentication_success(body); end

  # retrieves the `<cas:serviceResponse>` XML from the CAS server
  #
  # source://oa-enterprise//lib/omniauth/strategies/cas/service_ticket_validator.rb#76
  def get_service_response_body; end

  # turns an `<cas:authenticationSuccess>` node into a Hash;
  # returns nil if given nil
  #
  # source://oa-enterprise//lib/omniauth/strategies/cas/service_ticket_validator.rb#39
  def parse_user_info(node); end
end

# source://oa-enterprise//lib/omniauth/strategies/cas/service_ticket_validator.rb#10
OmniAuth::Strategies::CAS::ServiceTicketValidator::VALIDATION_REQUEST_HEADERS = T.let(T.unsafe(nil), Hash)

# source://oa-enterprise//lib/omniauth/strategies/ldap.rb#8
class OmniAuth::Strategies::LDAP
  include ::OmniAuth::Strategy

  # Initialize the LDAP Middleware
  #
  # @option options
  # @param app [Rack Application] Standard Rack middleware argument.
  # @param options [Hash] a customizable set of options
  # @return [LDAP] a new instance of LDAP
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap.rb#32
  def initialize(app, options = T.unsafe(nil), &block); end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def app; end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def env; end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def name; end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def options; end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def response; end

  protected

  # source://oa-enterprise//lib/omniauth/strategies/ldap.rb#81
  def auth_hash; end

  # source://oa-enterprise//lib/omniauth/strategies/ldap.rb#56
  def callback_phase; end

  # source://oa-enterprise//lib/omniauth/strategies/ldap.rb#49
  def get_credentials; end

  # source://oa-enterprise//lib/omniauth/strategies/ldap.rb#40
  def request_phase; end

  class << self
    # source://oa-enterprise//lib/omniauth/strategies/ldap.rb#89
    def map_user(mapper, object); end
  end
end

# source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#11
class OmniAuth::Strategies::LDAP::Adaptor
  # @raise [ArgumentError]
  # @return [Adaptor] a new instance of Adaptor
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#30
  def initialize(configuration = T.unsafe(nil)); end

  # Returns the value of attribute base.
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#28
  def base; end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#75
  def bind(options = T.unsafe(nil)); end

  # Returns the value of attribute bind_dn.
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#27
  def bind_dn; end

  # Sets the attribute bind_dn
  #
  # @param value the value to set the attribute bind_dn to.
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#27
  def bind_dn=(_arg0); end

  # @return [Boolean]
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#123
  def bound?; end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#47
  def connect(options = T.unsafe(nil)); end

  # @return [Boolean]
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#119
  def connecting?; end

  # Returns the value of attribute connection.
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#28
  def connection; end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#108
  def disconnect!(options = T.unsafe(nil)); end

  # Returns the value of attribute password.
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#27
  def password; end

  # Sets the attribute password
  #
  # @param value the value to set the attribute password to.
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#27
  def password=(_arg0); end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#114
  def rebind(options = T.unsafe(nil)); end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#127
  def search(options = T.unsafe(nil), &block); end

  # Returns the value of attribute uid.
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#28
  def uid; end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#71
  def unbind(options = T.unsafe(nil)); end

  private

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#255
  def bind_as_anonymous(options = T.unsafe(nil)); end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#260
  def construct_uri(host, port, ssl); end

  # @raise [ConfigurationError]
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#175
  def ensure_method(method); end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#164
  def ensure_port(method); end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#149
  def execute(method, *args, &block); end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#172
  def prepare_connection(options); end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#185
  def sasl_bind(bind_dn, options = T.unsafe(nil)); end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#215
  def sasl_bind_setup_digest_md5(bind_dn, options); end

  # @raise [LdapError]
  #
  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#226
  def sasl_bind_setup_gss_spnego(bind_dn, options); end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#240
  def simple_bind(bind_dn, options = T.unsafe(nil)); end

  # source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#265
  def target; end
end

# source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#14
class OmniAuth::Strategies::LDAP::Adaptor::AuthenticationError < ::StandardError; end

# source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#13
class OmniAuth::Strategies::LDAP::Adaptor::ConfigurationError < ::StandardError; end

# source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#15
class OmniAuth::Strategies::LDAP::Adaptor::ConnectionError < ::StandardError; end

# source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#12
class OmniAuth::Strategies::LDAP::Adaptor::LdapError < ::StandardError; end

# source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#21
OmniAuth::Strategies::LDAP::Adaptor::METHOD = T.let(T.unsafe(nil), Hash)

# source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#19
OmniAuth::Strategies::LDAP::Adaptor::MUST_HAVE_KEYS = T.let(T.unsafe(nil), Array)

# source://oa-enterprise//lib/omniauth/strategies/ldap/adaptor.rb#17
OmniAuth::Strategies::LDAP::Adaptor::VALID_ADAPTER_CONFIGURATION_KEYS = T.let(T.unsafe(nil), Array)

# source://oa-enterprise//lib/omniauth/strategies/saml.rb#5
class OmniAuth::Strategies::SAML
  include ::OmniAuth::Strategy

  # @return [SAML] a new instance of SAML
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml.rb#14
  def initialize(app, options = T.unsafe(nil)); end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def app; end

  # source://oa-enterprise//lib/omniauth/strategies/saml.rb#43
  def auth_hash; end

  # source://oa-enterprise//lib/omniauth/strategies/saml.rb#30
  def callback_phase; end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def env; end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def name; end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def options; end

  # source://oa-enterprise//lib/omniauth/strategies/saml.rb#25
  def request_phase; end

  # source://oa-core/0.3.2.g3930d46/lib/omniauth/strategy.rb#13
  def response; end
end

# source://oa-enterprise//lib/omniauth/strategies/saml/auth_request.rb#9
class OmniAuth::Strategies::SAML::AuthRequest
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_request.rb#11
  def create(settings, params = T.unsafe(nil)); end
end

# source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#6
class OmniAuth::Strategies::SAML::AuthResponse
  # @raise [ArgumentError]
  # @return [AuthResponse] a new instance of AuthResponse
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#14
  def initialize(response, options = T.unsafe(nil)); end

  # A hash of alle the attributes with the response. Assuming there is only one value for each key
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#39
  def attributes; end

  # Conditions (if any) for the assertion to run
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#70
  def conditions; end

  # Returns the value of attribute document.
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#12
  def document; end

  # Sets the attribute document
  #
  # @param value the value to set the attribute document to.
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#12
  def document=(_arg0); end

  # @return [Boolean]
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#21
  def is_valid?; end

  # The value of the user identifier as designated by the initialization request response
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#30
  def name_id; end

  # Returns the value of attribute options.
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#12
  def options; end

  # Sets the attribute options
  #
  # @param value the value to set the attribute options to.
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#12
  def options=(_arg0); end

  # Returns the value of attribute response.
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#12
  def response; end

  # Sets the attribute response
  #
  # @param value the value to set the attribute response to.
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#12
  def response=(_arg0); end

  # When this user session should expire at latest
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#62
  def session_expires_at; end

  # Returns the value of attribute settings.
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#12
  def settings; end

  # Sets the attribute settings
  #
  # @param value the value to set the attribute settings to.
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#12
  def settings=(_arg0); end

  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#25
  def validate!; end

  private

  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#104
  def get_fingerprint; end

  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#132
  def parse_time(node, attribute); end

  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#82
  def validate(soft = T.unsafe(nil)); end

  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#113
  def validate_conditions(soft = T.unsafe(nil)); end

  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#88
  def validate_response_state(soft = T.unsafe(nil)); end

  # @raise [OmniAuth::Strategies::SAML::ValidationError]
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#78
  def validation_error(message); end
end

# source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#8
OmniAuth::Strategies::SAML::AuthResponse::ASSERTION = T.let(T.unsafe(nil), String)

# source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#10
OmniAuth::Strategies::SAML::AuthResponse::DSIG = T.let(T.unsafe(nil), String)

# source://oa-enterprise//lib/omniauth/strategies/saml/auth_response.rb#9
OmniAuth::Strategies::SAML::AuthResponse::PROTOCOL = T.let(T.unsafe(nil), String)

# source://oa-enterprise//lib/omniauth/strategies/saml/validation_error.rb#4
class OmniAuth::Strategies::SAML::ValidationError < ::Exception; end

# source://oa-enterprise//lib/omniauth/strategies/saml/xml_security.rb#36
module OmniAuth::Strategies::SAML::XMLSecurity; end

# source://oa-enterprise//lib/omniauth/strategies/saml/xml_security.rb#38
class OmniAuth::Strategies::SAML::XMLSecurity::SignedDocument < ::REXML::Document
  # @return [SignedDocument] a new instance of SignedDocument
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/xml_security.rb#43
  def initialize(response); end

  # Returns the value of attribute signed_element_id.
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/xml_security.rb#41
  def signed_element_id; end

  # Sets the attribute signed_element_id
  #
  # @param value the value to set the attribute signed_element_id to.
  #
  # source://oa-enterprise//lib/omniauth/strategies/saml/xml_security.rb#41
  def signed_element_id=(_arg0); end

  # source://oa-enterprise//lib/omniauth/strategies/saml/xml_security.rb#48
  def validate(idp_cert_fingerprint, soft = T.unsafe(nil)); end

  # source://oa-enterprise//lib/omniauth/strategies/saml/xml_security.rb#64
  def validate_doc(base64_cert, soft = T.unsafe(nil)); end

  private

  # source://oa-enterprise//lib/omniauth/strategies/saml/xml_security.rb#117
  def extract_signed_element_id; end
end

# source://oa-enterprise//lib/omniauth/strategies/saml/xml_security.rb#39
OmniAuth::Strategies::SAML::XMLSecurity::SignedDocument::DSIG = T.let(T.unsafe(nil), String)
