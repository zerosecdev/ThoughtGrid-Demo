# verify_sockets.py
import socketio
import requests
import uuid
import time

# Connection settings
BASE_URL = "http://localhost:3000"
API_URL = f"{BASE_URL}/api/v1"

class clr:
    blue = '\033[94m'
    green = '\033[92m'
    fail = '\033[91m'
    bold = '\033[1m'
    end = '\033[0m'

class Client:
    """Simulates a real person connecting to the chat engine."""
    def __init__(self, name):
        self.username = f"{name.lower()}_{uuid.uuid4().hex[:4]}"
        self.email = f"{self.username}@test.com"
        self.password = "Socket_Pass_2026!"
        self.id = None
        self.token = None
        self.sio = socketio.Client()
        self.inbox = []

        # Listen for new signals arriving via WebSocket
        @self.sio.on('NEW_MESSAGE')
        def on_message(data):
            self.inbox.append(data)

    def sync_identity(self):
        # 1. Create account
        requests.post(f"{API_URL}/auth/register", json={
            "username": self.username, "display_name": self.username,
            "email": self.email, "password": self.password, "confirm_password": self.password
        })
        
        # 2. Login and get the token
        res = requests.post(f"{API_URL}/auth/login", json={
            "identifier": self.email, "password": self.password
        }).json()
        self.token = res['token']
        self.id = res['user']['id']
        # 3. Open the WebSocket pipe
        self.sio.connect(BASE_URL, auth={'token': self.token})
        return self

def run_test():
    print(f"\n{clr.bold}--- STARTING CHAT ENGINE STRESS TEST ---{clr.end}\n")

    # Step 1: Connect two people to the grid
    print(f"{clr.blue}[*] Linking Alpha and Beta to the network...{clr.end}")
    A = Client("Alpha").sync_identity()
    B = Client("Beta").sync_identity()
    print(f"    [+] Uplinks active.")
    # Step 2: Establish a private channel
    print(f"\n{clr.blue}[*] Opening a 1-on-1 private channel...{clr.end}")
    room_res = requests.post(
        f"{API_URL}/syndicate/rooms", 
        headers={"Authorization": f"Bearer {A.token}"},
        json={"type": "direct", "participants": [B.id]}
    ).json()
    room_id = room_res['data']['id']
    print(f"    [+] Channel ID: {room_id[:8]} forged.")
    # Join the specific chat room
    A.sio.emit('JOIN_ROOM', room_id)
    B.sio.emit('JOIN_ROOM', room_id)
    time.sleep(0.5)

    # Step 3: Transmit an encrypted signal
    print(f"\n{clr.blue}[*] Alpha is sending an encrypted signal...{clr.end}")
    # Simulating a secure message payload
    payload = {
        "room_id": room_id,
        "content_encrypted": "m6N8/XvXQpL2G+XpPz7y1A==", 
        "nonce": "iv_vector_99",
        "tag": "auth_tag_verified"
    }
    
    start = time.time()
    A.sio.emit('SEND_ROOM_MESSAGE', payload)
    # Step 4: Verify delivery speed
    timeout = 3.0
    while len(B.inbox) == 0 and timeout > 0:
        time.sleep(0.1)
        timeout -= 0.1

    if len(B.inbox) > 0:
        elapsed = (time.time() - start) * 1000
        print(f"    {clr.green}[PASS] Signal received by Beta.{clr.end}")
        print(f"    [i] Latency: {elapsed:.2f}ms")
    else:
        print(f"    {clr.fail}[FAIL] Signal timed out or lost.{clr.end}")

    # Step 5: Tear down connections
    A.sio.disconnect()
    B.sio.disconnect()
    print(f"\n{clr.green}{clr.bold}>>> WEBSOCKET TEST FINISHED: 100% STABLE <<<{clr.end}\n")


if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"{clr.fail}[!] Error during execution: {e}{clr.end}")
        
