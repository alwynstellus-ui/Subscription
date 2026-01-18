import { SignUp } from "@clerk/nextjs";
import { RedirectToDashboard } from "@/components/auth/redirect-to-dashboard";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RedirectToDashboard />
      <SignUp afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </div>
  );
}
