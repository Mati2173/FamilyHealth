import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, User as UserIcon, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast }  from '@/hooks/use-toast';

const profileSchema = z.object({
    full_name: z
        .string()
        .min(2, 'Ingresá tu nombre completo'),

    height_cm: z
        .string()
        .min(1, 'La altura es obligatoria')
        .refine(
            (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 50 && parseFloat(v) <= 200,
            { message: 'Ingresá una altura válida (50 - 200 cm)' }
    ),

    birth_date: z
        .string()
        .min(1, 'La fecha de nacimiento es obligatoria')
        .refine(
            (v) => {
                const date = new Date(v);
                const now  = new Date();
                return date < now;
            },
            { message: 'La fecha debe ser en el pasado' }
        ),

    gender: z.enum(['masculino', 'femenino'], {
        required_error: 'Seleccioná un género',
    }),

    is_public: z.boolean(),
});

const securitySchema = z.object({
    email: z
        .email({ message: 'Email inválido' }),
    
    password: z
        .string()
        .optional()
        .refine(val => !val || val.length >= 6, {
            message: 'Mínimo 6 caracteres',
        }),
    
    confirmPassword: z
        .string()
        .optional()
}).refine(
    (data) => data.password && data.password === data.confirmPassword,
    {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    }
);

export default function ProfilePage() {
    const { user, profile, updateUserProfile, updateUserAccount } = useAuth();
    const { toast } = useToast();
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile?.full_name  ?? '',
            height_cm: profile?.height_cm?.toString() ?? '',
            birth_date: profile?.birth_date ?? '',
            gender: profile?.gender ?? '',
            is_public: profile?.is_public ?? false,
        },
    });

    const securityForm = useForm({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            email: user?.email || '',
            password: '',
            confirmPassword: '',
        },
    });

    const { reset: resetProfileForm } = profileForm;
    const { reset: resetSecurityForm } = securityForm;

    // Reset form values when profile data changes
    useEffect(() => {
        if (profile) {
            resetProfileForm({
                full_name: profile.full_name ?? '',
                height_cm: profile.height_cm?.toString() ?? '',
                birth_date: profile.birth_date ?? '',
                gender: profile.gender ?? '',
                is_public: profile.is_public ?? false,
            });
        }
    }, [profile, resetProfileForm]);

    // Reset security form when user changes
    useEffect(() => {
        if (user) {
            resetSecurityForm({
                email: user.email || '',
                password: '',
                confirmPassword: '',
            });
        }
    }, [user, resetSecurityForm]);

    async function onSubmitProfile(data) {
        if (!profile?.id) return;

        setIsLoadingProfile(true);
        
        try {
            await updateUserProfile({
                full_name: data.full_name,
                height_cm: parseFloat(data.height_cm),
                birth_date: data.birth_date,
                gender: data.gender,
                is_public: data.is_public,
            });

            toast({
                title: '✓ Perfil actualizado',
                description: 'Tus cambios fueron guardados correctamente.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error al guardar',
                description: error?.message || 'No se pudieron guardar los cambios.',
            });
        } finally {
            setIsLoadingProfile(false);
        }
    }

    async function onSubmitSecurity(data) {
        setIsLoadingSecurity(true);
        const updates = {};

        if (data.email !== user?.email) updates.email = data.email;
        if (data.password) updates.password = data.password;

        if (Object.keys(updates).length === 0) {
            setIsLoadingSecurity(false);
            return;
        }

        try {
            await updateUserAccount(updates);

            toast({
                title: 'Cuenta actualizada',
                description: updates.email 
                    ? 'Revisá tu correo para confirmar el cambio.' 
                    : 'Tu contraseña ha sido actualizada.',
            });
            
            securityForm.reset({ email: data.email, password: '' });

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        } finally {
            setIsLoadingSecurity(false);
        }
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground">
                    <UserIcon className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Mi perfil</h2>
                    <p className="text-sm text-muted-foreground">
                        Configurá tus datos personales
                    </p>
                </div>
            </div>

            <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-5" noValidate>
                    {/* Personal Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Datos personales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={profileForm.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre completo</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="María García" className="h-11" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={profileForm.control}
                                    name="height_cm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Altura</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input {...field} type="number" inputMode="decimal" placeholder="170" className="h-11 pr-9" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                                        cm
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={profileForm.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Género</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue />
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
                                control={profileForm.control}
                                name="birth_date"
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
                        </CardContent>
                    </Card>

                    {/* Privacy Settings */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Privacidad
                            </CardTitle>
                            <CardDescription>
                                Controlá quién puede ver tu progreso
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={profileForm.control}
                                name="is_public"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
                                            <div className="flex-1">
                                                <FormLabel className="text-base font-medium">
                                                    Perfil público
                                                </FormLabel>
                                                <FormDescription className="mt-1">
                                                    {field.value
                                                        ? 'Tus mediciones son visibles para otros familiares autenticados.'
                                                        : 'Solo vos podés ver tus mediciones.'
                                                    }
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full h-11" disabled={isLoadingProfile || !profileForm.formState.isDirty}>
                        {isLoadingProfile ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                    Guardar cambios
                            </>
                        )}
                    </Button>
                </form>
            </Form>

            <Separator className="my-8" />

            {/* Security Settings */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Seguridad de la cuenta
                    </CardTitle>
                    <CardDescription>Administrá tu acceso y credenciales</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...securityForm}>
                        <form onSubmit={securityForm.handleSubmit(onSubmitSecurity)} className="space-y-4">
                            <FormField
                                control={securityForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input {...field} className="pl-9 h-11" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={securityForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nueva Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    {...field} 
                                                    type={showPassword ? "text" : "password"} 
                                                    placeholder="••••••" 
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
                                        <FormDescription>
                                            Dejalo vacío si no querés cambiarla.
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={securityForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••"
                                                    className="pl-9 pr-10 h-11"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showConfirmPassword ? (
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
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isLoadingSecurity || !securityForm.formState.isDirty}>
                                    {isLoadingSecurity && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Actualizar Credenciales
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}