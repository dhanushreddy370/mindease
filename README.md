# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/1ae235a1-da6f-4081-8ed8-212299fe1556

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1ae235a1-da6f-4081-8ed8-212299fe1556) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1ae235a1-da6f-4081-8ed8-212299fe1556) and click on Share -> Publish.

## Encryption

This project uses end-to-end encryption to protect user data. The encryption is implemented using the `tweetnacl` and `tweetnacl-util` libraries.

### How it works

1.  **Secret Key**: A secret key is used to encrypt and decrypt the data. This key is stored in the `.env` file as `VITE_ENCRYPTION_KEY`.
2.  **Encryption**: Before sending any data to Supabase, the application encrypts it using the `encryptData` function in `src/lib/encryption.ts`. This function uses the `secretbox` function from `tweetnacl` to encrypt the data with the secret key.
3.  **Decryption**: When retrieving data from Supabase, the application decrypts it using the `decryptData` function in `src/lib/encryption.ts`. This function uses the `secretbox.open` function from `tweetnacl` to decrypt the data with the secret key.

### How to generate a new secret key

To generate a new secret key, you can use the following command:

```sh
node -e "import nacl from 'tweetnacl'; import tweetnaclUtil from 'tweetnacl-util'; const { encodeBase64 } = tweetnaclUtil; const key = nacl.randomBytes(nacl.secretbox.keyLength); console.log(encodeBase64(key));"
```

This will output a new secret key to the console. You should then add this key to your `.env` file.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
