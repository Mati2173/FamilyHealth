import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Inicio' },
    { to: '/nueva-medicion', icon: PlusCircle, label: 'Registrar' },
    { to: '/historial', icon: History, label: 'Historial' },
    { to: '/familia', icon: Users, label: 'Familia' },
];

export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-around max-w-2xl mx-auto px-2">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => cn(
                            'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors min-w-[60px]',
                            isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                                <span className="text-[10px] font-medium leading-none">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}