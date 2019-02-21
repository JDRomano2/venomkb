from __future__ import print_function, division

import sys
import json
import MySQLdb as sql
import ipdb

SMDB_SEARCH_RESULT_FILE = "./venomkb_v1_pmids.json"

CREATE_RESULTS_TABLE = (
    "CREATE TEMPORARY TABLE `smdb_search_results` ("
    "  `predication_id` INT(10) NOT NULL"
    ")"
)

def display(text):
    sys.stdout.write("\r %s" % text)
    sys.stdout.flush()

def db_init():
    global db
    global cur
    db = sql.connect(host="127.0.0.1",
                     user="jdr2160",
                     passwd="BoAyT1iOab",
                     port=3307,
                     db="kb_semanticmedline",
                     unix_socket="/var/lib/mysqld/mysqld.sock")
    cur = db.cursor()
    return db

def load_smdb_search_results():
    fp = open(SMDB_SEARCH_RESULT_FILE, 'r')
    smdb_search = json.load(fp)
    fp.close()
    return smdb_search


def main():
    display("Setting up database connection...")
    db_init()

    display("Loading smdb_search output...")
    smdb_search_results = load_smdb_search_results()
    ipdb.set_trace()

    with open("./venomkb_v1_predicationids.txt", 'w') as fp:
        for predication in smdb_search_results:
            fp.write("{0}\n".format(predication['predication_id']))
        

    # cur.execute(CREATE_RESULTS_TABLE)

    # Insert predication ids into new temp table
    

    display("Finished!")


if __name__ == "__main__":
    main()