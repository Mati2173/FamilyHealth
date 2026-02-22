import { Link } from 'react-router-dom';
import { ArrowLeft, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

export default function AuthLayout({ 
    children, 
    showBackButton = false, 
    backTo = '/login',
    showBranding = true,
    brandingTitle = 'FamilyHealth',
    brandingSubtitle = 'Seguimiento de salud familiar'
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10 relative">
            {/* Back Button */}
            {showBackButton && (
                <div className="absolute top-4 left-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to={backTo}>
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Volver</span>
                        </Link>
                    </Button>
                </div>
            )}

            {/* Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md space-y-6">
                {/* Branding */}
                {showBranding && (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground">
                            <HeartPulse className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">{brandingTitle}</h1>
                        <p className="text-sm text-muted-foreground">{brandingSubtitle}</p>
                    </div>
                )}

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
