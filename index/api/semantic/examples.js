'use strict';

module.exports = {
    ex1: {
        "select": "Species",
        "declare": {
            "Protein": [
                {
                    "attribute": "name",
                    "operator": "contains",
                    "value": "phospholipase"
                }
            ]
        },
        "aggregate": {
            "distinct": {
                "class": "Species"
            },
            "count": {
                "class": "Species",
            }
        
        }
    },
    // Ask: 'How many species have at least one protein with the word "Phospholipase" in its name?
    //
    // Query:
    // MATCH(p: Protein)- [: PROTEIN_FROM_SPECIES] -> (s: Species)
    // WHERE p.name contains 'phospholipase'
    // RETURN count(distinct s)
    // //
    // Expect: '139'

    ex2: {
        "select": "Species",
        "aggregate": {
            "count": {
                "class": "Protein",
            },
            "sort": "desc",
            "limit": 1
        }
    },
    // Ask: 'What species has the most proteins?'
    //
    // Query:
    //MATCH (s:Species)-[:SPECIES_HAS_PROTEIN]->(p:Protein)
    //RETURN s count(p) ORDER BY count(p) DESC LIMIT 1
    //
    // Expect: 'Haplopelma hainanum'

    ex3: {
        "select": {"Species": "name"},
        "declare": {
            "Protein": [
                {
                    "attribute": "name",
                    "operator": "contains",
                    "value": "Phospholipase A2"
                }
            ]
        }
    },
    // Ask: 'Which species have a Phospholipase A2 in their venom?
    //
    // Query:
    // MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)
    // WHERE p.name CONTAINS 'Phospholipase A2'
    // RETURN s.name
    //
    // Expect: A list containing 81 species

    ex4: {
        "select": "Pfam",
        "declare": {
            "Species": [
                {
                    "attribute": "name",
                    "operator": "contains",
                    "value": "Conus"
                }
            ]
        },
        "aggregate": {
            "distinct" : {
                "class": "Pfam",
                "attribute": "name"
            }
        }
    },
    // Ask: 'Which protein families are in venom of species in the genus Conus?'
    //
    // Query:
    // MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)-[:IS_A]->(f:Pfam)
    // WHERE s.name CONTAINS 'Conus'
    // RETURN DISTINCT f.name
    //
    // Expect: A list containing 24 Pfams

    ex5: {
        "select": "Pfam",
        "declare": {
            "Species": [
                {
                    "attribute": "name",
                    "operator": "equals",
                    "value": "Crotalus adamanteus"
                }
            ]
        },
        "post_treatment": {
            "bincount": {
                "attribute": "name",
                "order": "descending"
            }
        }
    },
    // Ask: 'Count all the occurrences of PFAM ids in each of the proteins in
    // Crotalus adamanteus' venom'
    //
    // Query:
    // MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)-[:IS_A]->(f:Pfam)
    // WHERE s.name =~ 'Crotalus adamanteus'
    // RETURN f.name
    //
    // THEN:
    // Apply 'bincount' function (in javascript); returning the output to user
    //
    // Expect:

    ex6: {
        "select": "Species",
        "declare": {
            "Pfam": [
                {
                    "attribute": "name",
                    "operator": "equals",
                    "value": "Reprolysin"
                }
            ]
        },
        "aggregate": {
            "distinct" : {
                "class": "Species",
                "attribute": "name"
            }
        }
    },
    // Ask: 'Which species in VenomKB have at lest one protein from the
    // "Reprolysin" family?'
    //
    // Query:
    // MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)-[:IS_A]->(f:Pfam)
    // WHERE f.name =~ 'Reprolysin'
    // RETURN distinct s.name

    ex7: {
        "select": "Species",
        "declare": {
            "Species": [
                {
                    "attribute": "name",
                    "operator": "contains",
                    "value": "Conus"
                }
            ],
            "SystemicEffect": [
                {
                    "attribute": "name",
                    "operator": "equals",
                    "value": "Neuralgia"
                }
            ]
        },
        "post-treatment": {
            "exists": true
        }
    },
    // Ask: 'Do any proteins from Conus species treat Neuralgia?'
    //
    // Query:
    // MATCH (s:Species)-[:HAS_PROTEIN]->(p:Protein)-[:INFLUENCES_SYSTEMIC_EFFECT]->(e:SystemicEffect)
    // WHERE s.name CONTAINS 'Conus' AND e.name =~ 'Neuralgia'
    // RETURN s
    //
    // Then:
    // In javascript, is the length of the return value greater than zero?
    //
    // Expect:
    // boolean True

    ex8: {
        "select": [{"Species":"name"}, "Protein"],
        "declare": {
            "SystemicEffect": [
                {
                    "attribute": "name",
                    "operator": "equals",
                    "value": "Osteosarcoma"
                }
            ]
        },
        "aggregate": {
            "distinct": {
                "attribute" : "name",
                "class": "Species"
            },    
            "count" : {
                "class" : "Protein"
            }
        }
    }
    // Ask: 'What species and what proteins are related to Osteosarcoma?'
    //
    // Query:
    //  MATCH(s: Species)- [: SPECIES_HAS_PROTEIN] -> (p: Protein) -[: INFLUENCES_SYSTEMIC_EFFECT] -> (e: SystemicEffect)
    // WHERE e.name = 'Osteosarcoma'
    // RETURN DISTINCT s.name, p
    //
    
    // Expect:
    // 1 species : "Crotalus viridis viridis"
    // 1 protein : Zinc metalloproteinase-disintegrin-like crovidisin
}