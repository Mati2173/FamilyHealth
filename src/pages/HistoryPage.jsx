import { History } from 'lucide-react';

export default function HistoryPage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <History className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">Historial</p>
            <p className="text-sm text-muted-foreground">Próximamente</p>
        </div>
    );
}