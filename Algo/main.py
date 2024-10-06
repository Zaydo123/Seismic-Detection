from lib.postgres.main import Postgres
from dotenv import main as env
import os, sys
import redis, json
import logging
from colorama import Fore, Style, init
from algo import detect_earthquakes
import pandas as pd

init(autoreset=True)

logging.basicConfig(level=logging.INFO, format=f'{Fore.RED}%(asctime)s{Fore.RESET} - %(name)s - %(levelname)s - %(message)s')
logging.info(f'{Fore.GREEN}Starting up...{Fore.RESET}')

# --- Startup --- #

# find and load .env files
env.load_dotenv(env.find_dotenv())

# Postgres connection
pg_client = Postgres(
    host=os.getenv('POSTGRES_HOSTNAME'),
    port=os.getenv('POSTGRES_PORT'),
    dbname=os.getenv('POSTGRES_DB'),
    user=os.getenv('POSTGRES_USER'),
    password=os.getenv('POSTGRES_PASSWORD'),
)

pg_client.connect()
logging.info(f'{Fore.GREEN}Connected to Postgres{Fore.RESET}')

r = redis.Redis(
    host=os.getenv('REDIS_HOSTNAME'),
    port=os.getenv('REDIS_PORT'),
    db=os.getenv('REDIS_DB'),
    # no password for simplicity sake
)

if r.ping() == True:
    logging.info(f'{Fore.GREEN}Connected to Redis{Fore.RESET}')
else:
    logging.error(f'{Fore.RED}Failed to connect to Redis{Fore.RESET}')
    sys.exit(1)
    
def find_files() -> list:
    processing_queue = []
    subfolders = []

    # Lunar Data
    for folder in os.listdir("../data/lunar/test/data"):
        subfolders.append(folder)
        
    if ".DS_Store" in subfolders:
        subfolders.remove(".DS_Store")

    for subfolder in subfolders:
        subfolder_files = os.listdir(f"../data/lunar/test/data/{subfolder}")
        for file in subfolder_files:
            if file.endswith(".csv"):
                processing_queue.append(f"../data/lunar/test/data/{subfolder}/{file}")

    # Martian Data
    for file in os.listdir("../data/mars/test/data"):
        processing_queue.append(folder)
        
    while ".DS_Store" in processing_queue:
        processing_queue.remove(".DS_Store")
        
    print("Loaded " + str(len(processing_queue))+ "files for processing")
    return processing_queue

def manual_run_all():
    pass

    
# --- Main --- #
# message processor
def process_message(file_id):
    file_id = file_id.strip()
    logging.info(f'{Fore.GREEN}Processing message: {message}{Fore.RESET}')
    json_dat = pg_client.get_file_content(int(file_id))
    json_dat = json.loads(json_dat)
    file_content = pd.json_normalize(json_dat)
    print(file_content)
    timestamps = detect_earthquakes(file_content) # Call the detect_earthquakes function from algo.py
    if len(timestamps) == 0:
        logging.info(f'{Fore.GREEN}No timestamps found{Fore.RESET}')

    # inserts to db
    pg_client.insert_timestamps(file_id, timestamps)
    logging.info(f'{Fore.GREEN}Inserted timestamps into Postgres{Fore.RESET}')
    r.publish('finished_processing', file_id)

pubsub = r.pubsub()
pubsub.subscribe('intraservice')


# redis pubsub listener
try:
    for message in pubsub.listen():
        if message['type'] == 'message':
            logging.info(f'{Fore.GREEN}Received message: {message["data"]}{Fore.RESET}')
            process_message(message['data'].decode('utf-8')) # file_id is the message data
        elif message['type'] == 'subscribe':
            logging.info(f'{Fore.GREEN}Subscribed to channel: {message["channel"].decode("utf-8")}{Fore.RESET}')
        else:
            logging.info(f'{Fore.GREEN}Received message: {message}{Fore.RESET}')


except KeyboardInterrupt:
    sys.exit(0)

except Exception as e:
    logging.error(f'{Fore.RED}Error: {e}{Fore.RESET}')

finally:
    pubsub.close()
    logging.info(f'{Fore.GREEN}Closed connection to Redis{Fore.RESET}')
    pg_client.close()
    logging.info(f'{Fore.GREEN}Closed connection to Postgres{Fore.RESET}')
    logging.info(f'{Fore.GREEN}Exiting...{Fore.RESET}')
    sys.exit(0)
