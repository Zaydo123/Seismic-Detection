import psycopg2
from sys import path

class Postgres:

    def __init__(self, dbname, user, password, host, port):
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.conn = None
        self.cur = None
    
    def connect(self):
        self.conn = psycopg2.connect(
            dbname=self.dbname,
            user=self.user,
            password=self.password,
            host=self.host,
            port=self.port    
        )
        self.cur = self.conn.cursor()
        self._startup_script()

    def close(self):
        self.cur.close()
        self.conn.close()

    def execute(self, filename):
        with open("lib/postgres/queries/" + filename, "r") as f:
            self.cur.execute(f.read())
        self.conn.commit()

    def _startup_script(self):
        self.execute("CREATE_TABLES.sql")
        self.conn.commit()
    
    def insert_timestamps(self, file_id, timestamps):
        script = "INSERT INTO detections (file, start_time) VALUES "
        for timestamp in timestamps:
            script += f"({file_id}, {timestamp}),"
        script = script[:-1] + ";"
        self.cur.execute(script)
        self.conn.commit()
    
    def get_file_content(self, file_id):
        self.cur.execute(f"SELECT content FROM files WHERE id={file_id};")
        return self.cur.fetchone()
        
        
