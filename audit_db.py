import pymysql
import os
from dotenv import load_dotenv

# Try to load from backend dir
backend_env = os.path.join('..', 'resolveiq_backend', '.env')
load_dotenv(backend_env)

try:
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    print("--- DEPARTMENTS ---")
    cursor.execute('SELECT id, name FROM departments')
    for row in cursor.fetchall():
        print(f"ID {row['id']}: {row['name']}")
        
    print("\n--- TICKETS IN OTHER (DEPT 5) ---")
    cursor.execute('SELECT id, title, department_id FROM tickets WHERE department_id = 5')
    for row in cursor.fetchall():
        print(f"ID {row['id']}: {row['title']}")
        
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
