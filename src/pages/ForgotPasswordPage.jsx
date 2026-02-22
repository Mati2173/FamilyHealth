import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AuthLayout from '@/components/layout/AuthLayout';
const schema = z.object({
    email: z.email({ message: 'Correo Electrónico inválido' }),
});

export default function ForgotPasswordPage() {
    const { sendPasswordResetEmail } = useAuth();
    
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '' },
    });

    async function onSubmit(data) {
        setIsLoading(true)

        try {
            await sendPasswordResetEmail(data.email);
            setEmailSent(true);    
        } catch (error) {
            form.setError('email', {
                message: error?.message || 'Error al enviar el email',
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (emailSent) {
        return (
            <AuthLayout 
                showBackButton={true} 
                backTo="/login"
                brandingSubtitle="Revisa tu correo electrónico"
            >
                <Card className="w-full max-w-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="flex h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center">
                                <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            Email enviado
                        </CardTitle>
                        <CardDescription>Revisá tu casilla de correo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                            <AlertTitle className="text-green-900 dark:text-green-100 font-semibold">¡Listo!</AlertTitle>
                            <AlertDescription className="text-green-900/80 dark:text-green-100/80">
                                Te enviamos un link para restablecer tu contraseña a{' '}
                                <span className="text-green-900 dark:text-green-100 font-semibold">{form.getValues('email')}</span>.
                                El link es válido por 1 hora.
                            </AlertDescription>
                        </Alert>
                        <Button asChild variant="outline" className="w-full h-11">
                            <Link to="/login">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al inicio de sesión
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout 
            showBackButton={true} 
            backTo="/login"
            brandingSubtitle="Recuperá el acceso a tu cuenta"
        >
            <Card className="w-full max-w-md">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <div className="flex h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
                            <KeyRound className="h-4 w-4 text-primary" />
                        </div>
                        Recuperar contraseña
                    </CardTitle>
                    <CardDescription>Ingresá tu email y te enviaremos un link para restablecerla</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input {...field} type="email" placeholder="nombre@email.com" className="pl-9 h-11" disabled={isLoading} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar link de recuperación'
                                )}
                            </Button>

                            <div className="text-center text-sm">
                                <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}