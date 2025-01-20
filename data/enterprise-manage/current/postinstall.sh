#!/bin/sh
cd "$(dirname $0)/node_modules"

[ -d "jquery/src" ] && rm -rf jquery/src
[ -d "datetimepicker/demo" ] && rm -rf datetimepicker/demo
[ -d "datetimepicker/src" ] && rm -rf datetimepicker/src

# rename css files to scss for easier importing with sprockets
find "$PWD/datetimepicker/dist" -name "*.css" -exec sh -c 'mv "$1" "${1%.css}.scss"' _ {} \;

exit 0
