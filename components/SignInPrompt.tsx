import Link from "next/link";

export default function SignInPrompt({ next, message }: { next: string; message: string }) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-extrabold text-slate-900">Please sign in</h1>
      <p className="text-slate-700">{message}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href={`/auth/login?next=${encodeURIComponent(next)}`} className="btn-primary text-center">
          Sign in
        </Link>
        <Link href={`/auth/register?next=${encodeURIComponent(next)}`} className="btn-secondary text-center">
          Create account
        </Link>
      </div>
    </div>
  );
}
