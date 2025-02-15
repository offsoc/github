#!/usr/bin/env python

# Copyright (C) 2016-2018 g10 Code GmbH
# Copyright (C) 2004,2008 Igor Belyi <belyi@users.sourceforge.net>
# Copyright (C) 2002 John Goerzen <jgoerzen@complete.org>
#
#    This library is free software; you can redistribute it and/or
#    modify it under the terms of the GNU Lesser General Public
#    License as published by the Free Software Foundation; either
#    version 2.1 of the License, or (at your option) any later version.
#
#    This library is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
#    Lesser General Public License for more details.
#
#    You should have received a copy of the GNU Lesser General Public
#    License along with this library; if not, write to the Free Software
#    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307  USA

from distutils.core import setup, Extension
from distutils.command.build import build

import glob
import os
import os.path
import re
import shutil
import subprocess
import sys

# Out-of-tree build of the gpg bindings.
gpg_error_config = ['gpg-error-config']
gpgme_config_flags = ['--thread=pthread']
gpgme_config = ['gpgme-config'] + gpgme_config_flags
gpgme_h = ''
include_dirs = [os.getcwd()]
library_dirs = []
in_tree = False
extra_swig_opts = []
extra_macros = dict()

top_builddir = os.environ.get('top_builddir')
if top_builddir:
    # In-tree build.
    in_tree = True
    gpgme_config = [os.path.join(top_builddir, 'src/gpgme-config')
                    ] + gpgme_config_flags
    gpgme_h = os.path.join(top_builddir, 'src/gpgme.h')
    library_dirs = [os.path.join(top_builddir,
                                 'src/.libs')]  # XXX uses libtool internals
    extra_macros.update(
        HAVE_CONFIG_H=1,
        HAVE_DATA_H=1,
        IN_TREE_BUILD=1,
    )

if hasattr(subprocess, 'DEVNULL'):
    devnull = subprocess.DEVNULL
else:
    devnull = open(os.devnull, 'w')

try:
    subprocess.check_call(gpgme_config + ['--version'], stdout=devnull)
except:
    sys.exit('Could not find gpgme-config.  ' +
             'Please install the libgpgme development package.')


def getconfig(what, config=gpgme_config):
    confdata = subprocess.Popen(
        config + ['--%s' % what], stdout=subprocess.PIPE).communicate()[0]
    return [x for x in confdata.decode('utf-8').split() if x != '']


version = version_raw = getconfig('version')[0]
if '-' in version:
    version = version.split('-')[0]
major, minor, patch = map(int, version.split('.'))

if not (major > 1 or (major == 1 and minor >= 7)):
    sys.exit('Need at least GPGME version 1.7, found {}.'.format(version_raw))

if not gpgme_h:
    gpgme_h = os.path.join(getconfig('prefix')[0], 'include', 'gpgme.h')

define_macros = []
libs = getconfig('libs')

# Define extra_macros for both the SWIG and C code
for k, v in extra_macros.items():
    extra_swig_opts.append('-D{0}={1}'.format(k, v))
    define_macros.append((k, str(v)))

for item in getconfig('cflags'):
    if item.startswith('-I'):
        include_dirs.append(item[2:])
    elif item.startswith('-D'):
        defitem = item[2:].split('=', 1)
        if len(defitem) == 2:
            define_macros.append((defitem[0], defitem[1]))
        else:
            define_macros.append((defitem[0], None))

# Adjust include and library locations in case of win32
uname_s = os.popen('uname -s').read()
if uname_s.startswith('MINGW32'):
    mnts = [
        x.split()[0:3:2] for x in os.popen('mount').read().split('\n') if x
    ]
    tmplist = sorted([(len(x[1]), x[1], x[0]) for x in mnts])
    tmplist.reverse()
    extra_dirs = []
    for item in include_dirs:
        for ln, mnt, tgt in tmplist:
            if item.startswith(mnt):
                item = os.path.normpath(item[ln:])
                while item[0] == os.path.sep:
                    item = item[1:]
                extra_dirs.append(os.path.join(tgt, item))
                break
    include_dirs += extra_dirs
    for item in [x[2:] for x in libs if x.startswith('-L')]:
        for ln, mnt, tgt in tmplist:
            if item.startswith(mnt):
                item = os.path.normpath(item[ln:])
                while item[0] == os.path.sep:
                    item = item[1:]
                library_dirs.append(os.path.join(tgt, item))
                break


def in_srcdir(name):
    return os.path.join(os.environ.get('srcdir', ''), name)


def up_to_date(source, target):
    return (os.path.exists(target) and
            os.path.getmtime(source) <= os.path.getmtime(target))


# We build an Extension using SWIG, which generates a Python module.
# By default, the 'build_py' step is run before 'build_ext', and
# therefore the generated Python module is not copied into the build
# directory.
# Bugs: https://bugs.python.org/issue1016626
#       https://bugs.python.org/issue2624
# Workaround:
# https://stackoverflow.com/questions/12491328/python-distutils-not-include-the-swig-generated-module
#
# To install to multiple Python installations or to alternate ones run the
# following three commands (yes, run the build one twice):
#
# /path/to/pythonX.Y setup.py build
# /path/to/pythonX.Y setup.py build
# /path/to/pythonX.Y setup.py install
#
# It is highly likely that this will need to be run as root or with sudo (or
# sudo -H).  It may or may not work with venv. and outside a virtualenv

