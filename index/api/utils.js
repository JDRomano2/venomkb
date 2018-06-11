module.exports = {
    sendErrorMessage(res, err) {
        console.log(err.message);
        return res.status(500).send(err.message);
    },
    sendStatusMessage(res, status, message) {
        console.log(status, message);
        return res.status(status).send(message);
    },

    formatOutLinksSpecies(out_link) {
        let res = []
        let new_out_link = {
            resource: Object.keys(out_link)[0],
            primary_id: out_link["ncbi_taxonomy"]["id"],
            shared: false
        }
        res.push(new_out_link)
        return res
    },

    formatOutLinksProtein(out_links) {
        let res = []
        if (out_links["UniProtKB"]) {
            if (out_links["UniProtKB"]["id"]) {
                let new_out_link = {
                    resource: "UniProtKB",
                    primary_id: out_links["UniProtKB"]["id"],
                    shared: false
                }

                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["PANTHER"]) {
            if (out_links["PANTHER"]["id"]) {
                let new_out_link = {
                    resource: "PANTHER",
                    primary_id: out_links["PANTHER"]["id"],
                    shared: false
                }

                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["SUPFAM"]) {
            if (out_links["SUPFAM"]["attributes"]["name"]) {

                let new_out_link = {
                    resource: "SUPFAM",
                    primary_id: out_links["SUPFAM"]["attributes"]["name"],
                    shared: false
                }
                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["PIR"]) {
            if (out_links["PIR"]["attributes"]["name"]) {
                let new_out_link = {
                    resource: "PIR",
                    primary_id: out_links["PIR"]["attributes"]["name"],
                    shared: false
                }
                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["Pfam"]) {
            if (out_links["Pfam"]["attributes"]["name"]) {
                let new_out_link = {
                    resource: "Pfam",
                    primary_id: out_links["Pfam"]["attributes"]["name"],
                    shared: true
                }
                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["PRINTS"]) {
            if (out_links["PRINTS"]["attributes"]["name"]) {
                let new_out_link = {
                    resource: "PRINTS",
                    primary_id: out_links["PRINTS"]["attributes"]["name"],
                    shared: true
                }
                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["PROSITE"]) {
            if (out_links["PROSITE"]["attributes"]["name"]) {

                let new_out_link = {
                    resource: "PROSITE",
                    primary_id: out_links["PROSITE"]["attributes"]["name"],
                    shared: true
                }
                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["GO"]) {
            if (out_links["GO"]["attributes"]["term"]) {
                let new_out_link = {
                    resource: "GO",
                    primary_id: out_links["GO"]["attributes"]["term"],
                    shared: true
                }

                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["ProDom"]) {
            if (out_links["ProDom"]["attributes"]["name"]) {

                let new_out_link = {
                    resource: "ProDom",
                    primary_id: out_links["ProDom"]["attributes"]["name"],
                    shared: true
                }
                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["SMART"]) {
            if (out_links["SMART"]["attributes"]["name"]) {

                let new_out_link = {
                    resource: "SMART",
                    primary_id: out_links["SMART"]["attributes"]["name"],
                    shared: true
                }
                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["CDD"]) {
            if (out_links["CDD"]["attributes"]["name"]) {

                let new_out_link = {
                    resource: "CDD",
                    primary_id: out_links["CDD"]["attributes"]["name"],
                    shared: true
                }
                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["InterPro"]) {
            if (out_links["InterPro"]["attributes"]["name"]) {

                let new_out_link = {
                    resource: "InterPro",
                    primary_id: out_links["InterPro"]["attributes"]["name"],
                    shared: true
                }
                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }
        if (out_links["PIRSF"]) {
            if (out_links["PIRSF"]["attributes"]["name"]) {

                let new_out_link = {
                    resource: "PIRSF",
                    primary_id: out_links["PIRSF"]["attributes"]["name"],
                    shared: true
                }
                if (new_out_link.primary_id === null) {
                    console.log(out_links);
                }
                res.push(new_out_link)
            }
        }

        return res

    },

    formatOutLinksGenome(out_link) {
        let res = []
        let new_out_link = {
            resource: "ncbi_genome",
            primary_id: out_link["ncbi_genome"]["id"],
            shared: false,
            attributes: out_link["ncbi_genome"]["link"]
        }
        res.push(new_out_link)
        return res
    },

    formatSystemicEffect(systemic_effect) {
        let res = {
            name: systemic_effect.name,
            venomkb_id: systemic_effect.venomkb_id,
            protein_annotations: []
        }
        if (systemic_effect.proteins) {
            for (let protein of systemic_effect.proteins) {
                let protein_annotation = {
                    protein: protein,
                    eco_id: systemic_effect.eco_id
                }
                res.protein_annotations.push(protein_annotation)
            }
        }
        if (systemic_effect.external_links) {
            console.log(systemic_effect);
        }
        return res
    }

};
