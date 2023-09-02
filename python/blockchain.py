import hashlib
import time
import json
import plyvel


class Transaction:
    def __init__(self, sender, recipient, amount):
        self.sender = sender
        self.recipient = recipient
        self.amount = amount

class Block:
    def __init__(self, index, transactions, previous_hash=''):
        self.index = index
        self.timestamp = int(time.time())
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        data = str(self.index) + str(self.timestamp) + str(self.transactions) + self.previous_hash + str(self.nonce)
        return hashlib.sha256(data.encode()).hexdigest()
    
def save_block(block, db_path):
    try:
        db = plyvel.DB(db_path, create_if_missing=True)
        block_data = json.dumps(block.__dict__)
        db.put(str(block.index).encode(), block_data.encode())
        db.close()
        print(f"Block #{block.index} saved to LevelDB.")
    except Exception as e:
        print(f"Error saving block: {e}")    

        
def load_block(index, db_path):
    try:
        db = plyvel.DB(db_path)
        block_data = db.get(str(index).encode())
        if block_data:
            block_dict = json.loads(block_data.decode())
            db.close()
            return block_dict
        else:
            db.close()
            return None
    except Exception as e:
        print(f"Error loading block: {e}")
        return None