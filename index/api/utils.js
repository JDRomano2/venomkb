module.exports = {
    sendErrorMessage(res, err) {
        console.log(err.message);
        return res.status(500).json(err.message);
    },
    sendStatusMessage(res, status, message) {
        console.log(status, message);
        return res.status(status).json(message);
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
                let new_out_link = {
                    resource: "UniProtKB",
                    primary_id: out_links["UniProtKB"]["id"],
                    shared: false
                }
                res.push(new_out_link)
            }
            if (out_links["PANTHER"]) {
                let new_out_link = {
                    resource: "PANTHER",
                    primary_id: out_links["PANTHER"]["id"],
                    shared: false
                }
                res.push(new_out_link)
            }
            if (out_links["SUPFAM"]) {
                let new_out_link = {
                    resource: "SUPFAM",
                    primary_id: out_links["SUPFAM"]["attributes"]["name"],
                    shared: false
                }
                res.push(new_out_link)
            }
            if (out_links["PIR"]) {
                let new_out_link = {
                    resource: "PIR",
                    primary_id: out_links["PIR"]["attributes"]["name"],
                    shared: false
                }
                res.push(new_out_link)
            }
            if (out_links["Pfam"]) {
                let new_out_link = {
                    resource: "Pfam",
                    primary_id: out_links["Pfam"]["attributes"]["name"],
                    shared: true
                }
                res.push(new_out_link)
            }
            if (out_links["PRINTS"]) {
                let new_out_link = {
                    resource: "PRINTS",
                    primary_id: out_links["PRINTS"]["attributes"]["name"],
                    shared: true
                }
                res.push(new_out_link)
            }
            if (out_links["PROSITE"]) {
                let new_out_link = {
                    resource: "PROSITE",
                    primary_id: out_links["PROSITE"]["attributes"]["name"],
                    shared: true
                }
                res.push(new_out_link)
            }
            if (out_links["GO"]) {
                let new_out_link = {
                    resource: "GO",
                    primary_id: out_links["GO"]["attributes"]["term"],
                    shared: true
                }
                res.push(new_out_link)
            }
            if (out_links["ProDom"]) {
                let new_out_link = {
                    resource: "ProDom",
                    primary_id: out_links["ProDom"]["attributes"]["name"],
                    shared: true
                }
                res.push(new_out_link)
            }
            if (out_links["SMART"]) {
                let new_out_link = {
                    resource: "SMART",
                    primary_id: out_links["SMART"]["attributes"]["name"],
                    shared: true
                }
                res.push(new_out_link)
            }
            if (out_links["CDD"]) {
                let new_out_link = {
                    resource: "CDD",
                    primary_id: out_links["CDD"]["attributes"]["name"],
                    shared: true
                }
                res.push(new_out_link)
            }
            if (out_links["InterPro"]) {
                let new_out_link = {
                    resource: "InterPro",
                    primary_id: out_links["InterPro"]["attributes"]["name"],
                    shared: true
                }
                res.push(new_out_link)
            }
            if (out_links["PIRSF"]) {
                let new_out_link = {
                    resource: "PIRSF",
                    primary_id: out_links["PIRSF"]["attributes"]["name"],
                    shared: true
                }
                res.push(new_out_link)
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
        }

};
