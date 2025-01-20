# frozen_string_literal: true

# Put the proto directory on the LOAD_PATH while we load things.
# Why? So that the proto-generated files can just use `require` to load each other
libdir = File.expand_path(File.join(File.dirname(__FILE__), "authnd-client", "proto"))

add_load_path = !$LOAD_PATH.include?(libdir)
$LOAD_PATH.unshift(libdir) if add_load_path

require "authnd-client/client/token"
require "authnd-client/client/authenticator"
require "authnd-client/client/credential_manager"
require "authnd-client/client/credential_validator"
require "authnd-client/client/mobile_device_manager"
require "authnd-client/client/constants"
require "authnd-client/client/headers"

# After loading the library, we remove ourselves from the LOAD_PATH.
# Why? So that we don't pollute the LOAD_PATH for future libraries.
$LOAD_PATH.delete(libdir) if add_load_path
