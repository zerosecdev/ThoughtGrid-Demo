


# Section 01: Joining and Setting up your account

This part of the project handles the first time a user interacts with the system. I designed it to be more than just a boring form; it’s a smooth, multi-step process that makes sure every user is real, unique, and has a great-looking profile before they even enter the main feed.

---

## 📽️ Video Walkthrough: Signing up
[![Watch the video](https://github.com/zerosecdev/ThoughtGrid-Demo/blob/f302d8c487c27cd86b1dc0befa4e2d3880a5d688/ss/Onboarding.png)](https://www.youtube.com/watch?v=4z0rMJ9bznM)

---

## 1. Creating an Identity (The Signup Form)
When you first join, I use a 3-phase form to collect your data. This prevents the user from feeling overwhelmed by a giant wall of inputs.

### Phase 1: Basic Info
*   **The "Name" Box**: I added this to get the user's real display name.
*   **The Username Box (`AvailabilityController.ts`)**: This is one of my favorite small features. As you type, the system quietly checks the database every few milliseconds. If the name is taken, a red alert pops up immediately. If it's free, you get a green checkmark.
*   **The Email Box**: Standard email input with validation to make sure it's a real address format.
*   **The Continue Button**: I locked this button so it stays grey until the system confirms your username and email are actually unique.

### Phase 2: Location & Details
*   **Gender Selection**: A simple dropdown menu.
*   **Birthday Picker**: A standard calendar to set your birth date.
*   **Country & City**: I added these so users can pin where they are on the grid.
*   **Back Button**: Allows you to return to Phase 1 without losing the data you already typed.

### Phase 3: Security & Passwords (`SecurityInputs.tsx`)
*   **The Password Box**: As you type your password, I built a **"Strength Meter"** underneath. It changes color from red to green based on how "guessable" your password is. It checks for capital letters, numbers, and symbols.
*   **Confirm Password**: A second box to make sure you didn't make a typo. If they don't match, you'll see a red warning.
*   **The "Forge Account" Button**: Clicking this triggers the `handleFinalize` function. It encrypts your password and creates your permanent spot in the database.

---

## 📽️ Video Walkthrough: Logging In
[![Watch the video](https://github.com/zerosecdev/ThoughtGrid-Demo/blob/60ab5472c0bcab7133529394fbde20174d258179/ss/login.png)](https://youtu.be/m5pzYN8wm4w)

---

## 2. Returning to the Grid (Login)
The login screen (`LoginForm.tsx`) is designed to be very fast. 

*   **Identifier Box**: You can type either your `@username` or your `email`. I wrote the backend to check both columns automatically.
*   **Password Box**: Your secret access key.
*   **Passkeys (Hardware Login)**: I integrated **WebAuthn** here. If you have a fingerprint sensor or FaceID on your device, you can click the Passkey button to log in without typing anything.
*   **Error Alerts**: If you get the password wrong, a red box slides in explaining exactly what happened so you aren't left guessing.

---

## 3. The Setup Wizard (Onboarding)
Once the account is created, I don't just dump the user into the feed. I take them through a "Setup Wizard" (`OnboardingWizard.tsx`) to polish their profile.

### Step 1: Profile Photo (`AvatarUploadStep.tsx`)
*   **The Upload Circle**: You click the big circle to pick a photo.
*   **Live Preview**: The moment you pick a file, it shows up in the circle so you can see if it looks good.
*   **The "Authorize" Button**: This sends the image to my server's storage folder.

### Step 2: Background Cover (`CoverUploadStep.tsx`)
*   **The Wide Dropzone**: Similar to the profile photo, but for a wide header image. 
*   **The Skip Button**: I added a "Skip for now" button here. I know some people just want to get into the app quickly, so they can do this later.

### Step 3: Writing your Bio (`BioStep.tsx`)
*   **The Bio Textbox**: A large area to write about yourself.
*   **Formatting Bar**: I added buttons for **Bold**, *Italic*, and **Color**. If you highlight text and click a color, it adds custom code that physically changes the text color on your profile.
*   **Preview Mode**: You can click an "Eye" icon to see exactly how your styled bio will look to other people.
*   **Character Counter**: A small label in the corner that shows you how many of your 500 characters you've used.

### Step 4: Social Links (`SocialLinksStep.tsx`)
*   **Connection Grid**: A list of icons for Instagram, X (Twitter), GitHub, etc. 
*   **Handshake Finish**: Clicking "Finish" bundles all this data and saves it to the database all at once.

---

## 🛠️ The Logic Behind the Scenes
*   **Security**: I used `bcrypt` to scramble passwords so even I can't read them in the database.
*   **Speed**: All these steps happen without the page ever reloading, thanks to how I used React state.
*   **Persistence**: Once you finish the setup, the system remembers you're "done" so you never have to see the setup wizard again.
