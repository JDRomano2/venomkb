from __future__ import print_function
import json
import dbinit_helpers
import time
import random

###########
## Types ##
###########

def _int32(x):
    """Truncates to 32 least significant bits"""
    return int(0xFFFFFFFF & x)


class OutLink(object):
    """Container for a link to an external database"""
    def __init__(self, db_name=None, db_id=None, db_obj=None):
        self.db_name = db_name
        self.db_id = db_id
        self.db_obj = db_obj

    def __repr__(self):
        """Hacky way to convert to json"""
        return str(self.to_dict())

    def to_dict(self):
        return self.__dict__


class OutLinks(object):
    """Container for a dict of links to external databases"""
    def __init__(self, links_dict=None):
        self.links = {}
        if links_dict is not None:
            self.from_dict(links_dict)

    def __repr__(self):
        """Hacky way to convert to json"""
        return str(self.to_dict())

    def add_link(self, db_name=None, foreign_id=None, db_obj=None):
        """Append an OutLink object to self"""
        if db_name == None:
            print("ERROR: Must pass db_name when adding OutLink")
            raise ValueError
        self.links[db_name] = OutLink(db_name=db_name, db_id=foreign_id, db_obj=db_obj)

    def from_dict(self, links_dict):
        """Given a Python dict, build a list of database references"""
        if links_dict is None:
            try:
                raise ValueError
            except ValueError:
                print("Error: no external links passed")
                raise
        for k, val in links_dict.iteritems():
            if isinstance(val, str):
                self.add_link(db_name=k, foreign_id=val)
            else:
                self.add_link(db_name=k, db_obj=val)

    def to_dict(self):
        return self.links


class Collection(object):
    """Generic container for a data record in VenomKB"""
    def __init__(self, vkbid=None, name=None, ols=OutLinks(),
                 mongoid=None, id_gen=None):
        if (vkbid is not None) and (id_gen is not None):
            raise ValueError('Can only pass argument for one: \'vkbid\' and \'id_gen\'')
        if vkbid is not None:
            self.venomkb_id = vkbid
        elif id_gen is not None:
            self.venomkb_id = id_gen.new_id(self.__class__)
        self.name = name
        self.out_links = ols
        self._mongo_id = mongoid

    def to_json(self, include_mongo_id=False):
        """Write a single data record to JSON format"""
        if include_mongo_id:
            return eval(str(self.__dict__))
        d_temp = eval(str(self.__dict__))
        return {i:d_temp[i] for i in d_temp if i != '_mongo_id'}

    def validate_attributes(self):
        """Check that all attributes are a valid format"""
        pass


class Protein(Collection):
    """Container class for holding Protein objects"""
    def __init__(self,
                 description=None,
                 aa_sequence=None,
                 **kwargs):
        """Most attributes have default initialization to None"""
        super(Protein, self).__init__(**kwargs)
        self.description = description
        self.aa_sequence = aa_sequence
        self.venom_ref = None

    def impute_species_of_origin(self):
        """Using ncbi taxon data, find species of origin and edit matching
        Species record accordingly"""
        _refs = self.out_links
        _ncbi_tax_refs = [ol.db_id for ol in _refs if ol.db_name]
        # TODO: Finish this


class Species(Collection):
    """Container class for a Species in VenomKB"""
    def __init__(self, common_name=None, **kwargs):
        super(Species, self).__init__(**kwargs)
        self.common_name = common_name
        self.venom_ref = None


class Genome(Collection):
    """Container class for a Venom in VenomKB"""
    def __init__(self, project_homepage=None, **kwargs):
        super(Genome, self).__init__(**kwargs)
        self.project_homepage = project_homepage


class MolecularEffect(Collection):
    """Container class for an effect a venom has on a molecular structure"""
    def __init__(self, **kwargs):
        super(MolecularEffect, self).__init__(**kwargs)
        self.proteins_caused_by = []


class SystemicEffect(Collection):
    """Container class for a higher-order effect a venom has on the human body"""
    def __init__(self, **kwargs):
        super(SystemicEffect, self).__init__(**kwargs)
        self.proteins_caused_by = []


class IdGenerator(object):
    """Generates unique VenomKB IDs using the Mersenne Twister algorithm"""
    def __init__(self, seed=None, length=7):
        if seed is None:
            # Seed from current time
            seed = int(time.time())
        random.seed(a=seed)
        self._length = length
        self._prefix_dict = {
            Protein: 'P',
            Species: 'S',
            MolecularEffect: 'M',
            SystemicEffect: 'E'
        }

    def new_id(self, type=Collection):
        """Generate the next id given the type provided by the user"""
        if not issubclass(type, Collection):
            raise ValueError('Must pass argument of type Collection to IdGenerator.new_id()')
        prefix = self._prefix_dict[type]
        suffix = random.randint(1, (10**self._length) - 1)
        return prefix + str(suffix).zfill(self._length)