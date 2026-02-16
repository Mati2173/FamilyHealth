import { Users } from 'lucide-react';

export default function FamilyPage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">Mi Familia</p>
            <p className="text-sm text-muted-foreground">Próximamente</p>
        </div>
    );
}