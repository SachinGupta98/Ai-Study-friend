"""
setup_db.py — PostgreSQL database setup helper script.

Run this ONCE after PostgreSQL is installed to:
1. Create the 'vidya_ai' database (if it doesn't exist)
2. Create all tables via SQLAlchemy
3. Verify the setup is working
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/vidya_ai")

# Parse the DB name from the URL to create it if it doesn't exist
def create_database_if_not_exists(db_url: str):
    """Connect to PostgreSQL's default 'postgres' DB and create vidya_ai if needed."""
    try:
        import sqlalchemy
        from sqlalchemy import text

        # Connect to the 'postgres' maintenance database instead of vidya_ai
        maintenance_url = db_url.rsplit('/', 1)[0] + '/postgres'
        engine = sqlalchemy.create_engine(maintenance_url, isolation_level="AUTOCOMMIT")

        db_name = db_url.rsplit('/', 1)[1]

        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": db_name}
            )
            exists = result.fetchone()

            if not exists:
                print(f"  Creating database '{db_name}'...")
                conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                print(f"  [OK] Database '{db_name}' created.")
            else:
                print(f"  [OK] Database '{db_name}' already exists.")

        engine.dispose()

    except Exception as e:
        print(f"\n  [ERROR] Could not create database: {e}")
        print("\n  Please create the database manually:")
        print(f"    1. Open psql or pgAdmin")
        print(f"    2. Run: CREATE DATABASE vidya_ai;")
        sys.exit(1)


def create_tables():
    """Create all SQLAlchemy tables."""
    try:
        from database import Base, engine
        import models  # noqa: F401 — registers all models
        Base.metadata.create_all(bind=engine)
        print("  [OK] All tables created successfully.")
    except Exception as e:
        print(f"  [ERROR] Failed to create tables: {e}")
        sys.exit(1)


def verify_connection():
    """Verify we can connect and query the DB."""
    try:
        from database import SessionLocal
        from models import User
        db = SessionLocal()
        count = db.query(User).count()
        db.close()
        print(f"  [OK] Connection verified. Users in DB: {count}")
    except Exception as e:
        print(f"  [ERROR] Connection verification failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    print("\nVidya AI -- PostgreSQL Setup\n" + "=" * 40)
    print(f"\n  Database URL: {DATABASE_URL.replace(DATABASE_URL.split(':')[2].split('@')[0], '****')}")

    print("\n[1/3] Checking/creating database...")
    create_database_if_not_exists(DATABASE_URL)

    print("\n[2/3] Creating tables...")
    create_tables()

    print("\n[3/3] Verifying connection...")
    verify_connection()

    print("\n[OK] Setup complete! You can now start the backend with:")
    print("   uvicorn main:app --reload\n")
