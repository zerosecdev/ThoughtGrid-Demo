
# Section 04: Posting and the Reputation System

The **Plaza Mesh** is the town square of ThoughtGrid. It’s where everyone’s public thoughts (signals) land in one big stream. I designed it to handle high-speed reading, but I also added a "Reputation" math engine underneath to reward people for being helpful and penalize people for being toxic.

---

## 📽️ Video Walkthrough: Interacting with Posts
[INSERT YOUTUBE LINK FOR: Post_Intractions.mp4]

---

## 1. The Global Feed (The Stream)
When you log in, you see an infinite list of rounded cards. Every card is a post.

*   **Identity Ribbon**: At the top of every post, you see the person’s photo and name. If they posted inside a group, I added a "Breadcrumb" trail (like: `Nature Group ➔ #Birds ➔ User`). Clicking any of those jumps you straight to that group or person.
*   **Privacy Sigils**: Next to the name, there is a small icon. A **Globe** means the post is public, **Two People** means it's for friends only, and a **Lock** means only the author can see it.
*   **The Live Refresh Button**: At the top of the feed, there is a spinning arrow. Clicking it pulls the absolute newest messages from the server instantly without making the whole page reload.

---

## 2. The Signal Forge (Writing a Post)
I built a professional text editor right into the top of the feed so you can share things fast.

*   **The Text Box**: You can type up to 5,000 characters. 
*   **Rich Text Bar**: I added buttons for **Bold**, *Italic*, and **Code**.
*   **The Color Injector (Palette)**: This is a custom feature. You can highlight a word, pick a color, and click "Inject." It adds a bit of code that makes that specific word change color on everyone’s screen.
*   **Preview Mode (Eye Icon)**: If you aren't sure how your Markdown or colors look, you click the Eye. It flips the box into "Read Mode" so you can check your design before publishing.
*   **Media Uploader**: Clicking the picture icon lets you attach up to 4 photos or videos. You’ll see a small grid of previews where you can remove them if you change your mind.
*   **The Broadcast Button**: Sends your thought to the grid. If an admin has to approve your post first, the button tells you it’s "Pending."

---

## 📽️ Video Walkthrough: Sharing and Post Approvals
[INSERT YOUTUBE LINK FOR: Post_Sharing.mp4]
[INSERT YOUTUBE LINK FOR: Post_Approval.mp4]

---

## 3. Reactions and Discussion
I didn't want a boring "Like" button, so I built a **Weighted Reaction Hub**.

*   **Emoji Hub**: If you hover over the Like button, a tray of 7 emojis pops up (👍, ❤️, 😂, 😮, 😢, 😡, 🔥). 
*   **The Pulse Bubble**: Above the action bar, you’ll see the top 3 emojis people used and the total number. 
*   **Who Reacted?**: Clicking that bubble opens a black window that lists every single person who clicked an emoji.
*   **The Sharing Matrix**: Clicking "Share" lets you:
    *   **Copy the Link** to your clipboard.
    *   **Forward to Chat**: Picks a friend or group chat and sends the post as a beautiful preview card.
    *   **Republish to Group**: Lets you pick a community you belong to and repost the signal there.

---

## 4. The Reputation Engine (Trust Score)
This is the "Brain" of the app. Every user has a **Trust Score** (starting at 10%). I wrote a background worker called the **Materializer** that does the math every time someone reacts to you.

*   **Positive Signals**: If someone gives you a 👍, you get **+0.1 points**. If they give you a 🔥, you get **+0.5 points**.
*   **Toxic Signals**: If someone reacts with 😡, the system takes away **-1.0 points**. 
*   **The 0-100% Rule**: I added "Clamping" logic so your score can never go below 0 or above 100.
*   **Circuit Gates**: This is the security part. I used these scores to lock certain parts of the app. For example, if your trust score is below 90%, the app will physically block you from entering the "Admin Dashboard" and show a red **"Circuit Locked"** screen.

---

## 🛠️ The Logic Behind the Scenes
*   **Event-Driven Design**: I used an "Event Bus" for the reputation. When you like a post, the main app doesn't wait for the math to finish—it just says "Someone liked this!" and a separate worker handles the Trust Score math in the background. This keeps the app feeling snappy.
*   **Markdown Neural Engine**: I wrote a custom parser that scans for `@mentions`. If you type `@malik`, it automatically finds my ID, turns the text blue, and sends a notification to my phone.
