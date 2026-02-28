import MembershipForm from '@/components/MembershipForm';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Banner */}
      <div className="relative w-full h-40 sm:h-52 overflow-hidden">
        <img
          src="/assets/generated/membership-banner.dim_1200x300.png"
          alt="Membership Registration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/60 flex items-center justify-center">
          <div className="text-center text-primary-foreground px-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserPlus className="w-6 h-6" />
              <h1 className="font-display text-2xl sm:text-3xl font-700 tracking-tight">
                Member Registration
              </h1>
            </div>
            <p className="text-primary-foreground/80 text-sm sm:text-base max-w-md mx-auto">
              Fill in the details below to register a new member
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              All fields marked with <span className="text-destructive">*</span> are required.
            </p>
          </div>
          <MembershipForm />
        </div>
      </div>
    </div>
  );
}
