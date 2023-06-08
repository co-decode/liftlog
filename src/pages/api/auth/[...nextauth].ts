import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import NetlifyProvider from "next-auth/providers/netlify";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "../../../server/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { Adapter, AdapterAccount } from "next-auth/adapters";
import { caller } from "@/server/routers/users";
import * as bcrypt from "bcrypt";

const adapter = {
  ...PrismaAdapter(prisma),
  linkAccount: ({ ok, state, ...data }: any) => {
    console.log("linkAccount call: ", data);
    prisma.account.create({ data });
  },
} as Adapter;
export const authOptions: NextAuthOptions = {
  adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: {
          label: "Identifier",
          type: "text",
          placeholder: "Your Email",
        },
        //username: { label: "Username", type: "text", placeholder: "Your Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier) return null;
        const checkCreds = await caller.checkCreds(credentials.identifier);
        if (!checkCreds?.password) return null;
        try {
          const result = await bcrypt.compare(
            credentials.password,
            checkCreds.password
          );
          if (result) {
            // Any object returned will be saved in `user` property of the JWT
            return {
              id: String(checkCreds.id),
              name: checkCreds.name || credentials.identifier.split("@")[0],
              email: credentials.identifier,
            };
          } else {
            // If you return null then an error will be displayed advising the user to check their details.
            return null;
            // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
          }
        } catch {
          console.error("Password comparison failed");
          throw Error;
        }
      },
    }),
    EmailProvider({
      id: "email",
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest(params) {
        const { identifier, url } = params;
        const { host } = new URL(url);
        const mailerSend = new MailerSend({
          apiKey: process.env.MAILERSEND_API_TOKEN,
        });
        const recipients = [new Recipient(identifier, "LiftLog User")];
        const sentFrom = new Sender(process.env.EMAIL_FROM, "LiftLog");
        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setReplyTo(sentFrom)
          .setSubject(`Sign in to ${host}`)
          .setHtml(html({ url, host }))
          .setText(text({ url, host }));

        mailerSend.email
          .send(emailParams)
          .then((response) => console.log(response))
          .catch((error) => console.log(error));
      },
    }),
    GithubProvider({
      id: "github",
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    NetlifyProvider({
      id: "netlify",
      clientId: process.env.NETLIFY_ID,
      clientSecret: process.env.NETLIFY_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: { scope: "user" },
      },
    }),
  ],
  theme: {
    colorScheme: "auto",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

export default NextAuth(authOptions);

function html(params: { url: string; host: string }) {
  const { url, host } = params;

  const escapedHost = host.replace(/\./g, "&#8203;.");

  const brandColor = "#346df1";
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: "#fff",
  };

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}
