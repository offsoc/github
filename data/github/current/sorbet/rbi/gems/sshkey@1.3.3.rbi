# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `sshkey` gem.
# Please instead update this file by running `bin/tapioca gem sshkey`.

# source://sshkey//lib/sshkey.rb#6
class SSHKey
  # Create a new SSHKey object
  #
  # ==== Parameters
  # * private_key - Existing RSA or DSA private key
  # * options<~Hash>
  #   * :comment<~String> - Comment to use for the public key, defaults to ""
  #   * :passphrase<~String> - If the key is encrypted, supply the passphrase
  #
  # @return [SSHKey] a new instance of SSHKey
  #
  # source://sshkey//lib/sshkey.rb#135
  def initialize(private_key, options = T.unsafe(nil)); end

  # Determine the length (bits) of the key as an integer
  #
  # source://sshkey//lib/sshkey.rb#192
  def bits; end

  # Returns the value of attribute comment.
  #
  # source://sshkey//lib/sshkey.rb#11
  def comment; end

  # Sets the attribute comment
  #
  # @param value the value to set the attribute comment to.
  #
  # source://sshkey//lib/sshkey.rb#11
  def comment=(_arg0); end

  # Fetch the RSA/DSA private key
  #
  # rsa_private_key and dsa_private_key are aliased for backward compatibility
  #
  # source://sshkey//lib/sshkey.rb#150
  def dsa_private_key; end

  # Fetch the RSA/DSA public key
  #
  # rsa_public_key and dsa_public_key are aliased for backward compatibility
  #
  # source://sshkey//lib/sshkey.rb#167
  def dsa_public_key; end

  # Fetch the encrypted RSA/DSA private key using the passphrase provided
  #
  # If no passphrase is set, returns the unencrypted private key
  #
  # source://sshkey//lib/sshkey.rb#159
  def encrypted_private_key; end

  # Fingerprints
  #
  # MD5 fingerprint for the given SSH public key
  #
  # source://sshkey//lib/sshkey.rb#181
  def fingerprint; end

  # Returns the value of attribute key_object.
  #
  # source://sshkey//lib/sshkey.rb#10
  def key_object; end

  # Fingerprints
  #
  # MD5 fingerprint for the given SSH public key
  #
  # source://sshkey//lib/sshkey.rb#181
  def md5_fingerprint; end

  # Returns the value of attribute passphrase.
  #
  # source://sshkey//lib/sshkey.rb#11
  def passphrase; end

  # Sets the attribute passphrase
  #
  # @param value the value to set the attribute passphrase to.
  #
  # source://sshkey//lib/sshkey.rb#11
  def passphrase=(_arg0); end

  # Fetch the RSA/DSA private key
  #
  # rsa_private_key and dsa_private_key are aliased for backward compatibility
  #
  # source://sshkey//lib/sshkey.rb#150
  def private_key; end

  # Fetch the RSA/DSA public key
  #
  # rsa_public_key and dsa_public_key are aliased for backward compatibility
  #
  # source://sshkey//lib/sshkey.rb#167
  def public_key; end

  # Fetch the RSA/DSA private key
  #
  # rsa_private_key and dsa_private_key are aliased for backward compatibility
  #
  # source://sshkey//lib/sshkey.rb#150
  def rsa_private_key; end

  # Fetch the RSA/DSA public key
  #
  # rsa_public_key and dsa_public_key are aliased for backward compatibility
  #
  # source://sshkey//lib/sshkey.rb#167
  def rsa_public_key; end

  # SHA1 fingerprint for the given SSH public key
  #
  # source://sshkey//lib/sshkey.rb#187
  def sha1_fingerprint; end

  # SSH public key
  #
  # source://sshkey//lib/sshkey.rb#174
  def ssh_public_key; end

  # Returns the value of attribute type.
  #
  # source://sshkey//lib/sshkey.rb#10
  def type; end

  private

  # source://sshkey//lib/sshkey.rb#220
  def encode_unsigned_int_32(value); end

  # For instance, the "ssh-rsa" string is encoded as the following byte array
  # [0, 0, 0, 7, 's', 's', 'h', '-', 'r', 's', 'a']
  #
  # source://sshkey//lib/sshkey.rb#207
  def ssh_public_key_conversion; end

  # source://sshkey//lib/sshkey.rb#229
  def to_byte_array(num); end

  class << self
    # Fingerprints
    #
    # Accepts either a public or private key
    #
    # MD5 fingerprint for the given SSH key
    #
    # source://sshkey//lib/sshkey.rb#82
    def fingerprint(key); end

    # Generate a new keypair and return an SSHKey object
    #
    # The default behavior when providing no options will generate a 2048-bit RSA
    # keypair.
    #
    # ==== Parameters
    # * options<~Hash>:
    #   * :type<~String> - "rsa" or "dsa", "rsa" by default
    #   * :bits<~Integer> - Bit length
    #   * :comment<~String> - Comment to use for the public key, defaults to ""
    #   * :passphrase<~String> - Encrypt the key with this passphrase
    #
    # source://sshkey//lib/sshkey.rb#26
    def generate(options = T.unsafe(nil)); end

    # Fingerprints
    #
    # Accepts either a public or private key
    #
    # MD5 fingerprint for the given SSH key
    #
    # source://sshkey//lib/sshkey.rb#82
    def md5_fingerprint(key); end

    # SHA1 fingerprint for the given SSH key
    #
    # source://sshkey//lib/sshkey.rb#92
    def sha1_fingerprint(key); end

    # Validate an existing SSH public key
    #
    # Returns true or false depending on the validity of the public key provided
    #
    # ==== Parameters
    # * ssh_public_key<~String> - "ssh-rsa AAAAB3NzaC1yc2EA...."
    #
    # @return [Boolean]
    #
    # source://sshkey//lib/sshkey.rb#50
    def valid_ssh_public_key?(ssh_public_key); end

    private

    # source://sshkey//lib/sshkey.rb#111
    def decoded_key(key); end

    # source://sshkey//lib/sshkey.rb#115
    def fingerprint_regex; end

    # source://sshkey//lib/sshkey.rb#102
    def from_byte_array(byte_array, expected_size = T.unsafe(nil)); end

    # source://sshkey//lib/sshkey.rb#119
    def parse_ssh_public_key(public_key); end
  end
end

# source://sshkey//lib/sshkey.rb#8
SSHKey::SSH_CONVERSION = T.let(T.unsafe(nil), Hash)

# source://sshkey//lib/sshkey.rb#7
SSHKey::SSH_TYPES = T.let(T.unsafe(nil), Hash)
