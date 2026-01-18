import { SignIn } from "@clerk/nextjs";
import { RedirectToDashboard } from "@/components/auth/redirect-to-dashboard";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RedirectToDashboard />
      <SignIn afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </div>
  );
}
