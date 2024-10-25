















Contacts Management API
This is a RESTful API for managing contacts with user authentication, file upload, and CRUD operations.


Features
User registration and login with JWT authentication

Contact management (create, read, update, soft delete)

File upload for CSV files and processing

Rate limiting for login attempts


Technologies Used

Node.js
Express.js
SQLite
JWT (JSON Web Tokens)

bcryptjs for password hashing

multer for file uploads

Joi for data validation

csv-parser for processing CSV files




Setup Instructions


Prerequisites

Node.js (v12 or higher)
npm (Node Package Manager)
SQLite3





Installation

Clone the repository

git clone https://github.com/vicky848/backend-assignment.git


Install dependencies

Run the following command to install the necessary packages:


npm install



Create the SQLite database

The project expects a SQLite database named database.db to be present in the project directory. You can create it using the SQLite CLI or use an existing one with the correct schema.


Running the Backend Server
To start the server, run the following command in your terminal:

npm start



The server will start on http://localhost:3000 (or the port specified in your environment).




Upload CSV File
POST /api/upload
Form Data:
file: (CSV file)
Manage Contacts
GET /api/contacts - Retrieve contacts with optional query filters (name, email, timezone).
PUT /api/contacts/:id - Update a contact's information.
DELETE /api/contacts/:id - Soft delete a contact.
Rate Limiting
The API implements rate limiting for login attempts to prevent brute force attacks. If the limit is exceeded, a 429 Too Many Requests response will be returned.

















This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
