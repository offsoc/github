# typed: true

module Syslog
  extend T::Sig

  LOG_CONS = T.let(T.unsafe(nil), Integer)
  LOG_INFO = T.let(T.unsafe(nil), Integer)
  LOG_LOCAL7 = T.let(T.unsafe(nil), Integer)
  LOG_NDELAY = T.let(T.unsafe(nil), Integer)
end
