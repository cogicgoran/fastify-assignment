# Fastify assignment
Assigment for job.

Create NodeJS backend using Fastify.js and Drizzle in Typescript.  
Requirements:  
User needs to be able to register and login with email/password and receive JWT token + refresh tokens. -  
Email verification is required (use any email service API you want, there are many free ones) -  
Use all good practices when it comes to email validation and input validation. -  
Have user sessions tracked. -?  
Have auth middleware for auth-protected routes. -  
Create endpoint for refreshing JWT token. -  
Create endpoint for logout (deletes the session/jwt token). -  
Create endpoint for removing all other sessions (like loggout all other sessions). -  
Create endpoint to return user info (GET /user/me, it can return his email). -  
Create simple e2e tests using Vitest (use mocking for email sending) -  

## Setup
Run `npm install`  
Run `docker compose up -d` 
Create `.env` file matching `.env.example` structure  
Run `npm run dev` to spin up the server  
You can interact with server on `http://localhost:3000/api/documentation`  

## Tests
To run tests make sure `.env.test` variables have correct db connection, you can use `master` database that is created by default, or create blank database called `test` if you want to use the default `.env.test` config
Run `npm run test`