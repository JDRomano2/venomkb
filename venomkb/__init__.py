"""
VenomKB python tools
====================

Provides
  1. Utilities for bootstrapping VenomKB's back-end database
  2. Code for constructing the semantic API's graph database
  3. Convenience functions for interacting with VenomKB's contained data and API
"""

from __future__ import print_function, division, absolute_import

import sys
import warnings

try:
  # TODO: This will always raise! Need way to test for importing within source tree
  from venomkb.__config__ import show as show_config
except ImportError:
  msg = """Warning - you are importing venomkb from within its source tree. This
        can cause unexpected behavior when working with submodules. If you get
        import errors, this is a likely reason."""
  #raise ImportWarning(msg)
  print(msg)

from . import core
from .core import *
from . import api
from .api import *