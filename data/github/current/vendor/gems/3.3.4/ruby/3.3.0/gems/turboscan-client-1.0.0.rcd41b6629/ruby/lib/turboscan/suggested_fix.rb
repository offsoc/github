# frozen_string_literal: true

# Code generated by sync_suggested_fix_supported_rules.rb, DO NOT EDIT.

module Turboscan
  module SuggestedFix
    # rubocop:disable Metrics/CollectionLiteralLength
    SUPPORTED_RULES = %w[
      cpp/alloca-in-loop
      cpp/allocation-too-small
      cpp/bad-addition-overflow-check
      cpp/bad-strncpy-size
      cpp/badly-bounded-write
      cpp/boost/tls-settings-misconfiguration
      cpp/boost/use-of-deprecated-hardcoded-security-protocol
      cpp/certificate-not-checked
      cpp/certificate-result-conflation
      cpp/cgi-xss
      cpp/cleartext-storage-database
      cpp/comma-before-misleading-indentation
      cpp/comparison-with-wider-type
      cpp/dangerous-cin
      cpp/dangerous-function-overflow
      cpp/external-entity-expansion
      cpp/hresult-boolean-conversion
      cpp/incorrect-allocation-error-handling
      cpp/incorrect-not-operator-usage
      cpp/incorrectly-checked-scanf
      cpp/insufficient-key-size
      cpp/integer-multiplication-cast-to-long
      cpp/invalid-pointer-deref
      cpp/iterator-to-expired-container
      cpp/memset-may-be-deleted
      cpp/missing-check-scanf
      cpp/new-free-mismatch
      cpp/no-space-for-terminator
      cpp/non-constant-format
      cpp/non-https-url
      cpp/offset-use-before-range-check
      cpp/open-call-with-mode-argument
      cpp/openssl-heartbleed
      cpp/overflowing-snprintf
      cpp/overrun-write
      cpp/overrunning-write
      cpp/overrunning-write-with-float
      cpp/path-injection
      cpp/pointer-overflow-check
      cpp/potential-system-data-exposure
      cpp/potentially-dangerous-function
      cpp/redundant-null-check-simple
      cpp/return-stack-allocated-memory
      cpp/signed-overflow-check
      cpp/static-buffer-overflow
      cpp/suspicious-add-sizeof
      cpp/suspicious-allocation-size
      cpp/suspicious-pointer-scaling-void
      cpp/suspicious-sizeof
      cpp/tainted-format-string
      cpp/tainted-permissions-check
      cpp/toctou-race-condition
      cpp/too-few-arguments
      cpp/type-confusion
      cpp/unbounded-write
      cpp/uncontrolled-allocation-size
      cpp/uncontrolled-arithmetic
      cpp/uncontrolled-process-operation
      cpp/uninitialized-local
      cpp/unsafe-create-process-call
      cpp/unsafe-dacl-security-descriptor
      cpp/unsafe-strcat
      cpp/unsafe-strncat
      cpp/unsafe-use-of-this
      cpp/unsigned-difference-expression-compared-zero
      cpp/unterminated-variadic-call
      cpp/upcast-array-pointer-arithmetic
      cpp/use-after-free
      cpp/use-of-string-after-lifetime-ends
      cpp/use-of-unique-pointer-after-lifetime-ends
      cpp/using-expired-stack-address
      cpp/very-likely-overrunning-write
      cpp/world-writable-file-creation
      cpp/wrong-number-format-arguments
      cpp/wrong-type-format-argument
      cs/assembly-path-injection
      cs/cleartext-storage-of-sensitive-information
      cs/code-injection
      cs/command-line-injection
      cs/deserialized-delegate
      cs/ecb-encryption
      cs/exposure-of-sensitive-information
      cs/hardcoded-connection-string-credentials
      cs/inadequate-rsa-padding
      cs/information-exposure-through-exception
      cs/insecure-randomness
      cs/insecure-sql-connection
      cs/insufficient-key-size
      cs/ldap-injection
      cs/log-forging
      cs/path-injection
      cs/redos
      cs/regex-injection
      cs/resource-injection
      cs/sensitive-data-transmission
      cs/serialization-check-bypass
      cs/session-reuse
      cs/sql-injection
      cs/thread-unsafe-icryptotransform-captured-in-lambda
      cs/thread-unsafe-icryptotransform-field-in-class
      cs/uncontrolled-format-string
      cs/unsafe-deserialization-untrusted-input
      cs/unvalidated-local-pointer-arithmetic
      cs/user-controlled-bypass
      cs/weak-encryption
      cs/web/ambiguous-client-variable
      cs/web/ambiguous-server-variable
      cs/web/broad-cookie-domain
      cs/web/broad-cookie-path
      cs/web/debug-binary
      cs/web/directory-browse-enabled
      cs/web/disabled-header-checking
      cs/web/file-upload
      cs/web/insecure-direct-object-reference
      cs/web/missing-function-level-access-control
      cs/web/missing-global-error-handler
      cs/web/missing-token-validation
      cs/web/persistent-cookie
      cs/web/request-validation-disabled
      cs/web/requiressl-not-set
      cs/web/unvalidated-url-redirection
      cs/web/xss
      cs/xml-injection
      cs/xml/insecure-dtd-handling
      cs/xml/missing-validation
      cs/xml/xpath-injection
      cs/zipslip
      go/allocation-size-overflow
      go/bad-redirect-check
      go/clear-text-logging
      go/constant-oauth2-state
      go/disabled-certificate-check
      go/email-injection
      go/incomplete-hostname-regexp
      go/incomplete-url-scheme-check
      go/incorrect-integer-conversion
      go/insecure-hostkeycallback
      go/insecure-randomness
      go/insecure-tls
      go/log-injection
      go/missing-jwt-signature-check
      go/path-injection
      go/reflected-xss
      go/regex/missing-regexp-anchor
      go/sql-injection
      go/stack-trace-exposure
      go/suspicious-character-in-regex
      go/uncontrolled-allocation-size
      go/unsafe-quoting
      go/unsafe-unzip-symlink
      go/unvalidated-url-redirection
      go/weak-crypto-key
      go/xml/xpath-injection
      go/zipslip
      java/android/backup-enabled
      java/android/cleartext-storage-filesystem
      java/android/cleartext-storage-shared-prefs
      java/android/debuggable-attribute-enabled
      java/android/fragment-injection
      java/android/fragment-injection-preference-activity
      java/android/implicit-pendingintents
      java/android/implicitly-exported-component
      java/android/incomplete-provider-permissions
      java/android/insecure-local-authentication
      java/android/insecure-local-key-gen
      java/android/intent-redirection
      java/android/intent-uri-permission-manipulation
      java/android/missing-certificate-pinning
      java/android/sensitive-keyboard-cache
      java/android/sensitive-notification
      java/android/sensitive-result-receiver
      java/android/sensitive-text
      java/android/unsafe-content-uri-resolution
      java/android/websettings-allow-content-access
      java/android/websettings-file-access
      java/android/websettings-javascript-enabled
      java/android/webview-debugging-enabled
      java/cleartext-storage-in-cookie
      java/cleartext-storage-in-properties
      java/command-line-injection
      java/comparison-with-wider-type
      java/concatenated-sql-query
      java/exec-tainted-environment
      java/groovy-injection
      java/http-response-splitting
      java/implicit-cast-in-compound-assignment
      java/improper-intent-verification
      java/improper-validation-of-array-construction
      java/improper-validation-of-array-index
      java/improper-webview-certificate-validation
      java/insecure-basic-auth
      java/insecure-bean-validation
      java/insecure-cookie
      java/insecure-ldap-auth
      java/insecure-randomness
      java/insecure-smtp-ssl
      java/insecure-trustmanager
      java/insufficient-key-size
      java/jexl-expression-injection
      java/jhipster-prng
      java/jndi-injection
      java/ldap-injection
      java/local-temp-file-or-directory-information-disclosure
      java/log-injection
      java/maven/dependency-upon-bintray
      java/maven/non-https-url
      java/missing-jwt-signature-check
      java/mvel-expression-injection
      java/netty-http-request-or-response-splitting
      java/ognl-injection
      java/overly-large-range
      java/partial-path-traversal
      java/partial-path-traversal-from-remote
      java/path-injection
      java/potentially-weak-cryptographic-algorithm
      java/predictable-seed
      java/relative-path-command
      java/rsa-without-oaep
      java/sensitive-log
      java/server-side-template-injection
      java/socket-auth-race-condition
      java/spel-expression-injection
      java/spring-disabled-csrf-protection
      java/sql-injection
      java/ssrf
      java/stack-trace-exposure
      java/static-initialization-vector
      java/tainted-arithmetic
      java/tainted-format-string
      java/tainted-numeric-cast
      java/tainted-permissions-check
      java/toctou-race-condition
      java/trust-boundary-violation
      java/uncontrolled-arithmetic
      java/unsafe-cert-trust
      java/unsafe-hostname-verification
      java/unvalidated-url-forward
      java/unvalidated-url-redirection
      java/weak-cryptographic-algorithm
      java/world-writable-file-read
      java/xml/xpath-injection
      java/xslt-injection
      java/xss
      java/xxe
      java/zipslip
      js/actions/command-injection
      js/angular/disabling-sce
      js/angular/double-compilation
      js/angular/insecure-url-whitelist
      js/bad-code-sanitization
      js/bad-tag-filter
      js/biased-cryptographic-random
      js/build-artifact-leak
      js/case-sensitive-middleware-path
      js/clear-text-cookie
      js/clear-text-logging
      js/clear-text-storage-of-sensitive-data
      js/client-exposed-cookie
      js/client-side-unvalidated-url-redirection
      js/code-injection
      js/command-line-injection
      js/cors-misconfiguration-for-credentials
      js/cross-window-information-leak
      js/disabling-certificate-validation
      js/disabling-electron-websecurity
      js/double-escaping
      js/enabling-electron-insecure-content
      js/exposure-of-private-files
      js/host-header-forgery-in-email-generation
      js/html-constructed-from-input
      js/identity-replacement
      js/incomplete-hostname-regexp
      js/incomplete-html-attribute-sanitization
      js/incomplete-multi-character-sanitization
      js/incomplete-sanitization
      js/incomplete-url-scheme-check
      js/incomplete-url-substring-sanitization
      js/incorrect-suffix-check
      js/indirect-command-line-injection
      js/insecure-dependency
      js/insecure-download
      js/insecure-randomness
      js/insecure-temporary-file
      js/insufficient-key-size
      js/insufficient-password-hash
      js/jwt-missing-verification
      js/log-injection
      js/loop-bound-injection
      js/missing-origin-check
      js/missing-rate-limiting
      js/missing-token-validation
      js/overly-large-range
      js/path-injection
      js/prototype-polluting-assignment
      js/prototype-pollution
      js/prototype-pollution-utility
      js/redos
      js/reflected-xss
      js/regex-injection
      js/regex/missing-regexp-anchor
      js/request-forgery
      js/resource-exhaustion
      js/resource-exhaustion-from-deep-object-traversal
      js/samesite-none-cookie
      js/second-order-command-line-injection
      js/sensitive-get-query
      js/server-crash
      js/server-side-unvalidated-url-redirection
      js/shell-command-constructed-from-input
      js/shell-command-injection-from-environment
      js/sql-injection
      js/stack-trace-exposure
      js/stored-xss
      js/tainted-format-string
      js/template-object-injection
      js/type-confusion-through-parameter-tampering
      js/unnecessary-use-of-cat
      js/unsafe-deserialization
      js/unsafe-dynamic-method-access
      js/unsafe-html-expansion
      js/unsafe-jquery-plugin
      js/unvalidated-dynamic-method-call
      js/useless-regexp-character-escape
      js/weak-cryptographic-algorithm
      js/xml-bomb
      js/xpath-injection
      js/xss
      js/xss-through-dom
      js/xss-through-exception
      js/xxe
      js/zipslip
      py/bad-tag-filter
      py/bind-socket-all-network-interfaces
      py/clear-text-logging-sensitive-data
      py/clear-text-storage-sensitive-data
      py/code-injection
      py/command-line-injection
      py/csrf-protection-disabled
      py/flask-debug
      py/full-ssrf
      py/http-response-splitting
      py/incomplete-hostname-regexp
      py/incomplete-url-substring-sanitization
      py/insecure-default-protocol
      py/insecure-protocol
      py/jinja2/autoescape-false
      py/ldap-injection
      py/log-injection
      py/nosql-injection
      py/overly-permissive-file
      py/pam-auth-bypass
      py/paramiko-missing-host-key-validation
      py/partial-ssrf
      py/path-injection
      py/reflective-xss
      py/regex-injection
      py/request-without-cert-validation
      py/shell-command-constructed-from-input
      py/sql-injection
      py/stack-trace-exposure
      py/tarslip
      py/unsafe-deserialization
      py/url-redirection
      py/use-of-input
      py/weak-crypto-key
      py/weak-cryptographic-algorithm
      py/weak-sensitive-data-hashing
      py/xml-bomb
      py/xpath-injection
      py/xxe
      rb/bad-tag-filter
      rb/clear-text-logging-sensitive-data
      rb/clear-text-storage-sensitive-data
      rb/code-injection
      rb/command-line-injection
      rb/csrf-protection-disabled
      rb/csrf-protection-not-enabled
      rb/hardcoded-data-interpreted-as-code
      rb/html-constructed-from-input
      rb/http-to-file-access
      rb/incomplete-hostname-regexp
      rb/incomplete-multi-character-sanitization
      rb/incomplete-sanitization
      rb/incomplete-url-substring-sanitization
      rb/insecure-dependency
      rb/insecure-download
      rb/insecure-mass-assignment
      rb/kernel-open
      rb/log-injection
      rb/non-constant-kernel-open
      rb/overly-large-range
      rb/path-injection
      rb/reflected-xss
      rb/regex/badly-anchored-regexp
      rb/regex/missing-regexp-anchor
      rb/regexp-injection
      rb/request-forgery
      rb/request-without-cert-validation
      rb/shell-command-constructed-from-input
      rb/sql-injection
      rb/stack-trace-exposure
      rb/stored-xss
      rb/tainted-format-string
      rb/unsafe-code-construction
      rb/unsafe-deserialization
      rb/url-redirection
      rb/weak-cookie-configuration
      rb/weak-cryptographic-algorithm
      rb/xxe
      swift/bad-tag-filter
      swift/cleartext-logging
      swift/cleartext-storage-database
      swift/cleartext-storage-preferences
      swift/command-line-injection
      swift/constant-password
      swift/constant-salt
      swift/ecb-encryption
      swift/hardcoded-key
      swift/incomplete-hostname-regexp
      swift/insecure-tls
      swift/insufficient-hash-iterations
      swift/missing-regexp-anchor
      swift/path-injection
      swift/predicate-injection
      swift/regex-injection
      swift/static-initialization-vector
      swift/string-length-conflation
      swift/uncontrolled-format-string
      swift/unsafe-js-eval
      swift/unsafe-webview-fetch
      swift/weak-password-hashing
      swift/weak-sensitive-data-hashing
      swift/xxe
    ].freeze
    # rubocop:enable Metrics/CollectionLiteralLength
  end
end
