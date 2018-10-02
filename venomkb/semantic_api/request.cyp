MATCH (p:Protein {vkbid:"P0307338"})
MATCH (s:Species)-[:HAS_VENOM_COMPONENT]->(p) RETURN p.vkbid, p.score, count(m)
MATCH (p)-[:IS_A]->(f:Pfam)
RETURN p.name, p.annotation_score, p.UnitProtKB_id, p.aa_sequence, s.name, count(f), f.name