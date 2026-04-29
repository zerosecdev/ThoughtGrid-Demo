# 🌌 ThoughtGrid:  User-Owned Social Ecosystem

> [!WARNING]  
> **PROPRIETARY SOFTWARE NOTICE**  
> ThoughtGrid is a closed-source, professional project. To protect my work, the full code (over 55,000 lines) is kept privately. 
> 
> **This public repository is a showcase of how I built the system.** It contains the documentation, database designs, and specific "core engine" files to show my coding standards and how the whole thing fits together.

---

## 🏗️ My First Massive Project
This is the first time I have ever built a project on this scale. It is a huge system consisting of **723 files** and **54,663 lines of code**. 

I didn't just build an app; I architected a full social network from scratch. Every part of this system—from how a message is encrypted to how a user profile changes its shape—was designed to be fast and stable. Everyone can code even LLM's but designing systems is real skill! 

### System Map
Below is a visual map of every single file in the project. You can see how they all connect to form the core of ThoughtGrid.

<img width="1919" height="1079" alt="Image" src="https://github.com/user-attachments/assets/c52a279a-6628-4427-bd59-9a3a7426032d" />
*A look at the 723 files that make up the system.*
---

## 🛠️ The Tech Stack
I chose these specific tools because they are reliable and can handle a lot of users without slowing down.

*   **The Backend (Node.js & Express):** I used an "Event-Driven" setup. This means when you post or send a chat, the system does the heavy work in the background. The user never sees a loading spinner or feels a lag.
*   **The Frontend (React & Zustand):** I built what I call a "Morphic" interface. It lets you change the entire look of Your Profile, Group or ChatGroup (like switching from a mobile view to a pro desktop layout) instantly without the page having to reload. Also another user will see your Profile or Group as you Design.
*   **The Database (PostgreSQL & Redis):** I used PostgreSQL to keep user data safe and organized. Redis is used for fast, temporary storage so the chat feels instant. Currently there is postgreSQL DB only . but Redis can be integrated so easily.
*   **Built to Grow:** I made the code very easy to extend. Even though I'm not using AI right now, the way I built the files makes it simple to "plug in" an AI for things like search or moderation later on.

---


## 🛡️ Security & Cryptographic Mesh
I built ThoughtGrid with a "Security-First" mindset. Most apps only protect the connection, but I protect the actual data inside the database.

*   **Field Level Encryption (FLE):** Sensitive data like private messages and emails are scrambled using **AES-256-GCM** before they are saved. Even if someone steals the database, they cannot read the content without the master keys.
*   **Tamper-Proof Seals:** Using GCM mode, every encrypted signal includes an authentication tag. This ensures that the data hasn't been modified or corrupted while sitting in the database.
*   **Hardened Passwords:** User passwords are never stored. Instead, I use **Bcrypt with 12 salt rounds**, making it mathematically expensive and slow for hackers to attempt brute-force attacks.
*   **Secure Session Lattice:** Logins are managed via dual-token **JWTs (JSON Web Tokens)**. Every token is injected with a unique **JTI (JWT ID)** to prevent session collisions and replay attacks.
*   **Hardware-Backed Identity:** The system supports **WebAuthn (Passkeys)**. This allows users to link their physical hardware (Fingerprint/FaceID) directly to the grid for a biometric, passwordless login experience that is nearly impossible to phish.

---
## 📂 How it Works (Documentation)

I have broken down the system into five main areas. Each page explains exactly how the buttons work and includes a video walk-through:

| Section | What it covers | Tools I Used |
| :--- | :--- | :--- |
| **01: Join and Setup** | [How people create accounts and set up their photos](./docs/01_join_and_setup.md) | WebAuthn, JWT, Zod |
| **02: Profile and Privacy** | [How the design editor and privacy settings work](./docs/02_profile_and_privacy.md) | JSONB, CSS Variables |
| **03: Groups and Admin Tools** | [How groups, feeds, and moderation work](./docs/03_groups_and_admin_tools.md) | RBAC, Nested SQL |
| **04: Posting and Reputation** | [How the feed and the trust-score system work](./docs/04_posting_and_reputation.md) | Markdown, SQL Math |
| **05: Real-time Chat** | [How instant messaging, voice, and camera work](./docs/05_realtime_chat.md) | Socket.io, Web Audio |
---

## ⚙️ How I Test Everything
I don't just write code and hope it works. I wrote a lot of **Python E2E (End-to-End) scripts** that pretend to be real users to test the system's limits:

*   **Stress Tests:** I have scripts that make many users join and post at once to make sure the database doesn't crash.
*   **Security Checks:** I use tests to try and "sneak past" privacy rules to make sure blocked users stay blocked.
*   **Full Lifecycle:** I run tests that go from registering a new user to deleting them, making sure every file and database row is cleaned up perfectly.
Also i tested everyfeature and Frontend layout manually. Because sometimes testing scripts gives clear results but frontend gets broken.

*(You can see few these test scripts in the `/scripts` folder).*

---

<div align="center">
  <p>Created with a focus on <strong>Organization, Speed, and Security</strong>.</p>
</div>
