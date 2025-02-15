# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `acme-client` gem.
# Please instead update this file by running `bin/tapioca gem acme-client`.

# source://acme-client//lib/acme/client.rb#12
module Acme; end

# source://acme-client//lib/acme/client.rb#13
class Acme::Client
  # @return [Client] a new instance of Client
  #
  # source://acme-client//lib/acme/client.rb#33
  def initialize(jwk: T.unsafe(nil), kid: T.unsafe(nil), private_key: T.unsafe(nil), directory: T.unsafe(nil), connection_options: T.unsafe(nil), bad_nonce_retry: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#110
  def account; end

  # source://acme-client//lib/acme/client.rb#82
  def account_deactivate; end

  # source://acme-client//lib/acme/client.rb#88
  def account_key_change(new_private_key: T.unsafe(nil), new_jwk: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#72
  def account_update(contact: T.unsafe(nil), terms_of_service_agreed: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#173
  def authorization(url:); end

  # source://acme-client//lib/acme/client.rb#231
  def caa_identities; end

  # @raise [Acme::Client::Error::ForcedChainNotFound]
  #
  # source://acme-client//lib/acme/client.rb#153
  def certificate(url:, force_chain: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#185
  def challenge(url:); end

  # source://acme-client//lib/acme/client.rb#179
  def deactivate_authorization(url:); end

  # source://acme-client//lib/acme/client.rb#235
  def external_account_required; end

  # source://acme-client//lib/acme/client.rb#142
  def finalize(url:, csr:); end

  # source://acme-client//lib/acme/client.rb#212
  def get_nonce; end

  # Returns the value of attribute jwk.
  #
  # source://acme-client//lib/acme/client.rb#50
  def jwk; end

  # source://acme-client//lib/acme/client.rb#121
  def kid; end

  # source://acme-client//lib/acme/client.rb#219
  def meta; end

  # source://acme-client//lib/acme/client.rb#52
  def new_account(contact:, terms_of_service_agreed: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#125
  def new_order(identifiers:, not_before: T.unsafe(nil), not_after: T.unsafe(nil)); end

  # Returns the value of attribute nonces.
  #
  # source://acme-client//lib/acme/client.rb#50
  def nonces; end

  # source://acme-client//lib/acme/client.rb#136
  def order(url:); end

  # source://acme-client//lib/acme/client.rb#191
  def request_challenge_validation(url:, key_authorization: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#197
  def revoke(certificate:, reason: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#223
  def terms_of_service; end

  # source://acme-client//lib/acme/client.rb#227
  def website; end

  private

  # source://acme-client//lib/acme/client.rb#255
  def attributes_from_account_response(response); end

  # source://acme-client//lib/acme/client.rb#279
  def attributes_from_authorization_response(response); end

  # source://acme-client//lib/acme/client.rb#283
  def attributes_from_challenge_response(response); end

  # source://acme-client//lib/acme/client.rb#264
  def attributes_from_order_response(response); end

  # source://acme-client//lib/acme/client.rb#319
  def connection_for(url:, mode:); end

  # source://acme-client//lib/acme/client.rb#311
  def download(url, format:); end

  # source://acme-client//lib/acme/client.rb#356
  def endpoint_for(key); end

  # source://acme-client//lib/acme/client.rb#287
  def extract_attributes(input, *attributes); end

  # source://acme-client//lib/acme/client.rb#346
  def fetch_chain(response, limit = T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#306
  def get(url, mode: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#327
  def new_acme_connection(endpoint:, mode:); end

  # source://acme-client//lib/acme/client.rb#333
  def new_connection(endpoint:); end

  # source://acme-client//lib/acme/client.rb#296
  def post(url, payload: T.unsafe(nil), mode: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#301
  def post_as_get(url, mode: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client.rb#241
  def prepare_order_identifiers(identifiers); end
end

# source://acme-client//lib/acme/client.rb#29
Acme::Client::CONTENT_TYPES = T.let(T.unsafe(nil), Hash)

# source://acme-client//lib/acme/client/certificate_request.rb#1
class Acme::Client::CertificateRequest
  extend ::Forwardable

  # @return [CertificateRequest] a new instance of CertificateRequest
  #
  # source://acme-client//lib/acme/client/certificate_request.rb#28
  def initialize(common_name: T.unsafe(nil), names: T.unsafe(nil), private_key: T.unsafe(nil), subject: T.unsafe(nil), digest: T.unsafe(nil)); end

  # Returns the value of attribute common_name.
  #
  # source://acme-client//lib/acme/client/certificate_request.rb#24
  def common_name; end

  # source://acme-client//lib/acme/client/certificate_request.rb#39
  def csr; end

  # Returns the value of attribute names.
  #
  # source://acme-client//lib/acme/client/certificate_request.rb#24
  def names; end

  # Returns the value of attribute private_key.
  #
  # source://acme-client//lib/acme/client/certificate_request.rb#24
  def private_key; end

  # Returns the value of attribute subject.
  #
  # source://acme-client//lib/acme/client/certificate_request.rb#24
  def subject; end

  # source://forwardable/1.3.3/forwardable.rb#231
  def to_der(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def to_pem(*args, **_arg1, &block); end

  private

  # source://acme-client//lib/acme/client/certificate_request.rb#106
  def add_extension(csr); end

  # source://acme-client//lib/acme/client/certificate_request.rb#80
  def generate; end

  # source://acme-client//lib/acme/client/certificate_request.rb#45
  def generate_private_key; end

  # source://acme-client//lib/acme/client/certificate_request.rb#98
  def generate_subject; end

  # source://acme-client//lib/acme/client/certificate_request.rb#55
  def normalize_names; end

  # source://acme-client//lib/acme/client/certificate_request.rb#49
  def normalize_subject(subject); end

  # source://acme-client//lib/acme/client/certificate_request.rb#64
  def validate_subject; end

  # @raise [ArgumentError]
  #
  # source://acme-client//lib/acme/client/certificate_request.rb#69
  def validate_subject_attributes; end

  # @raise [ArgumentError]
  #
  # source://acme-client//lib/acme/client/certificate_request.rb#75
  def validate_subject_common_name; end
end

# source://acme-client//lib/acme/client/certificate_request.rb#5
Acme::Client::CertificateRequest::DEFAULT_DIGEST = OpenSSL::Digest::SHA256

# source://acme-client//lib/acme/client/certificate_request.rb#4
Acme::Client::CertificateRequest::DEFAULT_KEY_LENGTH = T.let(T.unsafe(nil), Integer)

# Class to handle bug #
#
# source://acme-client//lib/acme/client/certificate_request/ec_key_patch.rb#2
class Acme::Client::CertificateRequest::ECKeyPatch < ::OpenSSL::PKey::EC
  def private?; end
  def public?; end
end

# source://acme-client//lib/acme/client/certificate_request.rb#6
Acme::Client::CertificateRequest::SUBJECT_KEYS = T.let(T.unsafe(nil), Hash)

# source://acme-client//lib/acme/client/certificate_request.rb#15
Acme::Client::CertificateRequest::SUBJECT_TYPES = T.let(T.unsafe(nil), Hash)

# source://acme-client//lib/acme/client/chain_identifier.rb#2
class Acme::Client::ChainIdentifier
  # @return [ChainIdentifier] a new instance of ChainIdentifier
  #
  # source://acme-client//lib/acme/client/chain_identifier.rb#3
  def initialize(pem_certificate_chain); end

  # @return [Boolean]
  #
  # source://acme-client//lib/acme/client/chain_identifier.rb#7
  def match_name?(name); end

  private

  # source://acme-client//lib/acme/client/chain_identifier.rb#15
  def issuers; end

  # source://acme-client//lib/acme/client/chain_identifier.rb#23
  def splitted_pem_certificates; end

  # source://acme-client//lib/acme/client/chain_identifier.rb#19
  def x509_certificates; end
end

# source://acme-client//lib/acme/client.rb#26
Acme::Client::DEFAULT_DIRECTORY = T.let(T.unsafe(nil), String)

# source://acme-client//lib/acme/client/error.rb#1
class Acme::Client::Error < ::StandardError; end

# source://acme-client//lib/acme/client/error.rb#34
Acme::Client::Error::ACME_ERRORS = T.let(T.unsafe(nil), Hash)

# source://acme-client//lib/acme/client/error.rb#19
class Acme::Client::Error::AccountDoesNotExist < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#13
class Acme::Client::Error::BadCSR < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#14
class Acme::Client::Error::BadNonce < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#27
class Acme::Client::Error::BadRevocationReason < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#15
class Acme::Client::Error::BadSignatureAlgorithm < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#28
class Acme::Client::Error::Caa < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#9
class Acme::Client::Error::CertificateNotReady < ::Acme::Client::Error::ClientError; end

# source://acme-client//lib/acme/client/error.rb#4
class Acme::Client::Error::ClientError < ::Acme::Client::Error; end

# source://acme-client//lib/acme/client/error.rb#30
class Acme::Client::Error::Connection < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#29
class Acme::Client::Error::Dns < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#18
class Acme::Client::Error::ExternalAccountRequired < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#10
class Acme::Client::Error::ForcedChainNotFound < ::Acme::Client::Error::ClientError; end

# source://acme-client//lib/acme/client/error.rb#32
class Acme::Client::Error::IncorrectResponse < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#16
class Acme::Client::Error::InvalidContact < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#5
class Acme::Client::Error::InvalidDirectory < ::Acme::Client::Error::ClientError; end

# source://acme-client//lib/acme/client/error.rb#20
class Acme::Client::Error::Malformed < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#8
class Acme::Client::Error::NotFound < ::Acme::Client::Error::ClientError; end

# source://acme-client//lib/acme/client/error.rb#21
class Acme::Client::Error::RateLimited < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#22
class Acme::Client::Error::RejectedIdentifier < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#12
class Acme::Client::Error::ServerError < ::Acme::Client::Error; end

# source://acme-client//lib/acme/client/error.rb#23
class Acme::Client::Error::ServerInternal < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#2
class Acme::Client::Error::Timeout < ::Acme::Client::Error; end

# source://acme-client//lib/acme/client/error.rb#31
class Acme::Client::Error::Tls < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#24
class Acme::Client::Error::Unauthorized < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#7
class Acme::Client::Error::UnsupportedChallengeType < ::Acme::Client::Error::ClientError; end

# source://acme-client//lib/acme/client/error.rb#17
class Acme::Client::Error::UnsupportedContact < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#25
class Acme::Client::Error::UnsupportedIdentifier < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/error.rb#6
class Acme::Client::Error::UnsupportedOperation < ::Acme::Client::Error::ClientError; end

# source://acme-client//lib/acme/client/error.rb#26
class Acme::Client::Error::UserActionRequired < ::Acme::Client::Error::ServerError; end

# source://acme-client//lib/acme/client/faraday_middleware.rb#3
class Acme::Client::FaradayMiddleware < ::Faraday::Middleware
  # @return [FaradayMiddleware] a new instance of FaradayMiddleware
  #
  # source://acme-client//lib/acme/client/faraday_middleware.rb#8
  def initialize(app, options); end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#14
  def call(env); end

  # Returns the value of attribute client.
  #
  # source://acme-client//lib/acme/client/faraday_middleware.rb#4
  def client; end

  # Returns the value of attribute env.
  #
  # source://acme-client//lib/acme/client/faraday_middleware.rb#4
  def env; end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#28
  def on_complete(env); end

  # Returns the value of attribute response.
  #
  # source://acme-client//lib/acme/client/faraday_middleware.rb#4
  def response; end

  private

  # source://acme-client//lib/acme/client/faraday_middleware.rb#75
  def decode_body; end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#85
  def decode_link_headers; end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#65
  def error_class; end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#57
  def error_message; end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#69
  def error_name; end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#104
  def get_nonce; end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#43
  def jws_header; end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#108
  def nonces; end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#96
  def pop_nonce; end

  # @raise [error_class]
  #
  # source://acme-client//lib/acme/client/faraday_middleware.rb#53
  def raise_on_error!; end

  # @raise [Acme::Client::Error::NotFound]
  #
  # source://acme-client//lib/acme/client/faraday_middleware.rb#49
  def raise_on_not_found!; end

  # source://acme-client//lib/acme/client/faraday_middleware.rb#91
  def store_nonce; end
end

# source://acme-client//lib/acme/client/faraday_middleware.rb#6
Acme::Client::FaradayMiddleware::CONTENT_TYPE = T.let(T.unsafe(nil), String)

# source://acme-client//lib/acme/client/jwk.rb#1
module Acme::Client::JWK
  class << self
    # Make a JWK from a private key.
    #
    # private_key - An OpenSSL::PKey::EC or OpenSSL::PKey::RSA instance.
    #
    # Returns a JWK::Base subclass instance.
    #
    # source://acme-client//lib/acme/client/jwk.rb#7
    def from_private_key(private_key); end
  end
end

# source://acme-client//lib/acme/client/jwk/base.rb#1
class Acme::Client::JWK::Base
  # Initialize a new JWK.
  #
  # Returns nothing.
  #
  # @raise [NotImplementedError]
  # @return [Base] a new instance of Base
  #
  # source://acme-client//lib/acme/client/jwk/base.rb#7
  def initialize; end

  # The name of the algorithm as needed for the `alg` member of a JWS object.
  #
  # Returns a String.
  #
  # @raise [NotImplementedError]
  #
  # source://acme-client//lib/acme/client/jwk/base.rb#71
  def jwa_alg; end

  # Generate a JWS JSON web signature.
  #
  # header  - A Hash of extra header fields to include.
  # payload - A Hash of payload data.
  #
  # Returns a JSON String.
  #
  # source://acme-client//lib/acme/client/jwk/base.rb#17
  def jws(payload:, header: T.unsafe(nil)); end

  # Header fields for a JSON web signature.
  #
  # typ: - Value for the `typ` field. Default 'JWT'.
  #
  # Returns a Hash.
  #
  # source://acme-client//lib/acme/client/jwk/base.rb#59
  def jws_header(header); end

  # Sign a message with the private key.
  #
  # message - A String message to sign.
  #
  # Returns a String signature.
  #
  # @raise [NotImplementedError]
  #
  # source://acme-client//lib/acme/client/jwk/base.rb#81
  def sign(message); end

  # JWK thumbprint as used for key authorization.
  #
  # Returns a String.
  #
  # source://acme-client//lib/acme/client/jwk/base.rb#50
  def thumbprint; end

  # Get this JWK as a Hash for JSON serialization.
  #
  # Returns a Hash.
  #
  # @raise [NotImplementedError]
  #
  # source://acme-client//lib/acme/client/jwk/base.rb#43
  def to_h; end

  # Serialize this JWK as JSON.
  #
  # Returns a JSON string.
  #
  # source://acme-client//lib/acme/client/jwk/base.rb#36
  def to_json; end
end

# source://acme-client//lib/acme/client/jwk/base.rb#2
Acme::Client::JWK::Base::THUMBPRINT_DIGEST = OpenSSL::Digest::SHA256

# source://acme-client//lib/acme/client/jwk/ecdsa.rb#1
class Acme::Client::JWK::ECDSA < ::Acme::Client::JWK::Base
  # Instantiate a new ECDSA JWK.
  #
  # private_key - A OpenSSL::PKey::EC instance.
  #
  # Returns nothing.
  #
  # @return [ECDSA] a new instance of ECDSA
  #
  # source://acme-client//lib/acme/client/jwk/ecdsa.rb#27
  def initialize(private_key); end

  # The name of the algorithm as needed for the `alg` member of a JWS object.
  #
  # Returns a String.
  #
  # source://acme-client//lib/acme/client/jwk/ecdsa.rb#42
  def jwa_alg; end

  # Sign a message with the private key.
  #
  # message - A String message to sign.
  #
  # Returns a String signature.
  #
  # source://acme-client//lib/acme/client/jwk/ecdsa.rb#63
  def sign(message); end

  # Get this JWK as a Hash for JSON serialization.
  #
  # Returns a Hash.
  #
  # source://acme-client//lib/acme/client/jwk/ecdsa.rb#49
  def to_h; end

  private

  # source://acme-client//lib/acme/client/jwk/ecdsa.rb#87
  def coordinates; end

  # source://acme-client//lib/acme/client/jwk/ecdsa.rb#101
  def public_key; end
end

# JWA parameters for supported OpenSSL curves.
# https://tools.ietf.org/html/rfc7518#section-3.1
#
# source://acme-client//lib/acme/client/jwk/ecdsa.rb#4
Acme::Client::JWK::ECDSA::KNOWN_CURVES = T.let(T.unsafe(nil), Hash)

# source://acme-client//lib/acme/client/jwk/rsa.rb#1
class Acme::Client::JWK::RSA < ::Acme::Client::JWK::Base
  # Instantiate a new RSA JWK.
  #
  # private_key - A OpenSSL::PKey::RSA instance.
  #
  # Returns nothing.
  #
  # @return [RSA] a new instance of RSA
  #
  # source://acme-client//lib/acme/client/jwk/rsa.rb#10
  def initialize(private_key); end

  # The name of the algorithm as needed for the `alg` member of a JWS object.
  #
  # Returns a String.
  #
  # source://acme-client//lib/acme/client/jwk/rsa.rb#41
  def jwa_alg; end

  # Sign a message with the private key.
  #
  # message - A String message to sign.
  #
  # Returns a String signature.
  #
  # source://acme-client//lib/acme/client/jwk/rsa.rb#34
  def sign(message); end

  # Get this JWK as a Hash for JSON serialization.
  #
  # Returns a Hash.
  #
  # source://acme-client//lib/acme/client/jwk/rsa.rb#21
  def to_h; end

  private

  # source://acme-client//lib/acme/client/jwk/rsa.rb#49
  def public_key; end
end

# Digest algorithm to use when signing.
#
# source://acme-client//lib/acme/client/jwk/rsa.rb#3
Acme::Client::JWK::RSA::DIGEST = OpenSSL::Digest::SHA256

# source://acme-client//lib/acme/client/resources.rb#1
module Acme::Client::Resources; end

# source://acme-client//lib/acme/client/resources/account.rb#3
class Acme::Client::Resources::Account
  # @return [Account] a new instance of Account
  #
  # source://acme-client//lib/acme/client/resources/account.rb#6
  def initialize(client, **arguments); end

  # Returns the value of attribute contact.
  #
  # source://acme-client//lib/acme/client/resources/account.rb#4
  def contact; end

  # source://acme-client//lib/acme/client/resources/account.rb#22
  def deactivate; end

  # source://acme-client//lib/acme/client/resources/account.rb#11
  def kid; end

  # Returns the value of attribute orders_url.
  #
  # source://acme-client//lib/acme/client/resources/account.rb#4
  def orders_url; end

  # source://acme-client//lib/acme/client/resources/account.rb#27
  def reload; end

  # Returns the value of attribute status.
  #
  # source://acme-client//lib/acme/client/resources/account.rb#4
  def status; end

  # Returns the value of attribute term_of_service.
  #
  # source://acme-client//lib/acme/client/resources/account.rb#4
  def term_of_service; end

  # source://acme-client//lib/acme/client/resources/account.rb#32
  def to_h; end

  # source://acme-client//lib/acme/client/resources/account.rb#15
  def update(contact: T.unsafe(nil), terms_of_service_agreed: T.unsafe(nil)); end

  # Returns the value of attribute url.
  #
  # source://acme-client//lib/acme/client/resources/account.rb#4
  def url; end

  private

  # source://acme-client//lib/acme/client/resources/account.rb#43
  def assign_attributes(url:, term_of_service:, status:, contact:); end
end

# source://acme-client//lib/acme/client/resources/authorization.rb#3
class Acme::Client::Resources::Authorization
  # @return [Authorization] a new instance of Authorization
  #
  # source://acme-client//lib/acme/client/resources/authorization.rb#6
  def initialize(client, **arguments); end

  # source://acme-client//lib/acme/client/resources/authorization.rb#21
  def challenges; end

  # source://acme-client//lib/acme/client/resources/authorization.rb#11
  def deactivate; end

  # source://acme-client//lib/acme/client/resources/authorization.rb#34
  def dns; end

  # source://acme-client//lib/acme/client/resources/authorization.rb#34
  def dns01; end

  # Returns the value of attribute domain.
  #
  # source://acme-client//lib/acme/client/resources/authorization.rb#4
  def domain; end

  # Returns the value of attribute expires.
  #
  # source://acme-client//lib/acme/client/resources/authorization.rb#4
  def expires; end

  # source://acme-client//lib/acme/client/resources/authorization.rb#27
  def http; end

  # source://acme-client//lib/acme/client/resources/authorization.rb#27
  def http01; end

  # Returns the value of attribute identifier.
  #
  # source://acme-client//lib/acme/client/resources/authorization.rb#4
  def identifier; end

  # source://acme-client//lib/acme/client/resources/authorization.rb#16
  def reload; end

  # Returns the value of attribute status.
  #
  # source://acme-client//lib/acme/client/resources/authorization.rb#4
  def status; end

  # source://acme-client//lib/acme/client/resources/authorization.rb#41
  def to_h; end

  # Returns the value of attribute url.
  #
  # source://acme-client//lib/acme/client/resources/authorization.rb#4
  def url; end

  # Returns the value of attribute wildcard.
  #
  # source://acme-client//lib/acme/client/resources/authorization.rb#4
  def wildcard; end

  private

  # source://acme-client//lib/acme/client/resources/authorization.rb#65
  def assign_attributes(url:, status:, expires:, challenges:, identifier:, wildcard: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client/resources/authorization.rb#54
  def initialize_challenge(attributes); end
end

# source://acme-client//lib/acme/client/resources/challenges.rb#3
module Acme::Client::Resources::Challenges
  class << self
    # source://acme-client//lib/acme/client/resources/challenges.rb#14
    def new(client, type:, **arguments); end
  end
end

# source://acme-client//lib/acme/client/resources/challenges/base.rb#3
class Acme::Client::Resources::Challenges::Base
  # @return [Base] a new instance of Base
  #
  # source://acme-client//lib/acme/client/resources/challenges/base.rb#6
  def initialize(client, **arguments); end

  # source://acme-client//lib/acme/client/resources/challenges/base.rb#11
  def challenge_type; end

  # Returns the value of attribute error.
  #
  # source://acme-client//lib/acme/client/resources/challenges/base.rb#4
  def error; end

  # source://acme-client//lib/acme/client/resources/challenges/base.rb#15
  def key_authorization; end

  # source://acme-client//lib/acme/client/resources/challenges/base.rb#19
  def reload; end

  # source://acme-client//lib/acme/client/resources/challenges/base.rb#24
  def request_validation; end

  # Returns the value of attribute status.
  #
  # source://acme-client//lib/acme/client/resources/challenges/base.rb#4
  def status; end

  # source://acme-client//lib/acme/client/resources/challenges/base.rb#31
  def to_h; end

  # Returns the value of attribute token.
  #
  # source://acme-client//lib/acme/client/resources/challenges/base.rb#4
  def token; end

  # Returns the value of attribute url.
  #
  # source://acme-client//lib/acme/client/resources/challenges/base.rb#4
  def url; end

  private

  # source://acme-client//lib/acme/client/resources/challenges/base.rb#43
  def assign_attributes(status:, url:, token:, error: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client/resources/challenges/base.rb#37
  def send_challenge_validation(url:); end
end

# source://acme-client//lib/acme/client/resources/challenges.rb#9
Acme::Client::Resources::Challenges::CHALLENGE_TYPES = T.let(T.unsafe(nil), Hash)

# source://acme-client//lib/acme/client/resources/challenges/dns01.rb#3
class Acme::Client::Resources::Challenges::DNS01 < ::Acme::Client::Resources::Challenges::Base
  # source://acme-client//lib/acme/client/resources/challenges/dns01.rb#17
  def record_content; end

  # source://acme-client//lib/acme/client/resources/challenges/dns01.rb#9
  def record_name; end

  # source://acme-client//lib/acme/client/resources/challenges/dns01.rb#13
  def record_type; end
end

# source://acme-client//lib/acme/client/resources/challenges/dns01.rb#4
Acme::Client::Resources::Challenges::DNS01::CHALLENGE_TYPE = T.let(T.unsafe(nil), String)

# source://acme-client//lib/acme/client/resources/challenges/dns01.rb#7
Acme::Client::Resources::Challenges::DNS01::DIGEST = OpenSSL::Digest::SHA256

# source://acme-client//lib/acme/client/resources/challenges/dns01.rb#5
Acme::Client::Resources::Challenges::DNS01::RECORD_NAME = T.let(T.unsafe(nil), String)

# source://acme-client//lib/acme/client/resources/challenges/dns01.rb#6
Acme::Client::Resources::Challenges::DNS01::RECORD_TYPE = T.let(T.unsafe(nil), String)

# source://acme-client//lib/acme/client/resources/challenges/http01.rb#3
class Acme::Client::Resources::Challenges::HTTP01 < ::Acme::Client::Resources::Challenges::Base
  # source://acme-client//lib/acme/client/resources/challenges/http01.rb#7
  def content_type; end

  # source://acme-client//lib/acme/client/resources/challenges/http01.rb#11
  def file_content; end

  # source://acme-client//lib/acme/client/resources/challenges/http01.rb#15
  def filename; end
end

# source://acme-client//lib/acme/client/resources/challenges/http01.rb#4
Acme::Client::Resources::Challenges::HTTP01::CHALLENGE_TYPE = T.let(T.unsafe(nil), String)

# source://acme-client//lib/acme/client/resources/challenges/http01.rb#5
Acme::Client::Resources::Challenges::HTTP01::CONTENT_TYPE = T.let(T.unsafe(nil), String)

# source://acme-client//lib/acme/client/resources/challenges/unsupported_challenge.rb#1
class Acme::Client::Resources::Challenges::Unsupported < ::Acme::Client::Resources::Challenges::Base; end

# source://acme-client//lib/acme/client/resources/directory.rb#3
class Acme::Client::Resources::Directory
  # @return [Directory] a new instance of Directory
  #
  # source://acme-client//lib/acme/client/resources/directory.rb#20
  def initialize(url, connection_options); end

  # source://acme-client//lib/acme/client/resources/directory.rb#39
  def caa_identities; end

  # source://acme-client//lib/acme/client/resources/directory.rb#24
  def endpoint_for(key); end

  # source://acme-client//lib/acme/client/resources/directory.rb#43
  def external_account_required; end

  # source://acme-client//lib/acme/client/resources/directory.rb#47
  def meta; end

  # source://acme-client//lib/acme/client/resources/directory.rb#31
  def terms_of_service; end

  # source://acme-client//lib/acme/client/resources/directory.rb#35
  def website; end

  private

  # source://acme-client//lib/acme/client/resources/directory.rb#53
  def directory; end

  # source://acme-client//lib/acme/client/resources/directory.rb#70
  def fetch_directory; end

  # source://acme-client//lib/acme/client/resources/directory.rb#57
  def load_directory; end
end

# source://acme-client//lib/acme/client/resources/directory.rb#13
Acme::Client::Resources::Directory::DIRECTORY_META = T.let(T.unsafe(nil), Hash)

# source://acme-client//lib/acme/client/resources/directory.rb#4
Acme::Client::Resources::Directory::DIRECTORY_RESOURCES = T.let(T.unsafe(nil), Hash)

# source://acme-client//lib/acme/client/resources/order.rb#3
class Acme::Client::Resources::Order
  # @return [Order] a new instance of Order
  #
  # source://acme-client//lib/acme/client/resources/order.rb#6
  def initialize(client, **arguments); end

  # Returns the value of attribute authorization_urls.
  #
  # source://acme-client//lib/acme/client/resources/order.rb#4
  def authorization_urls; end

  # source://acme-client//lib/acme/client/resources/order.rb#16
  def authorizations; end

  # source://acme-client//lib/acme/client/resources/order.rb#27
  def certificate(force_chain: T.unsafe(nil)); end

  # Returns the value of attribute certificate_url.
  #
  # source://acme-client//lib/acme/client/resources/order.rb#4
  def certificate_url; end

  # Returns the value of attribute contact.
  #
  # source://acme-client//lib/acme/client/resources/order.rb#4
  def contact; end

  # Returns the value of attribute expires.
  #
  # source://acme-client//lib/acme/client/resources/order.rb#4
  def expires; end

  # source://acme-client//lib/acme/client/resources/order.rb#22
  def finalize(csr:); end

  # Returns the value of attribute finalize_url.
  #
  # source://acme-client//lib/acme/client/resources/order.rb#4
  def finalize_url; end

  # Returns the value of attribute identifiers.
  #
  # source://acme-client//lib/acme/client/resources/order.rb#4
  def identifiers; end

  # source://acme-client//lib/acme/client/resources/order.rb#11
  def reload; end

  # Returns the value of attribute status.
  #
  # source://acme-client//lib/acme/client/resources/order.rb#4
  def status; end

  # source://acme-client//lib/acme/client/resources/order.rb#35
  def to_h; end

  # Returns the value of attribute url.
  #
  # source://acme-client//lib/acme/client/resources/order.rb#4
  def url; end

  private

  # source://acme-client//lib/acme/client/resources/order.rb#49
  def assign_attributes(url:, status:, expires:, finalize_url:, authorization_urls:, identifiers:, certificate_url: T.unsafe(nil)); end
end

# source://acme-client//lib/acme/client/self_sign_certificate.rb#1
class Acme::Client::SelfSignCertificate
  extend ::Forwardable

  # @return [SelfSignCertificate] a new instance of SelfSignCertificate
  #
  # source://acme-client//lib/acme/client/self_sign_certificate.rb#7
  def initialize(subject_alt_names:, not_before: T.unsafe(nil), not_after: T.unsafe(nil), private_key: T.unsafe(nil)); end

  # source://acme-client//lib/acme/client/self_sign_certificate.rb#14
  def certificate; end

  # Returns the value of attribute not_after.
  #
  # source://acme-client//lib/acme/client/self_sign_certificate.rb#2
  def not_after; end

  # Returns the value of attribute not_before.
  #
  # source://acme-client//lib/acme/client/self_sign_certificate.rb#2
  def not_before; end

  # Returns the value of attribute private_key.
  #
  # source://acme-client//lib/acme/client/self_sign_certificate.rb#2
  def private_key; end

  # Returns the value of attribute subject_alt_names.
  #
  # source://acme-client//lib/acme/client/self_sign_certificate.rb#2
  def subject_alt_names; end

  # source://forwardable/1.3.3/forwardable.rb#231
  def to_der(*args, **_arg1, &block); end

  # source://forwardable/1.3.3/forwardable.rb#231
  def to_pem(*args, **_arg1, &block); end

  private

  # source://acme-client//lib/acme/client/self_sign_certificate.rb#37
  def default_not_after; end

  # source://acme-client//lib/acme/client/self_sign_certificate.rb#33
  def default_not_before; end

  # source://acme-client//lib/acme/client/self_sign_certificate.rb#41
  def digest; end

  # source://acme-client//lib/acme/client/self_sign_certificate.rb#45
  def generate_certificate; end

  # source://acme-client//lib/acme/client/self_sign_certificate.rb#55
  def generate_extension_factory(certificate); end

  # source://acme-client//lib/acme/client/self_sign_certificate.rb#29
  def generate_private_key; end
end

# source://acme-client//lib/acme/client.rb#28
Acme::Client::USER_AGENT = T.let(T.unsafe(nil), String)

# source://acme-client//lib/acme/client/util.rb#1
module Acme::Client::Util
  extend ::Acme::Client::Util

  # See RFC 8288 - https://tools.ietf.org/html/rfc8288#section-3
  #
  # source://acme-client//lib/acme/client/util.rb#9
  def decode_link_headers(link_header); end

  # Sets public key on CSR or cert.
  #
  # obj  - An OpenSSL::X509::Certificate or OpenSSL::X509::Request instance.
  # priv - An OpenSSL::PKey::EC or OpenSSL::PKey::RSA instance.
  #
  # Returns nothing.
  #
  # source://acme-client//lib/acme/client/util.rb#23
  def set_public_key(obj, priv); end

  # source://acme-client//lib/acme/client/util.rb#2
  def urlsafe_base64(data); end
end

# source://acme-client//lib/acme/client/util.rb#6
Acme::Client::Util::LINK_MATCH = T.let(T.unsafe(nil), Regexp)

# source://acme-client//lib/acme/client/version.rb#5
Acme::Client::VERSION = T.let(T.unsafe(nil), String)
