
# Section 02: Your Profile and Privacy Settings

The **Identity Vault** is the heart of the user experience. I didn’t want ThoughtGrid to have a "standard" profile look. Instead, I built a system where every user can be the architect of their own page. This section covers how you design your profile and how you lock down your data.

---

## 📽️ Video Walkthrough: Designing your Profile
[INSERT YOUTUBE LINK FOR: MorphicLayoutEditor.mp4]

---

## 1. The "Morphic" Profile Page
When you visit a profile, the interface actually changes its shape based on how that user designed it.

*   **Hover Actions**: If you are looking at your own profile, you can hover over your **Profile Picture** or **Cover Photo** to see a camera icon. Clicking it lets you swap your photos instantly without leaving the page.
*   **The "View As" Tool**: Inside the three-dot menu (...) in the top right, I added a "Simulation" tool. This is great for testing. You can view your own profile as a "Guest" or a "Friend" to see exactly what info is being hidden by your privacy settings.
*   **The Navigation Tabs**:
    *   **Posts**: A list of everything you've shared.
    *   **Friends**: Your connection list. If you set this to private, other people will see a "Lattice Locked" shield here.
    *   **Media**: A clean grid of every photo and video you have ever posted.
    *   **About**: Your personal details and social links.

---

## 2. Studio Mode (The Layout Editor)
I built **Studio Mode** so users could change the app's code-level styling using simple sliders. When you open it, the screen splits: you see a live preview on the left and the controls on the right.

### The Layout Tab
*   **Cover Height**: I added three options (*Short*, *Wide*, or *Cinema*) so you can decide how much space your background photo takes up.
*   **The 3x3 Photo Grid**: A set of 9 buttons that lets you "snap" your profile picture to any corner or center of the cover photo. 
*   **Edge Rounding Slider**: You can make your profile boxes look perfectly sharp and square or completely round like a pill. 
*   **Frame Weight**: A slider to add thick or thin borders around your photos.

### The Atmosphere Tab (Colors)
This is where the "Dual-Reality" logic happens. I added side-by-side color pickers for **Day Mode** and **Night Mode**.
*   **Global Accent**: Changes the primary color of the app's buttons.
*   **Surface Colors**: You can pick different colors for the main background and the sidebar boxes.
*   **Text Colors**: Allows you to pick a readable color for your bio text.

### The "Design DNA" Feature
I wanted people to be able to share their designs. 
*   **Export**: Clicking this turns your entire layout into a long string of secret code (Design DNA) and copies it to your clipboard.
*   **Import**: You can paste a friend's DNA code into the box to instantly copy their exact colors and layout.

---

## 📽️ Video Walkthrough: Privacy and Security
[INSERT YOUTUBE LINK FOR: PrivacyOptions.mp4]
[INSERT YOUTUBE LINK FOR: SecuritySettings.mp4]

---

## 3. Privacy Controls (The Shields)
Privacy is a big deal in this project. I built a "Privacy Matrix" to give users total control.

*   **Global Visibility**: Toggles to decide if your profile is searchable or if your posts are public.
*   **Data Gating**: Individual switches to hide your **Email**, **Birthday**, or **Location**. If these are off, the system shows a "Private" lock icon to visitors.
*   **Messaging Gates**: You can choose who is allowed to send you private signals: *Everyone*, *Friends Only*, or *Nobody*.
*   **The Blocklist**: A dedicated page that shows everyone you've blocked. It includes an **"Unblock"** button to restore the connection.

---

## 4. Advanced Security & Account Control
This area handles the "Hard-Kill" protocols and session management.

*   **The Identity Forge**: You can change your username here, but I added a **60-Day Lock**. Once you change it, a live countdown timer appears, showing you exactly how many days you have to wait to change it again.
*   **Active Device Tracking**: This list shows every phone or computer logged into your account. If you see a device you don't recognize, you can click the **Red Shield** to remotely log them out.
*   **Data Wipes**: I added "Panic Buttons" to instantly delete all your chats or all your friends. It requires your password to prevent accidental use.
*   **The 30-Day Purge**: If you choose to delete your account, I designed a **30-day grace period**. A red countdown banner appears at the top of the app. If you don't log back in within 30 days, the database physically erases every single row of your data forever.

---

## 🛠️ The Logic Behind the Scenes
*   **JSONB Storage**: Instead of making a hundred different database columns for colors and shapes, I saved everything into one single "Box" (JSONB column). It makes the system incredibly fast.
*   **No-Refresh Updates**: When you save a new design, I wrote the code to send the new "DNA" back to your browser immediately so the UI updates without the page flickering or reloading.
