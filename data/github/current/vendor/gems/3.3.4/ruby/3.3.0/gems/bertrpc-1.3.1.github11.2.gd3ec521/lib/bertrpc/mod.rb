module BERTRPC
  class Mod
    attr_accessor :mux_handler

    def initialize(svc, req, mod)
      @svc = svc
      @req = req
      @mod = mod
    end
    
    def build_action(cmd, *args)
      args = [*args]
      Action.new(@svc, @req, @mod, cmd, args)
    end

    def method_missing(cmd, *args)
      res = build_action(cmd, *args).execute(self, mux_handler)

      # Clear out @mux_handler (if it isn't already) so later calls
      # default to serial execution.
      @mux_handler = nil

      res
    end
  end
end
