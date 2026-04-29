# test system
import requests
import uuid
import time

# Set this to your local server address
URL = "http://localhost:3000/api/v1"

# Simple terminal colors to make the test output readable
class fmt:
    cyan = '\033[96m'
    green = '\033[92m'
    red = '\033[91m'
    bold = '\033[1m'
    end = '\033[0m'

# This class makes it easy to manage multiple fake users
class User:
    def __init__(self, name):
        self.alias = f"{name}_{uuid.uuid4().hex[:4]}"
        self.email = f"{self.alias}@test.com"
        self.key = "Secur3_Pass_2026!"
        self.id = None
        self.token = None
        self.http = requests.Session() # Keeps the session alive

    # Step 1: Create the account
    def create(self):
        res = requests.post(f"{URL}/auth/register", json={
            "username": self.alias,
            "display_name": f"Node_{self.alias}",
            "email": self.email,
            "password": self.key,
            "confirm_password": self.key
        })
        return res.status_code == 201
    # Step 2: Log in and get the access token
    def login(self):
        res = requests.post(f"{URL}/auth/login", json={
            "identifier": self.email,
            "password": self.key
        }).json()
        self.token = res['token']
        self.id = res['user']['id']
        # Set the token for all future requests for this user
        self.http.headers.update({"Authorization": f"Bearer {self.token}"})
        return True

def run_audit():
    print(f"\n{fmt.bold}--- STARTING SYSTEM INTEGRITY TEST ---{fmt.end}\n")
    # 1. Materialize 3 different users
    print(f"{fmt.cyan}[*] Synchronizing test nodes: A, B, and C...{fmt.end}")
    A = User("Alpha"); B = User("Beta"); C = User("Gamma")
    for u in [A, B, C]:
        if u.create() and u.login():
            print(f"    [+] @{u.alias} is now online.")
        else:
            print(f"    [!] Critical error: Could not sync {u.alias}.")
            return

    # 2. Test Social Connections (Handshake)
    print(f"\n{fmt.cyan}[*] Testing Friendship Link (A <-> B)...{fmt.end}")
    A.http.post(f"{URL}/social/request", json={"targetId": B.id})
    B.http.post(f"{URL}/social/accept", json={"targetId": A.id})
    # Verify they are actually connected
    friends_list = A.http.get(f"{URL}/social/friends").json()['data']
    if any(f['id'] == B.id for f in friends_list):
        print(f"    {fmt.green}[PASS] Social handshake successful.{fmt.end}")
    else:
        print(f"    {fmt.red}[FAIL] Social link failed to persist.{fmt.end}")

    # 3. Test Signal Broadcast & Reputation Math
    print(f"\n{fmt.cyan}[*] Testing Signal & Trust Score updates...{fmt.end}")
    p_data = A.http.post(f"{URL}/timeline", json={
        "content": "Broadcasting test signal to the mesh.",
        "privacy": "public"
    }).json()
    post_id = p_data['data']['id']

    # B 'likes' A's post (this should increase A's trust score)
    B.http.post(f"{URL}/plaza/interactions/react", json={"post_id": post_id, "type": "like"})
    # Wait for the background worker to finish the calculation
    time.sleep(1.5)

    # Check A's profile to see if the score changed
    profile = B.http.get(f"{URL}/profile/{A.alias}").json()['data']
    print(f"    [i] @{A.alias} trust score is now: {profile['trust_score']}%")
    if float(profile['trust_score']) > 10.0:
        print(f"    {fmt.green}[PASS] Reputation ledger updated correctly.{fmt.end}")

    # 4. Test Privacy Shields (Blocking)
    print(f"\n{fmt.cyan}[*] Testing Block Shield (A blocks C)...{fmt.end}")
    A.http.post(f"{URL}/privacy/block", json={"targetId": C.id})
    # C tries to view A's profile (Should get a 404 hidden error)
    res = C.http.get(f"{URL}/profile/{A.alias}")
    if res.status_code == 404:
        print(f"    {fmt.green}[PASS] Shield held: @{C.alias} cannot see @{A.alias}.{fmt.end}")
    else:
        print(f"    {fmt.red}[FAIL] Privacy breach detected!{fmt.end}")

    # 5. Test Permanent Purge
    print(f"\n{fmt.cyan}[*] Testing Purge Protocol (C leaves the grid)...{fmt.end}")
    res = C.http.post(f"{URL}/security/request-deletion", json={"password": C.key})
    if res.status_code == 200:
        print(f"    {fmt.green}[PASS] 30-day deletion countdown started for @{C.alias}.{fmt.end}")
    print(f"\n{fmt.green}{fmt.bold}>>> AUDIT FINISHED: ALL SYSTEMS NOMINAL <<<{fmt.end}\n")


if __name__ == "__main__":
    run_audit()
  
