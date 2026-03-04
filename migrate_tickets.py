import pymysql
import os
from dotenv import load_dotenv

# Load env from backend dir
backend_env = os.path.join('..', 'resolveiq_backend', '.env')
load_dotenv(backend_env)

# Migration Mapping based on Audit
# ID 1, 4, 5, 16, 17, 18 -> ID 1 (Network Issue)
# ID 2, 6 -> ID 3 (Software Installation)
# ID 3, 10 -> ID 4 (Application Issues)

MIGRATIONS = [
    {"ids": [1, 4, 5, 16, 17, 18], "new_dept": 1, "label": "Network Issue"},
    {"ids": [2, 6], "new_dept": 3, "label": "Software Installation"},
    {"ids": [3, 10], "new_dept": 4, "label": "Application Issues"}
]

try:
    conn = pymysql.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    cursor = conn.cursor()
    
    total_migrated = 0
    for mig in MIGRATIONS:
        ids_str = ", ".join(map(str, mig["ids"]))
        query = f"UPDATE tickets SET department_id = %s WHERE id IN ({ids_str})"
        cursor.execute(query, (mig["new_dept"],))
        print(f"Migrated IDs [{ids_str}] to Dept {mig['new_dept']} ({mig['label']})")
        total_migrated += cursor.rowcount
        
    conn.commit()
    print(f"\nSuccessfully migrated {total_migrated} tickets.")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error during migration: {e}")
