import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { getUser } from './app/lib/data';
import bcrypt from 'bcrypt';

const nextAuth = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // 1. validate the information coming from the form
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await getUser(email);
          // console.log('user', user);

          if (!user) return null;

          const passwordMatch = await bcrypt.compare(password, user.password);
          // console.log('passwordMatch', passwordMatch);

          if (passwordMatch) {
            return user;
          }
        }

        // 2. check if the user exists in the database
        // 2a. if the user exists, check if the supplied password matches the hashed password in the database
        // 2b. if the password does match, return user object
        // 3. tell credential supplied is invalid
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});

export const { auth, signIn, signOut } = nextAuth;
