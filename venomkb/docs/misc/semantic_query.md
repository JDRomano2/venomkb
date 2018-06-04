## Semantic Query API documentation
### Author: Joseph D. Romano
### Date: June 4, 2018
- - -

### Tl;dr:

- Semantic queries should be thought of as _a set of operations to sequentially restrict the graph representation of VenomKB_.
- The top-level components of a query are shown below, in [Basic format](#basic-format).
- Two main sources of errors: (1) Incorrect syntax, or (2) the query is _underspecified_.
- We provide a function for encoding the JSON representation of user queries into the request URL. You can construct the URL manually, but it might get unwieldy quickly.
- Query language takes cues from SQL, SPARQL, GraphQL, MongoDB, and other database technologies.

- - -

#### Basic format:

```javascript
{
    "relations": [
        // Description of a subgraph for restricting the search space
        // OFTEN OPTIONAL--we can infer these!
        //
        // Rule of thumb--if your results need to be further refined, use this
        // to tell VenomKB the specific relationships you want to focus on
    ],
    "declare": {
        // Known properties (e.g., limit proteins to ones containing the
        // word "phospholipase")
    },
    "select": [
        // List of values that you want the query to return
    ],
    "aggregate": {
        // Transformations to apply to the selected data
        // E.g., Counting, ordering, summing, etc.
    }
}
```
- - -

### Example 1

English:
> "How many venomous species have at least one protein with the word "Phospholipase" in its name?"

Cypher:
```cypher
MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)
WHERE p.name CONTAINS 'Phospholipase' OR p.name CONTAINS 'phospholipase'
RETURN count(distinct s)
```

VenomKB semantic API query (long form):
```javascript
{
    "relations": [
        ["s:Species", "HAS_VENOM_COMPONENT", "p:Protein"]
    ],
    "declare": {
        "p": {
            "name": {"contains": "phospholipase"}
        }
    },
    "select": [
        "s"
    ],
    "aggregate" {
        "count": "s"
    }
}
```

VenomKB semantic API query (short form):
```javascript
{
    "declare": {
        "Protein": { "name": {"contains": "phospholipase"} }
    },
    "select": "Species",
    "aggregate": { "count": "Species" }
}
```

### Example 2

English:

> “What species has the most proteins?”

Cypher:

```
MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)
RETURN s.name, count(p) ORDER BY count(p) DESC
```

VenomKB semantic api:

```javascript
{
    "select": "Species",
    "aggregate": {
        "order_desc": {"count": "Proteins"}
        "limit": 1
    }
}
```

###Example 3

English:

> “What are all of the species with a Phospholipase A2 in their venom?”

Cypher:

```
MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)
WHERE p.name CONTAINS 'Phospholipase A2'
RETURN s.name
```

VenomKB semantic api:

```javascript
{
    "declare": {
        "Protein": { "name": { "contains": "Phospholipase A2" } }
    },
    "select": { "Species": "name" }
}
```

### Example 4

English:

> “What protein families are represented in the venom of species in the genus Conus?”

Cypher:

```
MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p:Protein)-[IS_A]->(f:Pfam)
WHERE s.name CONTAINS 'Conus'
RETURN DISTINCT f.name
```

VenomKB semantic API:

```javascript
{
    "declare": {
        "Species": { "name": { "contains": "Conus" } }
    },
    "select": {
        "Protein": "PFAM"
    }
    "aggregate": "unique"
}
```

- - -

## Query language specification

For a formal set of syntax rules, refer to the end of this section.

#### `relations`
The ontology used to structure VenomKB allows for **automated reasoning over linked datatypes**. For example, if the user asks for diseases that can be treated by a species' venom, the 'link' between species and disease can be inferred to be proteins. For this reason, **the user often doesn't need to explicitly define `relations`**.

A list of [semantic triples](https://en.wikipedia.org/wiki/Semantic_triple), each in the form `["SUBJECT", "PREDICATE", "OBJECT"]`. Overall, the `relations` object takes the form:

```javascript
"relations": [
    RELATION,
    ...
]
```

Accordingly, `RELATION` takes the form:
```javascript
["SUBJECT", "PREDICATE", "OBJECT"]
```

Both the `SUBJECT` and the `OBJECT` should be *ontology classes* (not individual data elements) present in the Venom Ontology, and the `PREDICATE` should be the string name of a relationship that connects the `SUBJECT` to the `OBJECT`.

The user should also prefix the class names in `SUBJECT` and `OBJECT` with a variable name that can be used to refer to these classes elsewhere in the query (similar to Cypher syntax).

E.g., `["s:Species", "HAS_VENOM_COMPONENT", "p:Protein"]`

#### `declare`
A JSON object containing zero or more `name`/`value` pairs, assuming the following form:

``` javascript
"declare": {
    DECLARATION,
    ...
}
```

A `DECLARATION` takes the form:
```javascript
REFERENCE: {
    RULE,
    ...
}
```

A `RULE` takes the form:
```javascript
PROPERTY: { TEST: VALUE, ... }
```

In this object, a `PROPERTY` is the label for a data field defined for a certain ontology class (e.g., all Proteins have an `aa_sequence` property). `TEST` is a boolean operation that can be applied to the `VALUE` of that property. For a full list of `TEST`s, refer to (TODO).

#### `select`

In `select`, the user specifies a list (e.g., one or more) of entity types to retrieve from the subgraph generated by `relations` and `declare`. These can either be ontology classes (e.g., `Protein`), or a reference defined in `relations` (e.g., `p`).

#### `aggregate`

In `aggregate`, the user applies transformations to the element(s) that was/were `select`ed.