'use strict';

module.exports = {
    ex1: {
        "select": "Species",
        "declare": {
            "Protein": {
                "name": {"contains": "phospholipase"}
            }
        },
        "aggregate": {
            "count": "Species"
        }
    },
    // Ask: 'How many species have at least one protein with the word "Phospholipase" in its name?
    //
    // Query:
    // MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)
    // WHERE p.name CONTAINS 'Phospholipase' OR p.name CONTAINS 'phospholipase'
    // RETURN count(distinct s)
    //
    // Expect: '139'

    ex2: {
        "select": "Species",
        "aggregate": {
            "count": "Protein",
            "sort": "desc",
            "limit": 1
        }
    },
    // Ask: 'What species has the most proteins?'
    //
    // Query:
    // MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)
    // RETURN s.name, count(p) ORDER BY count(p) DESC LIMIT 1
    //
    // Expect: 'Haplopelma hainanum'

    ex3: {
        "select": {"Species": "name"},
        "declare": {
            "Protein": {
                "name": {"contains": "Phospholipase A2"}
            }
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
            "Species": {
                "name": {"contains": "Conus"}
            }
        },
        "aggregate": {
            "distinct": "Pfam"
        }
    }
    // Ask: 'Which protein families are in venom of species in the genus Conus?'
    //
    // Query:
    // MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)-[IS_A]->(f:Pfam)
    // WHERE s.name CONTAINS 'Conus'
    // RETURN DISTINCT f.name
    //
    // Expect: A list containing 24 Pfams
}