import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Wrench, Shield, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex" style={{ background: 'oklch(0.22 0.06 240)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: 'oklch(0.18 0.05 240)' }}>
        <div className="flex items-center gap-3">
          <img src="/assets/generated/skpm-logo.dim_200x60.png" alt="SKPM Technical Services" className="h-10 object-contain" />
        </div>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-white leading-tight">
              Field Service Management
              <span className="block" style={{ color: 'oklch(0.75 0.16 65)' }}>Made Simple</span>
            </h1>
            <p className="mt-4 text-lg" style={{ color: 'oklch(0.72 0.03 240)' }}>
              Manage jobs, technicians, customers, and inventory all in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Wrench, label: 'Job Management', desc: 'Track work orders end-to-end' },
              { icon: Users, label: 'CRM', desc: 'Manage customer relationships' },
              { icon: BarChart3, label: 'Analytics', desc: 'Real-time performance insights' },
              { icon: Shield, label: 'Inventory', desc: 'Parts & stock control' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-xl p-4" style={{ background: 'oklch(0.25 0.06 240)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: 'oklch(0.75 0.16 65 / 0.2)' }}>
                  <Icon className="w-4 h-4" style={{ color: 'oklch(0.75 0.16 65)' }} />
                </div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'oklch(0.65 0.03 240)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm" style={{ color: 'oklch(0.55 0.03 240)' }}>
          © {new Date().getFullYear()} SKPM Technical Services
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl p-8 shadow-2xl" style={{ background: 'oklch(0.97 0.005 240)' }}>
            <div className="lg:hidden mb-6 flex justify-center">
              <img src="/assets/generated/skpm-logo.dim_200x60.png" alt="SKPM" className="h-10 object-contain" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">Welcome back</h2>
            <p className="mt-1 text-muted-foreground text-sm">Sign in to access your dashboard</p>

            <div className="mt-8 space-y-4">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full h-12 text-base font-semibold"
                style={{ background: 'oklch(0.28 0.08 240)', color: 'white' }}
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In with Internet Identity'
                )}
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Secure authentication powered by Internet Computer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
