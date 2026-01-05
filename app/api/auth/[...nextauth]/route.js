import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // scope: "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
          scope: "openid email profile ",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Cek apakah Google ID ini sudah dipakai oleh user lain
        const existingUser = await prisma.user.findFirst({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              googleId: profile.sub,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
            },
          });
        } else {
          // Jika user sudah ada → update nama
          await prisma.user.update({
            where: { email: user.email },
            data: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              updatedAt: new Date(),
            },
          });
        }

        return true; // Lanjutkan login jika tidak bentrok
      } catch (error) {
        console.error("Error menyimpan user:", error);
        return false;
      }
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          profileCompleted: true,
          createdAt: true,
          unitJabatan: {
            select: {
              id: true,
              unit: { select: { nama: true } },
              jabatan: { select: { nama: true } },
            },
          },
        },
      });
      session.user.id = dbUser.id;
      session.user.profileCompleted = dbUser.profileCompleted;
      session.user.name = dbUser.name;

      // Session token google
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;

      // unit dan jabatan
      // 🔥 Tambahkan list unit & jabatan sebagai array
      session.user.units = dbUser.unitJabatan.map((uj) => uj.unit.nama);
      session.user.jabatans = dbUser.unitJabatan.map((uj) => uj.jabatan.nama);

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
