# cPanel Deployment Guide for Welfare Poll

This guide will help you deploy the Welfare Poll application to a cPanel hosting environment for the domain `snapsynk.co.ke`.

## Prerequisites

1.  **cPanel Access**: You must have access to cPanel.
2.  **Node.js Support**: Your hosting plan must support "Setup Node.js App".
3.  **Database**: PostgreSQL is preferred, but MySQL/MariaDB is also supported.

## Step 1: Prepare the Deployment Package

We have created a script to automate the build process.

1.  Open your terminal in the project root (or backend folder).
2.  Run the build script:
    ```bash
    cd welfare-poll-backend
    chmod +x build_deployment.sh
    ./build_deployment.sh
    ```
3.  This will create a file named `welfare-poll-cpanel.zip` in the parent directory. This zip file contains everything you need (Backend + Built Frontend).

## Step 2: Configure Database in cPanel

### Option A: PostgreSQL (Preferred)
1.  Go to **PostgreSQL Databases** in cPanel.
2.  Create a new database (e.g., `snapsynk_welfare`).
3.  Create a new user (e.g., `snapsynk_admin`) and password.
4.  Add the user to the database with **All Privileges**.

### Option B: MySQL (If PostgreSQL is not available)
1.  Go to **MySQL® Databases** in cPanel.
2.  Create a new database.
3.  Create a new user and password.
4.  Add the user to the database with **All Privileges**.

## Step 3: Setup Node.js App in cPanel

1.  Log in to cPanel.
2.  Find **Software** > **Setup Node.js App**.
3.  Click **Create Application**.
4.  **Node.js Version**: Select **20.x** or **22.x** (Recommended).
5.  **Application Mode**: Select **Production**.
6.  **Application Root**: Enter `welfare-poll` (or any folder name).
7.  **Application URL**: Select `snapsynk.co.ke`.
8.  **Application Startup File**: Enter `app.js`.
9.  Click **Create**.

## Step 4: Upload Files

1.  Go to **File Manager** in cPanel.
2.  Navigate to the folder you created (e.g., `welfare-poll`).
3.  **Delete** any default files created by cPanel (like `app.js` or `public` folder if empty).
4.  **Upload** the `welfare-poll-cpanel.zip` file you created in Step 1.
5.  **Extract** the zip file into this folder.
6.  Ensure all files (`app.js`, `package.json`, `public/`, `src/`, etc.) are in the root of your application folder.

## Step 5: Install Dependencies

1.  Go back to **Setup Node.js App**.
2.  Click the **Edit** (pencil) icon for your app.
3.  Scroll down and click **Run NPM Install**.
    *   *Note: If this fails, you may need to SSH into your server and run `npm install` manually, or ensure your hosting allows building native modules.*

## Step 6: Configure Environment Variables

1.  In **File Manager**, find the `.env` file in your application folder.
2.  Edit it and update the values:
    *   **DB_DIALECT**: `postgres` (or `mysql` if using MySQL).
    *   **DB_HOST**: Usually `127.0.0.1` or `localhost`.
    *   **DB_PORT**: `5432` (PostgreSQL) or `3306` (MySQL).
    *   **DB_NAME**, **DB_USER**, **DB_PASSWORD**: Use the credentials from Step 2.
    *   **JWT_SECRET**: Keep the generated one or make it secure.
    *   **EMAIL_***: Configure your SMTP settings.
    *   **ADMIN_***: Set your initial admin email and password.

## Step 7: Restart and Verify

1.  Go back to **Setup Node.js App**.
2.  Click **Restart Application**.
3.  Visit `https://snapsynk.co.ke`.
    *   You should see the application loading.
    *   The frontend is served automatically by the backend.

## Troubleshooting

*   **500 Error**: Check the `stderr.log` in your application folder.
*   **Database Connection Error**: Double-check `.env` credentials and ensure the database user has privileges.
*   **Static Files Not Loading**: Ensure the `public` folder exists and contains the built frontend files (`index.html`, `assets/`, etc.).