class BuildExtFirstHack(build):
    def _read_header(self, header, cflags):
        tmp_include = self._in_build_base('include1.h')
        with open(tmp_include, 'w') as f:
            f.write('#include <%s>' % header)
        return subprocess.check_output(
            os.environ.get('CPP', 'cc -E').split() + cflags +
            [tmp_include]).decode('utf-8')

    def _write_if_unchanged(self, target, content):
        if os.path.exists(target):
            with open(target) as f:
                if f.read() == content:
                    return

        with open(target, 'w') as sink:
            sink.write(content)

    def _generate_gpgme_h(self, source_name, sink_name):
        print('Using gpgme.h from {}'.format(source_name))
        shutil.copy2(source_name, sink_name)

    def _generate_errors_i(self):

        try:
            subprocess.check_call(
                gpg_error_config + ['--version'], stdout=devnull)
        except:
            sys.exit('Could not find gpg-error-config.  ' +
                     'Please install the libgpg-error development package.')

        gpg_error_content = self._read_header(
            'gpg-error.h', getconfig('cflags', config=gpg_error_config))

        filter_re = re.compile(r'GPG_ERR_[^ ]* =')
        rewrite_re = re.compile(r' *(.*) = .*')

        errors_i_content = ''
        for line in gpg_error_content.splitlines():
            if not filter_re.search(line):
                continue
            errors_i_content += rewrite_re.sub(
                r'%constant long \1 = \1;' + '\n', line.strip())

        self._write_if_unchanged(
            self._in_build_base('errors.i'), errors_i_content)

    def _in_build_base(self, name):
        return os.path.join(self.build_base, name)

    def _generate(self):
        # Cleanup gpgme.h from deprecated functions and typedefs.
        if not os.path.exists(self.build_base):
            os.makedirs(self.build_base)

        self._generate_gpgme_h(gpgme_h, self._in_build_base('gpgme.h'))
        self._generate_errors_i()

        # Copy due to https://bugs.python.org/issue2624
        # Avoid creating in srcdir
        for source, target in ((in_srcdir(n), self._in_build_base(n))
                               for n in ('gpgme.i', 'helpers.c', 'private.h',
                                         'helpers.h')):
            if not up_to_date(source, target):
                shutil.copy2(source, target)

        # Append generated files via build_base
        if not os.path.exists(os.path.join(self.build_lib, 'gpg')):
            os.makedirs(os.path.join(self.build_lib, 'gpg'))
        shutil.copy2('version.py', os.path.join(self.build_lib, 'gpg'))

    def run(self):
        self._generate()

        swig_sources.extend((self._in_build_base('gpgme.i'),
                             self._in_build_base('helpers.c')))
        swig_opts.extend([
            '-I' + self.build_base, '-outdir',
            os.path.join(self.build_lib, 'gpg')
        ])
        include_dirs.insert(0, self.build_base)

        self.run_command('build_ext')
        build.run(self)


py3 = [] if sys.version_info.major < 3 else ['-py3']
swig_sources = []
swig_opts = ['-threads'] + py3 + extra_swig_opts
swige = Extension(
    'gpg._gpgme',
    sources=swig_sources,
    swig_opts=swig_opts,
    include_dirs=include_dirs,
    define_macros=define_macros,
    library_dirs=library_dirs,
    extra_link_args=libs)

setup(
    name='gpg',
    cmdclass={'build': BuildExtFirstHack},
    version='1.18.0',
    # Note: description appears as Summary in egg-info file.
    description='Python bindings to the GPGME API of the GnuPG cryptography library.',
    # Note: long-description appears as Description in egg-info file.
    long_description='''Dynamically generated bindings to the C API of the GNU Privacy Guard.

The GPG Made Easy (GPGME) library provides a high-level API in C to all the
component software and libraries in the GnuPG Project, including GPG itself
(the GnuPG OpenPGP implementation), libgcrypt, libgpg-error, libassuan and
more.

The official CPython bindings to GPGME are generated during the compiling
process of GPGME itself and built for the specific C header and include files
produced when GPGME is compiled using SWIG.  This provides access to over two
thousand functions, methods and values via both the lower level dynamically
generated bindings and a more intuitively pythonic higher level layer.

While the lower level, dynamically generated bindings provide access to
everything which GPGME itself provides; the higher level layer is easier to use
by Python developers, provides access to the vast majority of functionality
developers would want from GnuPG and is extensively documented.

GPGME and these bindings is available here:

    https://gnupg.org/software/gpgme/index.html
''',
    author='The GnuPG hackers',
    author_email='gnupg-devel@gnupg.org',
    url='https://www.gnupg.org',
    ext_modules=[swige],
    packages=[
        'gpg', 'gpg.constants', 'gpg.constants.data', 'gpg.constants.keylist',
        'gpg.constants.sig', 'gpg.constants.tofu'
    ],
    license='LGPL2.1+ (the library), GPL2+ (tests and examples)',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: GNU Lesser General Public License v2 or later (LGPLv2+)',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Operating System :: POSIX',
        'Operating System :: Microsoft :: Windows',
        'Topic :: Communications :: Email',
        'Topic :: Security :: Cryptography',
    ],
)
