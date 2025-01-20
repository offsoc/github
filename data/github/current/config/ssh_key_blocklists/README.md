# SSH Key Blocklists

The files in this directory define our "block list" of key fingerprints. When a user attempts to register an SSH Key or SSH Certificate Authority we check it against this block list. If the key fingerprint is found in any of the files starting `blocklist.` in this directory, we disallow the operation.

Code that handles the blocking can be found in `lib/github/ssh.rb` (the `blocklisted_key?` method).

**Important:** The block list is only checked when adding a new key, not when using existing keys!
