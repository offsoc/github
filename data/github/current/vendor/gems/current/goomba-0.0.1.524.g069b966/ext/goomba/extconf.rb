require 'mkmf'

# TODO: remove -Wno-sign-compare and fix the warnings
# in goomba
$CFLAGS << ' -g -O2 -std=gnu99 -Wno-declaration-after-statement -Wno-sign-compare -fvisibility=hidden'

dir_config('goomba')
create_makefile('goomba')

