
SHELL = /bin/sh

# V=0 quiet, V=1 verbose.  other values don't work.
V = 0
V0 = $(V:0=)
Q1 = $(V:1=)
Q = $(Q1:0=@)
ECHO1 = $(V:1=@ :)
ECHO = $(ECHO1:0=@ echo)
NULLCMD = :

#### Start of system configuration section. ####

srcdir = .
topdir = /usr/share/rbenv/versions/3.3.4/include/ruby-3.3.0
hdrdir = $(topdir)
arch_hdrdir = /usr/share/rbenv/versions/3.3.4/include/ruby-3.3.0/x86_64-linux
PATH_SEPARATOR = :
VPATH = $(srcdir):$(arch_hdrdir)/ruby:$(hdrdir)/ruby
prefix = $(DESTDIR)/usr/share/rbenv/versions/3.3.4
rubysitearchprefix = $(rubylibprefix)/$(sitearch)
rubyarchprefix = $(rubylibprefix)/$(arch)
rubylibprefix = $(libdir)/$(RUBY_BASE_NAME)
exec_prefix = $(prefix)
vendorarchhdrdir = $(vendorhdrdir)/$(sitearch)
sitearchhdrdir = $(sitehdrdir)/$(sitearch)
rubyarchhdrdir = $(rubyhdrdir)/$(arch)
vendorhdrdir = $(rubyhdrdir)/vendor_ruby
sitehdrdir = $(rubyhdrdir)/site_ruby
rubyhdrdir = $(includedir)/$(RUBY_VERSION_NAME)
vendorarchdir = $(vendorlibdir)/$(sitearch)
vendorlibdir = $(vendordir)/$(ruby_version)
vendordir = $(rubylibprefix)/vendor_ruby
sitearchdir = $(sitelibdir)/$(sitearch)
sitelibdir = $(sitedir)/$(ruby_version)
sitedir = $(rubylibprefix)/site_ruby
rubyarchdir = $(rubylibdir)/$(arch)
rubylibdir = $(rubylibprefix)/$(ruby_version)
sitearchincludedir = $(includedir)/$(sitearch)
archincludedir = $(includedir)/$(arch)
sitearchlibdir = $(libdir)/$(sitearch)
archlibdir = $(libdir)/$(arch)
ridir = $(datarootdir)/$(RI_BASE_NAME)
mandir = $(datarootdir)/man
localedir = $(datarootdir)/locale
libdir = $(exec_prefix)/lib
psdir = $(docdir)
pdfdir = $(docdir)
dvidir = $(docdir)
htmldir = $(docdir)
infodir = $(datarootdir)/info
docdir = $(datarootdir)/doc/$(PACKAGE)
oldincludedir = $(DESTDIR)/usr/include
includedir = $(prefix)/include
runstatedir = $(localstatedir)/run
localstatedir = $(prefix)/var
sharedstatedir = $(prefix)/com
sysconfdir = $(prefix)/etc
datadir = $(datarootdir)
datarootdir = $(prefix)/share
libexecdir = $(exec_prefix)/libexec
sbindir = $(exec_prefix)/sbin
bindir = $(exec_prefix)/bin
archdir = $(rubyarchdir)


CC_WRAPPER = 
CC = gcc
CXX = g++
LIBRUBY = $(LIBRUBY_A)
LIBRUBY_A = lib$(RUBY_SO_NAME)-static.a
LIBRUBYARG_SHARED = -Wl,-rpath,$(libdir) -L$(libdir) 
LIBRUBYARG_STATIC = -Wl,-rpath,$(libdir) -L$(libdir) -l$(RUBY_SO_NAME)-static $(MAINLIBS)
empty =
OUTFLAG = -o $(empty)
COUTFLAG = -o $(empty)
CSRCFLAG = $(empty)

