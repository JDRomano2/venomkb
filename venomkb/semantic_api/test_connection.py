from __future__ import print_function, absolute_import

import configparser
from neo4j.v1 import GraphDatabase

ENVIRONMENT = 'DEV'

config = configparser.ConfigParser()
config.read('./venomkb-neo4j.cfg')

HOSTNAME = config[ENVIRONMENT]['Hostname']
USER = config[ENVIRONMENT]['User']
PASSWORD = config[ENVIRONMENT]['Password']
PORT = config['DEFAULT']['Port']
URI = "bolt://{0}:{1}".format(HOSTNAME, PORT)


class HelloWorldExample(object):
  def __init__(self, uri, user, password):
    self._driver = GraphDatabase.driver(uri, auth=(user, password))

  def close(self):
    self._driver.close()

  def print_greeting(self, message):
    with self._driver.session() as session:
      greeting = session.write_transaction(self._create_and_return_greeting, message)
      print(greeting)

  def purge(self):
    with self._driver.session() as session:
      del_all = session.write_transaction(self._purge_db_contents)
      return del_all

  @staticmethod
  def _create_and_return_greeting(tx, message):
    result = tx.run("CREATE (a:Greeting) "
                    "SET a.message = $message "
                    "RETURN a.message + ', from node ' + id(a)", message=message)
    return result.single()[0]

  @staticmethod
  def _purge_db_contents(tx):
    result = tx.run("MATCH (n)"
                    "DETACH DELETE n")
    return result


hw = HelloWorldExample(URI, USER, PASSWORD)
hw.print_greeting("Hello world!")
hw.purge()