from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Today(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), unique=True, nullable=False)

    def to_dict(self):
        return {"id": self.id, "date": self.date}
    
class Test(db.Model):
    __tablename__ = 'Test'
    id = db.Column(db.Integer, primary_key=True)

    def to_dict(self):
        return {"id": self.id}