RUBY_EXTCONF_H = 
cflags   = $(optflags) $(debugflags) $(warnflags)
cxxflags = 
optflags = -O3 -fno-fast-math
debugflags = -ggdb3
warnflags = -Wall -Wextra -Wdeprecated-declarations -Wdiv-by-zero -Wduplicated-cond -Wimplicit-function-declaration -Wimplicit-int -Wpointer-arith -Wwrite-strings -Wold-style-definition -Wimplicit-fallthrough=0 -Wmissing-noreturn -Wno-cast-function-type -Wno-constant-logical-operand -Wno-long-long -Wno-missing-field-initializers -Wno-overlength-strings -Wno-packed-bitfield-compat -Wno-parentheses-equality -Wno-self-assign -Wno-tautological-compare -Wno-unused-parameter -Wno-unused-value -Wsuggest-attribute=format -Wsuggest-attribute=noreturn -Wunused-variable -Wmisleading-indentation -Wundef
cppflags = 
CCDLFLAGS = -fPIC
CFLAGS   = $(CCDLFLAGS) -g -O2 -fdebug-prefix-map=/tmp/brew2deb/packages/ruby=. -fstack-protector-strong -Wformat -Werror=format-security -Wall -Wextra -funroll-loops $(ARCH_FLAG)
INCFLAGS = -I. -I$(arch_hdrdir) -I$(hdrdir)/ruby/backward -I$(hdrdir) -I$(srcdir)
DEFS     = 
CPPFLAGS = -DHAVE_STDINT_H -DHAVE_RB_GC_MARK_MOVABLE -DHAVE_ENDPOS_ARGUMENT -DHAVE_ERROR_INFO_ARGUMENT -I/github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/include -I/github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/libre2/2024-03-01/include -Wdate-time -D_FORTIFY_SOURCE=2 $(DEFS) $(cppflags) -Wno-register
CXXFLAGS = $(CCDLFLAGS) -g -O2 -fdebug-prefix-map=/tmp/brew2deb/packages/ruby=. -fstack-protector-strong -Wformat -Werror=format-security $(ARCH_FLAG)
ldflags  = -L. -Wl,-Bsymbolic-functions -Wl,-z,relro -fstack-protector-strong -rdynamic -Wl,-export-dynamic -pthread /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/libre2/2024-03-01/lib/libre2.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_flags_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_flags_marshalling.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_flags_reflection.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_flags_private_handle_accessor.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_flags_commandlineflag.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_flags_commandlineflag_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_flags_config.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_flags_program_name.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_cord.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_cordz_info.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_cord_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_cordz_functions.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_cordz_handle.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_crc_cord_state.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_crc32c.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_crc_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_crc_cpu_detect.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_raw_hash_set.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_hash.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_city.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_bad_variant_access.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_low_level_hash.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_hashtablez_sampler.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_exponential_biased.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_bad_optional_access.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_str_format_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_synchronization.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_graphcycles_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_kernel_timeout_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_stacktrace.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_symbolize.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_debugging_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_demangle_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_malloc_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_time.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_civil_time.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_strings.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_strings_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_string_view.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_base.a -lrt /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_spinlock_wait.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_int128.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_throw_delegate.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_raw_logging_internal.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_log_severity.a /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib/libabsl_time_zone.a
dldflags = -Wl,-Bsymbolic-functions -Wl,-z,relro -Wl,--compress-debug-sections=zlib 
ARCH_FLAG = 
DLDFLAGS = $(ldflags) $(dldflags) $(ARCH_FLAG)
LDSHARED = $(CC) -shared
LDSHAREDXX = $(CXX) -shared
AR = gcc-ar
EXEEXT = 

RUBY_INSTALL_NAME = $(RUBY_BASE_NAME)
RUBY_SO_NAME = ruby
RUBYW_INSTALL_NAME = 
RUBY_VERSION_NAME = $(RUBY_BASE_NAME)-$(ruby_version)
RUBYW_BASE_NAME = rubyw
RUBY_BASE_NAME = ruby

arch = x86_64-linux
sitearch = $(arch)
ruby_version = 3.3.0
ruby = $(bindir)/$(RUBY_BASE_NAME)
RUBY = $(ruby)
BUILTRUBY = $(bindir)/$(RUBY_BASE_NAME)
ruby_headers = $(hdrdir)/ruby.h $(hdrdir)/ruby/backward.h $(hdrdir)/ruby/ruby.h $(hdrdir)/ruby/defines.h $(hdrdir)/ruby/missing.h $(hdrdir)/ruby/intern.h $(hdrdir)/ruby/st.h $(hdrdir)/ruby/subst.h $(arch_hdrdir)/ruby/config.h

RM = rm -f
RM_RF = rm -fr
RMDIRS = rmdir --ignore-fail-on-non-empty -p
MAKEDIRS = /usr/bin/mkdir -p
INSTALL = /usr/bin/install -c
INSTALL_PROG = $(INSTALL) -m 0755
INSTALL_DATA = $(INSTALL) -m 644
COPY = cp
TOUCH = exit >

#### End of system configuration section. ####

preload = 
libpath = . $(libdir) /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib /github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/libre2/2024-03-01/lib
LIBPATH =  -L. -L$(libdir) -Wl,-rpath,$(libdir) -L/github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib -Wl,-rpath,/github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/abseil/20240116.1/lib -L/github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/libre2/2024-03-01/lib -Wl,-rpath,/github/vendor/gems/3.3.4/ruby/3.3.0/gems/re2-2.9.0/ports/x86_64-pc-linux/libre2/2024-03-01/lib
DEFFILE = 

CLEANFILES = mkmf.log
DISTCLEANFILES = 
DISTCLEANDIRS = 

extout = 
extout_prefix = 
target_prefix = 
LOCAL_LIBS = 
LIBS =  -lstdc++  -lm -lpthread  -ljemalloc -lc
ORIG_SRCS = re2.cc
SRCS = $(ORIG_SRCS) 
OBJS = re2.o
HDRS = 
LOCAL_HDRS = 
TARGET = re2
TARGET_NAME = re2
TARGET_ENTRY = Init_$(TARGET_NAME)
DLLIB = $(TARGET).so
EXTSTATIC = 
STATIC_LIB = 

