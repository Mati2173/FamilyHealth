import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, HeartPulse } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function TopBar({ title }) {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    async function handleSignOut() {
        try {
            await signOut();
            navigate('/login');
        } catch {
            toast({ variant: 'destructive', title: 'Error al cerrar sesión' });
        }
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between px-4 max-w-2xl mx-auto">

                {/* Branding */}
                <div className="flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-base">{title ?? 'FamilyHealth'}</span>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="font-normal">
                            <p className="font-medium text-sm">{profile?.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate capitalize">{profile?.gender}</p>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <Link to="/perfil" className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" /> Mi perfil
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                Cerrar sesión
                            </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}