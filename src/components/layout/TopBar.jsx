import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, HeartPulse, Moon, Sun, Laptop, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';

export default function TopBar({ title }) {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();

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

                {/* Theme Toggle + User Menu */}
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme('light')}>
                                <Sun className="mr-2 h-4 w-4" />
                                Claro
                                {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('dark')}>
                                <Moon className="mr-2 h-4 w-4" />
                                Oscuro
                                {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('system')}>
                                <Laptop className="mr-2 h-4 w-4" />
                                Sistema
                                {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

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
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
            </div>
        </header>
    );
}