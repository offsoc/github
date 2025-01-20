# frozen_string_literal: true

require "minitest/test"

require "spokes-proto"

class SpokesProtoHelpersModeTest < Minitest::Test
    Mode = GitHub::Spokes::Proto::Types::V1::Mode
    ModeHelper = GitHub::Spokes::Proto::Helpers::Mode

    def test_directory_mode
        mode = Mode.new(mode: ModeHelper::DIRECTORY)
        assert ModeHelper::is_directory?(mode)

        ModeHelper::ALL.reject { |v| v == ModeHelper::DIRECTORY }.each do |v|
            refute ModeHelper::is_directory?(Mode.new(mode: v))
        end
    end

    def test_regular_mode
        mode = Mode.new(mode: ModeHelper::REGULAR)
        assert ModeHelper::is_regular?(mode)

        mode = Mode.new(mode: ModeHelper::EXECUTABLE)
        assert ModeHelper::is_regular?(mode)

        ModeHelper::ALL.reject { |v| [ModeHelper::REGULAR, ModeHelper::EXECUTABLE].include?(v) }.each do |v|
            refute ModeHelper::is_regular?(Mode.new(mode: v))
        end
    end

    def test_symlink_mode
        mode = Mode.new(mode: ModeHelper::SYMLINK)
        assert ModeHelper::is_symlink?(mode)

        ModeHelper::ALL.reject { |v| v == ModeHelper::SYMLINK }.each do |v|
            refute ModeHelper::is_symlink?(Mode.new(mode: v))
        end
    end

    def test_submodule_mode
        mode = Mode.new(mode: ModeHelper::SUBMODULE)
        assert ModeHelper::is_submodule?(mode)

        ModeHelper::ALL.reject { |v| v == ModeHelper::SUBMODULE }.each do |v|
            refute ModeHelper::is_submodule?(Mode.new(mode: v))
        end
    end
end