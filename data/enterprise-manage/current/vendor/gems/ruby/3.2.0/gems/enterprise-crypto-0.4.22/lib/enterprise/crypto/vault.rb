module Enterprise
  module Crypto
    # Base class for a Vault, which consists of 0 or more gpg keys.
    # Keys can be public, secret, or a paired public & secret. Secret
    # keys must me signed by the master key and public keys must be signed
    # by their secret key pair, if it exists.
    #
    # A vault is used for any cryptographic work, such as generating a new
    # customer keypair, creating a license or package, and verifying anything
    # signed by a gpg key.
    #
    class Vault
      include SafeDir

      MASTER_FINGERPRINT = 'E422F81088AE9ABD5A6CBF7D1AF590C895016367'
      MASTER_ALTERNATIVE_FINGERPRINT = '490FF44B4907E0D6A8AE1F6D5584C4A75EF3607C'
      MASTER_ALTERNATIVE_SUBKEY_ID = '5584C4A75EF3607C'

      attr_accessor :fingerprint

      # Raise an error unless the key is signed by the signing_key. Useful
      # for asserting that a keypair is signed by the master key.
      #
      def self.verify_key_signature!(key, signing_key)
        subkey = signing_key.subkeys.detect {|sk| sk.fingerprint == signing_key.fingerprint }

        unless key.uids.any? {|uid| uid.signatures.any? {|s| s.keyid == subkey.keyid }} ||
                (signing_key.fingerprint == MASTER_FINGERPRINT &&
                key.uids.any? {|uid| uid.signatures.any? {|s| s.keyid == MASTER_ALTERNATIVE_SUBKEY_ID }})
            ##添加的语句
          raise(Error, "'#{key.name}' was not not signed by the '#{signing_key.name}' key")
        end
      end

      # Raise an error unless the key's fingerprint matches the provided
      # fingerprint. Useful for asserting a keypair.
      #
      def self.verify_key_fingerprint!(key, fingerprint)
        unless key && key.fingerprint == fingerprint
          if fingerprint == MASTER_FINGERPRINT
            Vault.verify_key_fingerprint!(key, MASTER_ALTERNATIVE_FINGERPRINT)
          else
            raise(Error, "'#{key.name}' fingerprint is invalid")
          end
        end
      end

      # Create a vault with a homedir and 0 or more (paired) keys.
      #
      # key_data  - An Array of gpg key data as Strings.
      #
      def initialize(*key_data, blank_password: false)
        @blank_password = blank_password
        @key_data = key_data
      end

      # The public key of the Master keypair. Used to verify that other
      # keypairs are signed by the Master key.
      #
      # Note: the private key should never be loaded into this library.
      #
      def master_key
        @master_key ||= find_public_key(MASTER_FINGERPRINT)
      end

      # The secret key portion for this vault. May be nil.
      # Used for signing data. (e.g. new keypairs, licenses,
      # packages.)
      #
      def secret_key
        @secret_key ||= begin
          find_private_key(fingerprint) unless fingerprint.nil?
        end
      end

      # The public key portion for this vault. May be nil.
      # Used to verify signed data.
      #
      def public_key
        @public_key ||= begin
          find_public_key(fingerprint) unless fingerprint.nil?
        end
      end

      # Add a new key to the Vault. It must match the fingerprint
      # of the existing key(s), if there is one.
      #
      # key_data  - The gpg data of the key as a String.
      #
      def add_key(key_data)
        import_main_key(key_data)

        @key_data << key_data

        fingerprint
      end

      # Returns the secret gpg key data as a String.
      #
      # fingerprint - The fingerprint of the secret key to export.
      #
      def export_secret(fingerprint)
        ## GPGME doesn't support exporting secret keys
        ## http://lists.gnupg.org/pipermail/gnupg-devel/2008-September/024581.html

        command = %w[gpg]
        command << "--homedir=#{home_dir}"
        command << '--batch' << '--yes'
        command << '--armor'
        command << "--export-secret-key=#{fingerprint}"
        command << "2>/dev/null"

        %x{#{command.join(' ')}}
      end

      # Returns the public gpg key data as a String.
      #
      # fingerprint - The gpg fingerprint of the public key to export.
      #
      def export_public(fingerprint)
        with_context(:armor => true) do |context|
          data = context.export(fingerprint)
          data.seek(0)
          data.read
        end
      end

      # Symmetrically encrypts then signs the data.
      # Note: only signs for now.
      #
      # raw - A String of data.
      #
      def encrypt_and_sign(raw)
        with_context do |context|
          raw_data = GPGME::Data.new(raw)
          context.add_signer(*secret_key)
          signed_data = context.sign(raw_data)
          signed_data.seek(0)
          signed_data.read
        end
      end

      # Symmetrically decrypts and verifies the object.
      # Note: only verifies for now.
      #
      # object - An encrypted and signed object as a String.
      #
      def decrypt_and_verify(object)
        with_context do |context|
          signed_data = new_signed_data(object)

          temp_file = Tempfile.new('enterprisecrypto', :encoding => Encoding::BINARY)
          raw_data    = GPGME::Data.from_io(temp_file)

          context.verify(signed_data, nil, raw_data)
          check_signatures(context.verify_result.signatures)

          temp_file.close

          # Return file reference so we don't GC it.
          temp_file
        end
      end

      def new_signed_data(object)
        GPGME::Data.new(object)
      end

      def check_signatures(signatures)
        if signatures.empty? || !signatures.all? {|sig| sig.valid? }
          raise Error, "Invalid signature detected!"
        end
      end

      def find_public_key(fingerprint)
        find_key(:public, fingerprint)
      end

      def find_secret_key(fingerprint)
        find_private_key(fingerprint)
      end

      def find_private_key(fingerprint)
        find_key(:private, fingerprint)
      end

      def find_key(type, fingerprint)
        with_context do |context|
          context.get_key(fingerprint, type == :private)
        end

      rescue EOFError
        nil
      end

      def with_context(options = {})
        with_vault do
          GPGME::Ctx.new(default_context_options.merge(options)) do |ctx|
            return yield(ctx)
          end
        end
      rescue GPGME::Error => e
        raise Error, e.message
      end

      def with_vault
        if Crypto.current_vault == self
          yield
        else
          Crypto.with_vault(self) { yield }
        end
      end

      def default_context_options
        {
          :keylist_mode => (
            GPGME::KEYLIST_MODE_SIGS |
            GPGME::GPGME_KEYLIST_MODE_SIG_NOTATIONS |
            GPGME::GPGME_KEYLIST_MODE_VALIDATE |
            GPGME::GPGME_KEYLIST_MODE_LOCAL)
        }.merge(blank_password_context_options)
      end

      def blank_password_context_options
        return {} unless @blank_password
        # Check to see if gpg is at least 2.1.12 (needs to include https://dev.gnupg.org/rGeea139c56ef55081d8cd8df2a35ce507386e0f17)
        maj, min, patch = GPGME::Engine.info.first.version.split(".").map(&:to_i)
        return {} if maj < 2
        return {} if maj == 2 && min < 1
        return {} if maj == 2 && min == 1 && patch < 12

        {
          :pinentry_mode => GPGME::PINENTRY_MODE_LOOPBACK, # bypass prompt
          :password => '' # default to no password
        }
      end

      def home_dir
        @home_dir ||= mktmpdir.to_path
      end

      def open!
        GPGME::Engine.home_dir = home_dir
        write_agent_config

        load_master_public_key
        load_vault

        VaultValidator.validate!(self)
      end

      def close!
        GPGME::Engine.home_dir = nil
      end

      def cleanup!
        close!
        FileUtils.rm_rf home_dir
        FileUtils.rm_rf tmpdir
        @home_dir = nil
      end

      def import_main_key(key_data)
        @fingerprint = import_key(key_data)

        if @fingerprint.nil?
          @fingerprint = fingerprint
        elsif @fingerprint != fingerprint
          raise Error, "Can't import #{fingerprint}, doesn't match #{@fingerprint}."
        end
      end

      def load_vault
        @key_data.map do |key|
          import_main_key(key)
        end

        Vault.verify_key_fingerprint!(secret_key, public_key.fingerprint) unless secret_key.nil?
        Vault.verify_key_signature!(public_key, master_key) unless public_key.nil?
      end

      def import_key(key_data)
        import_results = GPGME::Key.import(key_data)
        key = import_results.imports.last
        key && key.fingerprint
      end

      def load_master_public_key
        import_key <<-MASTER_PUBLIC_KEY
-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: GnuPG v1.4.11 (Darwin)

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
ZuLG8Ng=
=K2Sv
-----END PGP PUBLIC KEY BLOCK-----
MASTER_PUBLIC_KEY
      end

      def write_agent_config
        return if RUBY_PLATFORM !~ /darwin/ || File.exist?(agent_config_path)

        File.open(agent_config_path, 'w') do |f|
          f.puts agent_config
        end
      end

      def agent_config
        # any gpg-agent options should go here
        # allow-loopback-pinentry allows the GPGME password option to be set
        ['allow-loopback-pinentry']
      end

      def agent_config_path
        File.join(home_dir, 'gpg-agent.config')
      end
    end
  end
end
