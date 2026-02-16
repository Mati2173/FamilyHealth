import { User } from 'lucide-react';

export default function ProfilePage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <User className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">Mi Perfil</p>
            <p className="text-sm text-muted-foreground">Próximamente</p>
        </div>
    );
}