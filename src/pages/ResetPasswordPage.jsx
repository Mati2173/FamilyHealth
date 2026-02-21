import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, HeartPulse, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from '@/components/layout/ThemeToggle';

const schema = z.object({
    password: z
        .string()
        .min(6, 'Mínimo 6 caracteres'),
    
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
    const { loading: loadingTokenVerification, isAuthenticated, updateUserAccount } = useAuth();

    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    async function onSubmit(data) {
        setIsLoading(true);

        try {
            await updateUserAccount({ password: data.password });
            toast({
                title: '✓ Contraseña actualizada',
                description: 'Tu contraseña ha sido actualizada exitosamente.',
            });

            navigate('/');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error?.message || 'No se pudo actualizar la contraseña.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Show spinner while verifying token
    if (loadingTokenVerification) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Verificando token...</p>
                </div>
            </div>
        );
    }

    // If not loading and not authenticated, token is invalid or expired
    if (!loadingTokenVerification && !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4 py-10 relative">
                {/* Theme Toggle */}
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>

                <Card className="w-full max-w-md">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <HeartPulse className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Token inválido</CardTitle>
                        <CardDescription>El enlace para restablecer tu contraseña no es válido o ha expirado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert className="border-red-600 bg-red-50 dark:border-red-700 dark:bg-red-950">
                            <AlertDescription className="text-red-700 dark:text-red-300">
                                Por favor, solicitá un nuevo enlace de restablecimiento de contraseña.
                            </AlertDescription>
                        </Alert>
                        <Button asChild variant="outline" className="w-full">
                            <Link to="/forgot-password">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a solicitar enlace
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // If authenticated, show the reset password form
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background relative">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <HeartPulse className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
                    <CardDescription>Ingresá tu nueva contraseña</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••" 
                                                    className="pl-9 pr-10 h-11"
                                                    disabled={isLoading}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Mínimo 6 caracteres</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    placeholder="••••••" 
                                                    className="pl-9 pr-10 h-11"
                                                    disabled={isLoading}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...
                                </>
                                ) : (
                                    'Actualizar contraseña'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}