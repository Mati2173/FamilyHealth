import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/layout/AuthLayout';

const loginSchema = z.object({
    email: z.email({ message: 'Email inválido' }),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export default function LoginPage() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    async function onSubmit(data) {
        setLoading(true);
        
        try {
            await signIn(data);
            navigate('/');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error al iniciar sesión',
                description: error?.message || 'Verificá tus credenciales e intentá de nuevo.',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            {/* Sign In Form */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="flex h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
                                <LogIn className="h-4 w-4 text-primary" />
                            </div>
                            Iniciar sesión
                        </CardTitle>
                        <CardDescription>Ingresá con tu cuenta familiar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correo Electrónico</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input {...field} type="email" placeholder="nombre@email.com" autoComplete="email" className="pl-9 h-11" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                                        type={showPassword ? "text" : "password"} 
                                                        placeholder="••••••" 
                                                        autoComplete="current-password" 
                                                        className="pl-9 pr-10 h-11" 
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full h-11" disabled={loading}>
                                    {loading
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ingresando...</>
                                        : 'Ingresar'
                                    }
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Forgot Password Link */}
                <p className="text-center text-sm">
                    <Link to="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </p>

                {/* Link to Register */}
                <p className="text-center text-sm text-muted-foreground">
                    ¿No tenés cuenta?{' '}
                    <Link to="/register" className="text-primary font-medium hover:underline">
                        Registrate
                    </Link>
                </p>
        </AuthLayout>
    );
}