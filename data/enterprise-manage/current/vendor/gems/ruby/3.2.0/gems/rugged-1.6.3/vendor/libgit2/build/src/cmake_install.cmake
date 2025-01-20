# Install script for directory: /workspace/enterprise2-publish/repos-focal/enterprise-manage/vendor/gems/ruby/3.2.0/gems/rugged-1.6.3/vendor/libgit2/src

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/usr/local")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "RelWithDebInfo")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Install shared libraries without execute permission?
if(NOT DEFINED CMAKE_INSTALL_SO_NO_EXE)
  set(CMAKE_INSTALL_SO_NO_EXE "1")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for each subdirectory.
  include("/workspace/enterprise2-publish/repos-focal/enterprise-manage/vendor/gems/ruby/3.2.0/gems/rugged-1.6.3/vendor/libgit2/build/deps/http-parser/cmake_install.cmake")
  include("/workspace/enterprise2-publish/repos-focal/enterprise-manage/vendor/gems/ruby/3.2.0/gems/rugged-1.6.3/vendor/libgit2/build/deps/pcre/cmake_install.cmake")
  include("/workspace/enterprise2-publish/repos-focal/enterprise-manage/vendor/gems/ruby/3.2.0/gems/rugged-1.6.3/vendor/libgit2/build/deps/ntlmclient/cmake_install.cmake")
  include("/workspace/enterprise2-publish/repos-focal/enterprise-manage/vendor/gems/ruby/3.2.0/gems/rugged-1.6.3/vendor/libgit2/build/src/libgit2/cmake_install.cmake")
  include("/workspace/enterprise2-publish/repos-focal/enterprise-manage/vendor/gems/ruby/3.2.0/gems/rugged-1.6.3/vendor/libgit2/build/src/util/cmake_install.cmake")

endif()

