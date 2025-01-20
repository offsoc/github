# frozen_string_literal: true

module GitHub
    module Spokes
        module Proto
            module Helpers
                module Mode
                    DIRECTORY = 0o040000
                    REGULAR = 0o100644
                    EXECUTABLE = 0o100755
                    SYMLINK = 0o120000
                    SUBMODULE = 0o160000

                    ALL = [DIRECTORY, REGULAR, EXECUTABLE, SYMLINK, SUBMODULE].freeze

                    def self.is_directory?(source)
                        source.mode == DIRECTORY
                    end

                    def self.is_regular?(source)
                        source.mode == REGULAR || source.mode == EXECUTABLE
                    end

                    def self.is_symlink?(source)
                        source.mode == SYMLINK
                    end

                    def self.is_submodule?(source)
                        source.mode == SUBMODULE
                    end
                end
            end
        end
    end
end