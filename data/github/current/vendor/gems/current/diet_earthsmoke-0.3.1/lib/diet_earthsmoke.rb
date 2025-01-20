# frozen_string_literal: true

require "openssl"
require "base64"
require "json"
require "rbnacl"

module DietEarthsmoke
  # We subclass all errors from `DietEarthsmokeError` so that we can catch that
  # in `github/github` instead of `StandardError`.
  class DietEarthsmokeError < StandardError; end
  class CipherError < DietEarthsmokeError; end
  class KeyParseError < DietEarthsmokeError; end
  class KeyExportError < DietEarthsmokeError; end
  class ExtractionError < DietEarthsmokeError; end
  class UnsupportedError < DietEarthsmokeError; end

  class KeyVersion
    attr_accessor :id,
                  :symmetric_key_algo,
                  :symmetric_key,
                  :key_pair_algo,
                  :public_key,
                  :private_key,
                  :scoping_kdf_secret

    def initialize(args = {})
      @id = args[:id] ? args[:id] : nil
      @symmetric_key_algo = args[:symmetric_key_algo] ? args[:symmetric_key_algo] : "NULL"
      @symmetric_key = args[:symmetric_key] ? args[:symmetric_key] : nil
      @key_pair_algo = args[:key_pair_algo] ? args[:key_pair_algo] : "NULL"
      @public_key = args[:public_key] ? args[:public_key] : nil
      @private_key = args[:private_key] ? args[:private_key] : nil
      @scoping_kdf_secret = args[:scoping_kdf_secret] ? args[:scoping_kdf_secret] : nil
    end
  end

  class KeyExportResponse
    attr_accessor :current_key_id, :key_versions

    def initialize(args = {})
      @current_key_id = args[:current_key_id]
      @key_versions = args[:key_versions]
    end
  end

  LIBSODIUM_ALGO = "LIBSODIUM-SEALED-BOX-CURVE25519-XSALSA20-POLY1305"
  AES_ALGO = "AES-128-GCM"

  class Key

    # Initialize a key from a key name. We can use the key name to find the
    # current key.
    def initialize(key_name)
      vault_key_name = "EARTHSMOKE_#{key_name.gsub(/-|:/, "_").upcase}"

      raise KeyParseError.new("Key not found #{key_name}") if ENV[vault_key_name].nil?

      begin
        @key = JSON.parse(ENV[vault_key_name])
      rescue TypeError, JSON::ParserError
        raise KeyParseError.new("Unparsable key #{key_name}")
      end

      @key_versions = @key["versions"]

      if @key_versions.nil? || @key_versions.empty?
        raise KeyParseError.new("#{key_name} has no versions stored, is it in the right format?")
      end

      @current_key = @key["versions"][@key["current"]]
      @current_key_id = @key["current"].to_i(16)

      raise KeyParseError.new("Current key version not found for #{key_name}") if @current_key.nil?
    end

    def current_key(scope: nil)
      if @current_key["key_pair_algo"] == LIBSODIUM_ALGO
        public_key, private_key, scoping_secret = if scope.nil?
          [
            decode_key_data(@current_key["public_key"]),
            decode_key_data(@current_key["private_key"]),
            decode_key_data(@current_key["scoping_kdf_secret"]),
          ]
        else
          [
            derive_public_key(@current_key, scope),
            derive_private_key(@current_key, scope),
            ""
          ]
        end
      end

      if @current_key["symmetric_key_algo"] == AES_ALGO
        symmetric_key = Base64.decode64(@current_key["symmetric_key"])
      end

      return KeyVersion.new(
        id: @current_key_id,
        symmetric_key_algo: @current_key["symmetric_key_algo"],
        symmetric_key: symmetric_key,
        key_pair_algo: @current_key["key_pair_algo"],
        public_key: public_key,
        private_key: private_key,
        scoping_kdf_secret: scoping_secret,
      )
    end

    # Decrypts a high level ciphertext.
    #
    # ciphertext - The ciphertext to decrypt.
    # vault_key_name - The name of the vault key to use.
    # scope - Accepts this argument to provide a cleaner error experience for user.
    #
    # Returns a binary string.
    def decrypt(ciphertext, scope = nil)
      if scope != nil
        raise UnsupportedError.new("scopes are not supported in DietEarthsmoke Ruby AES")
      end
      decryption_key, extracted_ciphertext = extract(ciphertext)
      algo = decryption_key["symmetric_key_algo"]
      # decrypt the ciphertext

      validate_cipher!(AES_ALGO, algo)

      # extract the key_id and ciphertext
      decoded_symmetric_key = Base64.decode64(decryption_key["symmetric_key"])

      auth_tag_size = 16
      aes = OpenSSL::Cipher::AES128.new(:GCM)

      nonce = extracted_ciphertext.byteslice(0, aes.iv_len)
      ciphertext = extracted_ciphertext.byteslice(aes.iv_len, extracted_ciphertext.bytesize - auth_tag_size - aes.iv_len)
      tag = extracted_ciphertext.byteslice(-auth_tag_size, auth_tag_size)

      aes.decrypt
      aes.key = decoded_symmetric_key
      aes.iv = nonce
      aes.auth_data = ""
      aes.auth_tag = tag

      begin
        aes.update(ciphertext) + aes.final
      rescue OpenSSL::Cipher::CipherError
        raise CipherError.new("tag could not be authenticated successfully.")
      end
    end

    # Encrypts a plaintext to aes and embeds the key_id.
    #
    # plaintext - The plaintext to encrypt.
    # scope - Accepts this argument to. provide a cleaner error experience for user
    #
    # Returns a binary string containing nonce, ciphertext, and tag embedded with key_id.
    def encrypt(plaintext, scope = nil)
      if scope != nil
        raise UnsupportedError.new("scopes are not supported in DietEarthsmoke Ruby AES")
      end
      algo = current_key.symmetric_key_algo

      validate_cipher!(AES_ALGO, algo)
      validate_plaintext!(plaintext)

      decoded_symmetric_key = current_key.symmetric_key

      aes = OpenSSL::Cipher::AES.new(128, :GCM)
      aes.encrypt # put the cipher instance in to encrypt mode
      aes.key = decoded_symmetric_key
      nonce = OpenSSL::Random.random_bytes(aes.iv_len)
      aes.iv = nonce
      aes.auth_data = ""

      encrypted = aes.update(plaintext) + aes.final
      tag = aes.auth_tag

      embed(nonce + encrypted + tag)
    end

    # Seal a plaintext with a RbNaCL public key
    #
    # plaintext - The plaintext to seal.
    #
    # Returns a binary string.
    def seal(plaintext, scope: nil)
      algo = current_key.key_pair_algo

      validate_cipher!(LIBSODIUM_ALGO, algo)

      public_key = if scope.nil?
        current_key.public_key
      else
        current_key(scope: scope).public_key
      end

      embed(RbNaCl::Boxes::Sealed.from_public_key(public_key).box(plaintext))
    end

    # Open a ciphertext with a RbNaCL private key
    #
    # ciphertext - The ciphertext to open.
    #
    # Returns a string.
    def open(ciphertext, scope: nil)
      decryption_key, extracted_ciphertext = extract(ciphertext)
      algo = decryption_key["key_pair_algo"]

      validate_cipher!(LIBSODIUM_ALGO, algo)

      begin
        secret_key = if scope.nil?
          if decryption_key["private_key"].nil?
            raise KeyParseError.new("Private key missing")
          end
          Base64.decode64(decryption_key["private_key"])
        else
          derive_private_key(decryption_key, scope)
        end
        RbNaCl::Boxes::Sealed.from_private_key(secret_key).open(extracted_ciphertext)
      rescue RbNaCl::CryptoError => e
        raise CipherError.new(e.message)
      end
    end

    # Export a libsodium scoped keys
    #
    # scope - The scope to export the public key with.
    #
    # Returns a string.
    def export(scope: nil)
      keys_versions = @key_versions.map { |version, key_data|

        # We only support exporting libsodium keys
        next if key_data["key_pair_algo"] != LIBSODIUM_ALGO

        public_key, private_key, scoping_secret = if scope.nil?
          [
            decode_key_data(key_data["public_key"]),
            decode_key_data(key_data["private_key"]),
            decode_key_data(key_data["scoping_kdf_secret"]),
          ]
        else
          [
            derive_public_key(key_data, scope),
            derive_private_key(key_data, scope),
            ""
          ]
        end

        KeyVersion.new(
          id: version.to_i(16),
          key_pair_algo: key_data["key_pair_algo"],
          public_key: public_key,
          private_key: private_key,
          scoping_kdf_secret: scoping_secret,
        )
      }.compact

      raise KeyExportError.new("Only libsodium keys support exporting") if keys_versions.empty?

      # Allow for dot like accessors to maintain compatability
      KeyExportResponse.new(
        current_key_id: @current_key_id,
        key_versions: keys_versions
      )
    end

    private
    # Extract an ID from some data.
    #
    # data - Binary string with embedded ID.
    #
    # Returns an Array of [id, data].
    def extract(data)
      data = String.new(data, encoding: Encoding::ASCII_8BIT)

      # Determine if the data is encoded with earthsmoke embedding
      # if we can't find the proper version in the embedded data
      # we raise an extraction error
      version = [
        {
          prefix: 1,
          id_pack_directive: "L>",
        },
        {
          prefix: 2,
          id_pack_directive: "Q>",
        }
      ].find { |v| data.start_with?(v[:prefix].chr) }
      raise ExtractionError.new("Unknown version") if version.nil?

      # Attempt to seperate the ciphertext from the old earthsmoke key_id
      # if anything is nil raise an extraction error
      key_id, ciphertext = data.unpack("C#{version[:id_pack_directive]}a*")[1..2]
      raise ExtractionError.new("Unpacked data is nil") if key_id.nil? || data.nil?

      # Decryption key would be nil if someone is attempting to extract using a different key_id
      decryption_key = @key_versions["%016x" % key_id]
      raise ExtractionError.new("Key version not found") if decryption_key.nil?
      [decryption_key, ciphertext]
    end

    # Embed an ID into some data.
    #
    # data - Binary String data.
    #
    # Returns a binary String.
    def embed(data)
      DietEarthsmoke.embed(@current_key_id, data)
    end

    def derive_private_key(key, scope)
      OpenSSL::KDF.hkdf(Base64.decode64(key["scoping_kdf_secret"]),
        salt: "kp",
        info: scope,
        length: 32,
        hash: OpenSSL::Digest::SHA512.new
      )
    end

    def derive_public_key(key, scope)
      RbNaCl::GroupElement.base.mult(derive_private_key(key, scope)).to_bytes
    end

    def validate_cipher!(expected_algo, actual_algo)
      raise CipherError.new("Unsupported cipher algorithm: #{actual_algo}") if expected_algo != actual_algo
    end

    def validate_plaintext!(plaintext)
      raise CipherError.new("plaintext must be a string") if !plaintext.is_a?(String)
      raise CipherError.new("plaintext must not be empty") if plaintext.empty?
    end

    def decode_key_data(key_data)
      if key_data.nil? || key_data.empty?
        nil
      else
        Base64.decode64(key_data)
      end
    end
  end

  # Embed an ID into some data.
  #
  # data - Binary String data.
  #
  # Returns a binary String.
  def self.embed(id, data)
    data = String.new(data, encoding: Encoding::ASCII_8BIT)
    [2, id, data].pack("CQ>a*")
  end
end
