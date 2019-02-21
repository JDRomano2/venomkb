# "Lab notebook" for integration of VenomKB v1.0 data into VenomKB v2.0

## 05/30/2017

- Reran smdb_search.rb, modifying it slightly to give PREDICATION_ID in addition to the rest of the stuff. See `venomkb_v1_pmids.json` for results.

- Loaded output into mimir - user_jdr2160.smdb_search_results

- Augmented user_jdr2160.smdb_search_results to include more fields by joining with kb_semanticmedline.PREDICATION_AGGREGATE

- Found all PMIDs annotated to each toxprot entry, flattened the ragged lists, and created a table `user_jdr2160.toxprot_assoc_pmids_flat` 

## 05/31/2017

- Joined it with user_jdr2160.smdb_search_results_aggregated and downloaded the results to a local TSV file - `smdb_search_toxprot_pmid_overlap.tsv`