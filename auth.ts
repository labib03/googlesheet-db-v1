import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { findUserByUsername } from "@/lib/user-sheets"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await findUserByUsername(credentials.username as string);
        
        if (!user || !user.Password) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.Password
        );

        if (!isPasswordCorrect) return null;

        return {
          id: user.Username,
          name: user.Name,
          username: user.Username,
          role: user.Role,
          desa: user.Desa,
        };
      },
    }),
  ],
})
