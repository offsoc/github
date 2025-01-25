require 'zlib'

def decrypt(s)
    i, plaintext = 0, ''
    key = "This obfuscation is intended to discourage GitHub Enterprise customers from making modifications to the VM. We know this 'encryption' is easily broken. "

    Zlib::Inflate.inflate(s).each_byte do |c|
        plaintext << (c ^ key[i%key.length].ord).chr
        i += 1
    end
    plaintext
end

content = File.open(ARGV[0], "r").read
content.sub! %Q(__ruby_concealer__), " decrypt "
plaintext = eval content

puts plaintext
