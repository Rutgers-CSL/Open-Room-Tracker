#mongodb for storing data in database

from pymongo.mongo_client import MongoClient

#Datetime for converting time to 24 hour format
import os
import certifi

#dotenv for monbodb uri
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv("MONGODB_URI")


# Create a new client and connect to the server
client = MongoClient(uri, tlsCAFile=certifi.where())
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)