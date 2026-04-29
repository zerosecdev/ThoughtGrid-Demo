

# Section 03: Groups and Admin Tools

I designed the **Groups** system to work like a mini-network. Instead of just having one big group chat, a ThoughtGrid community acts like an "umbrella." Inside one group, you can have many different post feeds (like Reddit) and many different chat rooms (like Discord).

---

## 📽️ Video Walkthrough: Joining Groups
[![Watch the video](https://github.com/zerosecdev/ThoughtGrid-Demo/blob/7358f07f541747328e948884370621d136008bab/ss/Communities.png)](https://youtu.be/ORi5nxFOYkk)

---

## 1. Finding and Making Groups
The "Groups" tab is where you go to find a community or start your own.

*   **The Search Bar**: You can search for groups by name.
*   **The Create Button (+)**: When you make a group, I give you three privacy choices:
    *   **Public**: Anyone can find the group and see everything inside.
    *   **Private**: Anyone can find the group, but they can't see the posts until an Admin lets them in.
    *   **Secret**: These are hidden. You won't find them in search; you need a direct invite link from an Admin to even know they exist.

---

## 2. Inside the Group Hub
When you open a group, you land in the **Hub**. 

*   **The Sidebar (The Tree)**: On the left, I built a navigation menu. It shows all the different **Feeds** (like #General or #Photos) and all the **Chat Rooms**.
*   **The Roster**: Clicking the "Users" icon shows you everyone in the group. You can see who the owner is and who the moderators are.
*   **The Rules Board**: I added a section where admins can list up to 10 community standards.
*   **Joining/Leaving**: If you want to join, you hit a big blue button. If you are the person who created the group, the "Leave" button is disabled. I did this to make sure a group doesn't become a "ghost town" without an owner.

---

## 📽️ Video Walkthrough: Managing a Community
[![Watch the video](https://github.com/zerosecdev/ThoughtGrid-Demo/blob/7358f07f541747328e948884370621d136008bab/ss/CommunityRBAC.png)](https://youtu.be/ORi5nxFOYkk)

---

## 3. The Command Center (Admin Panel)
If you are an Admin, you get a special **"Manage"** button. Clicking this opens the Command Center. This is where the heavy work happens.

### The Join Requests Tab
*   **The Ingress Queue**: If the group is private, anyone who wants to join lands here. 
*   **Vetting Nodes**: I designed this to show the applicant's "Social Weight"—you can see how many friends they have and how many posts they've made on the grid. This helps admins spot and block fake bot accounts.

### The Post Approvals Tab
*   **Signal Clearance**: If the group has "Post Approval" turned on, every post is hidden from the public until you clear it.
*   **Actions**: You can **Approve** a post to make it go live, or **Reject** it. If you reject it, you can type a reason why, and the user will get a system notification explaining what they did wrong.

### The Members Tab (Policing)
*   **Activity Metrics**: Next to every name, you can see their **Public Post Count**. This makes it easy to see who is actually contributing.
*   **The Mute Button**: You can "Silence" a user for 1 hour, 24 hours, or a full week. While silenced, they can still read, but they can't post or chat.
*   **The Ban Button**: Permanently kicks someone out. 
*   **The Blocklist**: A separate list showing everyone who has been banished and the reason why. You can click **"Restore Access"** to let them back in.

---

## 4. Setting up a Leadership Team
I built a granular permission system so you don't have to run the group alone.

*   **Appointing Leaders**: You can pick any member and make them a **Moderator** or an **Admin**.
*   **Feed Power**: This is a cool feature. You can give a Moderator power over *only* the `#Intel` feed without giving them access to the `#General` feed. It lets you delegate small tasks to different people.

---

## 5. Group Settings & The 3-Day Purge
This is where you control the "Soul" of the group.

*   **Visual Forge**: Buttons to upload a custom Logo and a custom Cover image just for the group.
*   **Invite Link**: Generates a secret URL. You can reset this link at any time to kill old invites.
*   **The Toggles**: Simple on/off switches for "Allow Search Joining," "Approve New Members," and "Approve Every Post."
*   **Decommission Group**: If you want to delete the group, it’s a big deal. You have to type your password to start a **3-Day Countdown**. A red clock appears for all members. After 3 days, the system physically erases every chat, post, and file in the group.

---

## 📽️ Video Walkthrough: Posting as a Mod
[![Watch the video](https://github.com/zerosecdev/ThoughtGrid-Demo/blob/7358f07f541747328e948884370621d136008bab/ss/CommunityPostingAsMod.png)](https://youtu.be/AnTQPnV8q5w)

---

## 🛠️ The Logic Behind the Scenes
*   **Recursive Trees**: I wrote the code to handle "Infinite Discussion"—replies to replies to replies—while keeping the database fast.
*   **Permission Shields**: Every single button in the Manage panel checks your "Trust Level" before it works. You can't hack the UI to see admin tools if you aren't an admin.
