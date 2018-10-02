from distutils.core import setup
setup(
  name = 'venomkb',
  packages = ['venomkb'],
  version = 0.1, # This version number is different from the overall VenomKB release
  description = 'Tools and scripts for building and interacting with VenomKB',
  author = 'Joseph D. Romano and Marine Saint Mezard',
  author_email = 'jdr2160@cumc.columbia.edu',
  url = 'https://github.com/jdromano2/venomkb',
  keywords = ['venomkb', 'venom', 'neo4j', 'toxinology', 'informatics', 'ontology'],
  classifiers = [
    'Development Status :: 5 - Production/Stable',
    'Environment::Console',
    'Intended Audience :: Science/Research',
    'License :: OSI Approved :: GNU General Public License v3 (GPLv3)',
    'Natural Language :: English',
    'Operating System :: Unix',
    'Programming Language :: Python :: 2.7',
    'Topic :: Scientific/Engineering :: Bio-Informatics'
  ]
)