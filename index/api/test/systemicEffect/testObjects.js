module.exports = {
    protein_linked :  {
        "description": "Basic protein that binds to cell membrane and depolarizes cardiomyocytes. This cytotoxin also possesses lytic activity on many other cells, including red blood cells (PubMed:8182052). Interaction with sulfatides in the cell membrane induces pore formation and cell internalization. Cytotoxicity is due to pore formation, and to another mechanism independent of membrane-damaging activity. When internalized, it targets the mitochondrial membrane and induces mitochondrial swelling and fragmentation. It inhibits protein kinases C. It binds to the integrin alpha-V/beta-3 (ITGAV/ITGB3) with a moderate affinity (PubMed:16407244). It also binds with high affinity to heparin (PubMed:17685633).",
        "aa_sequence": "MKTLLLTLVVVTIVCLDLGYTLKCNKLVPLFYKTCPAGKNLCYKMFMVATPKVPVKRGCIDVCPKSSLLVKYVCCNTDRCN",
        "venomkb_id": "P1710142",
        "venom_ref": "V6067040",
        "name": "Cytotoxin 3",
        "pdb_image_url": "http://www.rcsb.org/pdb/images/None_bio_r_250.jpg",
        "pdb_structure_known": true,
        "annotation_score": 5,

    },
    protein_linked1 :   {
        "description": "Basic protein that bind to cell membrane and depolarizes cardiomyocytes. This cytotoxin also shows lytic activities, on many other cells including red blood cells. Interaction with sulfatides in the cell membrane induces pore formation and cell internalization and is responsible for cytotoxicity in cardiomyocytes. It targets the mitochondrial membrane and induces mitochondrial swelling and fragmentation. Inhibits protein kinases C (By similarity). It binds to the integrin alpha-V/beta-3 with a moderate affinity (PubMed:16407244).",
        "aa_sequence": "MKTLLLTLVVVTIVCLDLGYTLKCNQLIPPFYKTCAAGKNLCYKMFMVAAPKVPVKRGCIDVCPKSSLLVKYVCCNTDRCN",
        "venomkb_id": "P1674800",
        "venom_ref": "V6067040",
        "name": "Cytotoxin 6",
        "pdb_image_url": "http://www.rcsb.org/pdb/images/None_bio_r_250.jpg",
        "pdb_structure_known": true,
        "annotation_score": 5,

    },
    systemic_effect: {
        name: 'Heart Diseases',
        venomkb_id: 'E0870492',
        protein_annotations:
            [{protein: 'P1710142', eco_id: 'ECO_0000322' },
            { protein: 'P1674800', eco_id: 'ECO_0000322' }]
    },

     systemic_effect1: {
        name: 'Heart Diseases',
        venomkb_id: 'E0870492',
        protein_annotations:
            [{protein: 'P1710142', eco_id: 'ECO_0000322' },
            { protein: 'P1674800', eco_id: 'ECO_0000322' }]
    }, systemic_effect_without_name : {
        venomkb_id: 'E3044409',
        protein_annotations:
        [ { protein: 'P3990402', eco_id: 'ECO_0000322' },
            { protein: 'P4528361', eco_id: 'ECO_0000322' },
            { protein: 'P1144524', eco_id: 'ECO_0000322' } ]
    },  systemic_effect_without_venombk_id: {
        name: 'Sciatica',
        protein_annotations:
        [ { protein: 'P3990402', eco_id: 'ECO_0000322' },
            { protein: 'P4528361', eco_id: 'ECO_0000322' },
            { protein: 'P1144524', eco_id: 'ECO_0000322' } ] },
}