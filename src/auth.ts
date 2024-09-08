import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/sveltekit/providers/github"
import { AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_SECRET } from "$env/static/private"
 
export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => {
  const authOptions = {
    providers: [
      GitHub({
        clientId: AUTH_GITHUB_ID,
        clientSecret: AUTH_GITHUB_SECRET
      })
    ],
    secret: AUTH_SECRET,
    trustHost: true
  }
  return authOptions
})