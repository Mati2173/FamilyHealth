import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, HeartPulse } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
    fullName: z
        .string()
        .min(2, 'Ingresá tu nombre completo'),

    email: z
        .email({ message: 'Email inválido' }),

    password: z
        .string()
        .min(6, 'Mínimo 6 caracteres'),

    confirmPassword: z
        .string(),

    heightCm: z
        .string()
        .min(1, 'La altura es obligatoria')
        .refine(
            (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 50 && parseFloat(v) <= 200,
            { message: 'Ingresá una altura válida (50 - 200 cm)' }
        ),

    birthDate: z
        .string()
        .min(1, 'La fecha de nacimiento es obligatoria')
        .refine(
            (v) => {
                const date = new Date(v)
                const now  = new Date()
                return date < now
            },
            { message: 'La fecha debe ser en el pasado' }
        ),

    gender: z.enum(['masculino', 'femenino'], {
        required_error: 'Seleccioná un género',
    }),

}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    }
);

export default function RegisterPage() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            heightCm: '',
            birthDate: '',
            gender: undefined,
        },
    });

    async function onSubmit(data) {
        setLoading(true)
        
        try {
            await signUp({
                email: data.email,
                password: data.password,
                fullName: data.fullName,
                heightCm: parseFloat(data.heightCm),
                birthDate: data.birthDate,
                gender: data.gender,
            });

            toast({
                title: '¡Cuenta creada!',
                description: data.gender === 'femenino'
                    ? 'Bienvenida a FamilyHealth.'
                    : 'Bienvenido a FamilyHealth.',
            });
            
            navigate('/');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error al registrarse',
                description: error?.message || 'Ocurrió un problema. Intentá de nuevo.',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
            <div className="w-full max-w-sm space-y-6">
                {/* Branding */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground">
                        <HeartPulse className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">FamilyHealth</h1>
                    <p className="text-sm text-muted-foreground">Creá tu cuenta familiar</p>
                </div>

                {/* Sign Up Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Registro</CardTitle>
                        <CardDescription>Completá todos los campos para comenzar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>

                                {/* ── Personal Info ── */}
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Datos personales
                                </p>

                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre completo</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="María García" autoComplete="name" className="h-11" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="heightCm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Altura</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input {...field} type="number" inputMode="decimal" placeholder="170" className="h-11 pr-9" />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">cm</span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Género</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder="Elegir" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="masculino">Masculino</SelectItem>
                                                        <SelectItem value="femenino">Femenino</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="birthDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de nacimiento</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" className="h-11" max={new Date().toISOString().split('T')[0]} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                {/* ── Credentials ── */}
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Credenciales de acceso
                                </p>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="nombre@email.com" autoComplete="email" className="h-11" />
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
                                                <Input {...field} type="password" placeholder="••••••••" autoComplete="new-password" className="h-11" />
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
                                            <FormLabel>Confirmar contraseña</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="••••••••" autoComplete="new-password" className="h-11" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full h-11" disabled={loading}>
                                    {loading
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</>
                                        : 'Crear cuenta'
                                    }
                                </Button>

                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Link to Login */}
                <p className="text-center text-sm text-muted-foreground">
                    ¿Ya tenés cuenta?{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                        Iniciá sesión
                    </Link>
                </p>

            </div>
        </div>
    );
}