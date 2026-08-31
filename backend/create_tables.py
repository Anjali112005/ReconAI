from app.database import Base, engine
from app.models import User, ReconciliationRun


print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("SUCCESS: Database tables created!")