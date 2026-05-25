import sys
sys.path.insert(0, '/app')
from app.core.database import SessionLocal
from app.models.user_model import User
from app.core.security import hash_password
db = SessionLocal()
u = db.query(User).filter(User.email == 'admin@edudata.go.th').first()
u.password_hash = hash_password('Admin1234!')
db.commit()
db.close()
print('done')