TIMESTAMP_DIR = .
BINDIR        = $(bindir)
RUBYCOMMONDIR = $(sitedir)$(target_prefix)
RUBYLIBDIR    = $(sitelibdir)$(target_prefix)
RUBYARCHDIR   = $(sitearchdir)$(target_prefix)
HDRDIR        = $(sitehdrdir)$(target_prefix)
ARCHHDRDIR    = $(sitearchhdrdir)$(target_prefix)
TARGET_SO_DIR =
TARGET_SO     = $(TARGET_SO_DIR)$(DLLIB)
CLEANLIBS     = $(TARGET_SO) false
CLEANOBJS     = $(OBJS) *.bak
TARGET_SO_DIR_TIMESTAMP = $(TIMESTAMP_DIR)/.sitearchdir.time

all:    $(DLLIB)
static: $(STATIC_LIB)
.PHONY: all install static install-so install-rb
.PHONY: clean clean-so clean-static clean-rb

clean-static::
clean-rb-default::
clean-rb::
clean-so::
clean: clean-so clean-static clean-rb-default clean-rb
		-$(Q)$(RM_RF) $(CLEANLIBS) $(CLEANOBJS) $(CLEANFILES) .*.time

distclean-rb-default::
distclean-rb::
distclean-so::
distclean-static::
distclean: clean distclean-so distclean-static distclean-rb-default distclean-rb
		-$(Q)$(RM) Makefile $(RUBY_EXTCONF_H) conftest.* mkmf.log
		-$(Q)$(RM) core ruby$(EXEEXT) *~ $(DISTCLEANFILES)
		-$(Q)$(RMDIRS) $(DISTCLEANDIRS) 2> /dev/null || true

realclean: distclean
install: install-so install-rb

install-so: $(DLLIB) $(TARGET_SO_DIR_TIMESTAMP)
	$(INSTALL_PROG) $(DLLIB) $(RUBYARCHDIR)
clean-static::
	-$(Q)$(RM) $(STATIC_LIB)
install-rb: pre-install-rb do-install-rb install-rb-default
install-rb-default: pre-install-rb-default do-install-rb-default
pre-install-rb: Makefile
pre-install-rb-default: Makefile
do-install-rb:
do-install-rb-default:
pre-install-rb-default:
	@$(NULLCMD)
$(TARGET_SO_DIR_TIMESTAMP):
	$(Q) $(MAKEDIRS) $(@D) $(RUBYARCHDIR)
	$(Q) $(TOUCH) $@

site-install: site-install-so site-install-rb
site-install-so: install-so
site-install-rb: install-rb

.SUFFIXES: .c .m .cc .mm .cxx .cpp .o .S

.cc.o:
	$(ECHO) compiling $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -c $(CSRCFLAG)$<

.cc.S:
	$(ECHO) translating $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -S $(CSRCFLAG)$<

.mm.o:
	$(ECHO) compiling $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -c $(CSRCFLAG)$<

.mm.S:
	$(ECHO) translating $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -S $(CSRCFLAG)$<

.cxx.o:
	$(ECHO) compiling $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -c $(CSRCFLAG)$<

.cxx.S:
	$(ECHO) translating $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -S $(CSRCFLAG)$<

.cpp.o:
	$(ECHO) compiling $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -c $(CSRCFLAG)$<

.cpp.S:
	$(ECHO) translating $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -S $(CSRCFLAG)$<

.c.o:
	$(ECHO) compiling $(<)
	$(Q) $(CC) $(INCFLAGS) $(CPPFLAGS) $(CFLAGS) $(COUTFLAG)$@ -c $(CSRCFLAG)$<

.c.S:
	$(ECHO) translating $(<)
	$(Q) $(CC) $(INCFLAGS) $(CPPFLAGS) $(CFLAGS) $(COUTFLAG)$@ -S $(CSRCFLAG)$<

.m.o:
	$(ECHO) compiling $(<)
	$(Q) $(CC) $(INCFLAGS) $(CPPFLAGS) $(CFLAGS) $(COUTFLAG)$@ -c $(CSRCFLAG)$<

.m.S:
	$(ECHO) translating $(<)
	$(Q) $(CC) $(INCFLAGS) $(CPPFLAGS) $(CFLAGS) $(COUTFLAG)$@ -S $(CSRCFLAG)$<

$(TARGET_SO): $(OBJS) Makefile
	$(ECHO) linking shared-object $(DLLIB)
	-$(Q)$(RM) $(@)
	$(Q) $(LDSHAREDXX) -o $@ $(OBJS) $(LIBPATH) $(DLDFLAGS) $(LOCAL_LIBS) $(LIBS)



$(OBJS): $(HDRS) $(ruby_headers)
