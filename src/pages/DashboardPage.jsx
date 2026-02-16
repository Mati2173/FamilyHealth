import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { HeartPulse } from 'lucide-react';

export default function DashboardPage() {
    const { profile, signOut } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center gap-6 bg-background py-24 px-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground">
                <HeartPulse className="h-8 w-8" />
            </div>
            <div className="text-center">
                <h1 className="text-2xl font-bold">
                    {profile?.gender === 'femenino' ? '¡Bienvenida' : '¡Bienvenido'}, {profile?.full_name ?? 'usuario'}!
                </h1>
                <p className="text-muted-foreground mt-1">
                    Próximamente
                </p>
            </div>
            <Button variant="outline" onClick={signOut}>
                Cerrar sesión
            </Button>
        </div>
    );
}