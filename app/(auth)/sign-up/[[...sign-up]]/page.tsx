import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] gap-6">
      <SignUp />
      <Link 
        href="/" 
        className="text-[#94a3b8] hover:text-white transition-colors flex items-center gap-2 text-sm mt-4 px-4 py-2 rounded-lg hover:bg-white/5"
      >
        Explore Campus OS as Guest
      </Link>
    </div>
  );
}
