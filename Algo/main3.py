from lib.postgres.main import Postgres
from dotenv import main as env
import os, sys
import redis
import logging
from colorama import Fore, Style, init

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

# Redis connection
print("Redis Hostname: ", os.getenv('REDIS_HOSTNAME'))
print("Redis Port: ", os.getenv('REDIS_PORT'))
print("Redis DB: ", os.getenv('REDIS_DB'))


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
    

# --- Main --- #
# message processor
def process_message(file_id):
    logging.info(f'{Fore.GREEN}Processing message: {message}{Fore.RESET}')
    
    ### THIS IS WHERE YOUR FUNCTION CALL GOES SHAURYA ###

    # need to get blob from postgres then process it with algorithm then insert timestamps into postgres
    # get blob from postgres
    # ^ use this blob to process with your algorithm

    file_content = pg_client.get_file_content(int(file_id))

    # timestamps = algorithm.get_timestamps(file_content)
    
    # YOUR FUNCTION WILL RETURN A LIST OF TIMESTAMP VALUES LIKE THIS
    timestamps = [0,100,200,300,350,400]

    ### YOUR RETURN VALUE WILL BE INSERTED INTO POSTGRES HERE ###
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