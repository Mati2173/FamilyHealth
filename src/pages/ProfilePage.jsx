import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, User as UserIcon, Lock, Mail, Eye, EyeOff, Info, HelpCircle, HeartPulse, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast }  from '@/hooks/use-toast';
import { ACTIVITY_LEVELS, ACTIVITY_LEVEL_OPTIONS } from '@/constants'

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

    gender: z
        .string()
        .min(1, 'Seleccioná un género')
        .refine((value) => ['masculino', 'femenino'].includes(value), {
            message: 'Seleccioná un género válido',
        }),

    activityLevel: z
        .string()
        .min(1, 'Seleccioná un nivel de actividad física')
        .refine((value) => Object.keys(ACTIVITY_LEVELS).includes(value), {
            message: 'Seleccioná un nivel de actividad válido',
        }),
});

const privacySchema = z.object({
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
    (data) => !data.password || data.password === data.confirmPassword,
    {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    }
);

export default function ProfilePage() {
    const { user, profile, updateUserProfile, updateUserAccount } = useAuth();
    const { toast } = useToast();
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPrivacy, setIsLoadingPrivacy] = useState(false);
    const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showBalanceSetupDialog, setShowBalanceSetupDialog] = useState(false);

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile?.full_name  ?? '',
            height_cm: profile?.height_cm?.toString() ?? '',
            birth_date: profile?.birth_date ?? '',
            gender: profile?.gender ?? '',
            activityLevel: profile?.activity_level?.toString() ?? '',
        },
    });

    const privacyForm = useForm({
        resolver: zodResolver(privacySchema),
        defaultValues: {
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

    const { formState: securityFormState, trigger: triggerSecurityForm, watch: watchSecurityForm } = securityForm;
    const passwordValue = watchSecurityForm('password');

    const { reset: resetProfileForm } = profileForm;
    const { reset: resetPrivacyForm } = privacyForm;
    const { reset: resetSecurityForm } = securityForm;

    // Reset form values when profile data changes
    useEffect(() => {
        if (profile) {
            resetProfileForm({
                full_name: profile.full_name ?? '',
                height_cm: profile.height_cm?.toString() ?? '',
                birth_date: profile.birth_date ?? '',
                gender: profile.gender ?? '',
                activityLevel: profile.activity_level?.toString() ?? '',
            });
            resetPrivacyForm({
                is_public: profile.is_public ?? false,
            });
        }
    }, [profile, resetProfileForm, resetPrivacyForm]);

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

    // Keep confirmPassword errors in sync when password changes after submit.
    useEffect(() => {
        if (securityFormState.isSubmitted) {
            triggerSecurityForm('confirmPassword');
        }
    }, [passwordValue, securityFormState.isSubmitted, triggerSecurityForm]);

    async function onSubmitProfile(data) {
        if (!profile?.id) return;

        setIsLoadingProfile(true);
        
        try {
            await updateUserProfile({
                full_name: data.full_name,
                height_cm: parseFloat(data.height_cm),
                birth_date: data.birth_date,
                gender: data.gender,
                activity_level: data.activityLevel,
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

    async function onSubmitPrivacy(data) {
        if (!profile?.id) return;

        setIsLoadingPrivacy(true);
        
        try {
            await updateUserProfile({
                is_public: data.is_public,
            });

            toast({
                title: '✓ Privacidad actualizada',
                description: data.is_public 
                    ? 'Tu perfil ahora es público para otros familiares.'
                    : 'Tu perfil ahora es privado.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error al guardar',
                description: error?.message || 'No se pudieron guardar los cambios.',
            });
        } finally {
            setIsLoadingPrivacy(false);
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
                        Configurá tus datos y preferencias
                    </p>
                </div>
            </div>

            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personal">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Datos personales</span>
                    </TabsTrigger>
                    <TabsTrigger value="privacy">
                        <Shield className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Privacidad</span>
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Lock className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Seguridad</span>
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: Datos Personales */}
                <TabsContent value="personal" className="space-y-5 mt-5">
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-5" noValidate>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        Información básica
                                    </CardTitle>
                                    <CardDescription>
                                        Datos utilizados por la balanza para calcular tus métricas
                                    </CardDescription>
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

                                    <FormField
                                        control={profileForm.control}
                                        name="activityLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nivel de actividad física</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {ACTIVITY_LEVEL_OPTIONS.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className="text-xs">
                                                    {field.value && ACTIVITY_LEVELS[field.value].description} (Ejemplo: {ACTIVITY_LEVELS[field.value].example})
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Balance Setup Help */}
                            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium text-primary">¿Necesitás actualizar estos datos en tu balanza?</span>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setShowBalanceSetupDialog(true)}
                                    className="text-primary hover:bg-primary/10 h-8"
                                >
                                    Ver instrucciones
                                </Button>
                            </div>

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
                </TabsContent>

                {/* TAB 2: Privacidad */}
                <TabsContent value="privacy" className="space-y-5 mt-5">
                    <Form {...privacyForm}>
                        <form onSubmit={privacyForm.handleSubmit(onSubmitPrivacy)} className="space-y-5" noValidate>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        Visibilidad del perfil
                                    </CardTitle>
                                    <CardDescription>
                                        Controlá quién puede ver tu progreso
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={privacyForm.control}
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

                            {/* Info about privacy */}
                            <Card className="border-primary/20 bg-primary/5">
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex gap-3 text-sm">
                                        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="font-medium text-primary">
                                                ¿Qué significa perfil público?
                                            </p>
                                            <div className="text-muted-foreground text-xs space-y-1">
                                                <p><span className="font-semibold">Público:</span> Otros miembros de la familia que hayan iniciado sesión podrán ver tus mediciones en la página "Dashboard familiar"</p>
                                                <p><span className="font-semibold">Privado:</span> Solo vos podrás ver tus datos. Nadie más tendrá acceso a tus mediciones</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full h-11" disabled={isLoadingPrivacy || !privacyForm.formState.isDirty}>
                                {isLoadingPrivacy ? (
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
                </TabsContent>

                {/* TAB 3: Seguridad */}
                <TabsContent value="security" className="space-y-5 mt-5">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Credenciales de acceso
                            </CardTitle>
                            <CardDescription>Administrá tu email y contraseña</CardDescription>
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
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input {...field} type="email" placeholder="nombre@email.com" className="pl-9 h-11" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <Separator className="my-4" />
                                    
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Cambiar Contraseña
                                    </p>
                                    
                                    <FormField
                                        control={securityForm.control}
                                        name="password"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel>Nueva Contraseña</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                                {!fieldState.error && (
                                                    <FormDescription>
                                                        Dejalo vacío si no querés cambiarla. Mínimo 6 caracteres.
                                                    </FormDescription>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={securityForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirmar Contraseña</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                    
                                    <Button type="submit" className="w-full h-11 mt-4" disabled={isLoadingSecurity || !securityForm.formState.isDirty}>
                                        {isLoadingSecurity ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Actualizando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Actualizar credenciales
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Balance Setup Dialog */}
            <Dialog open={showBalanceSetupDialog} onOpenChange={setShowBalanceSetupDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <HeartPulse className="h-5 w-5" />
                            Cómo actualizar tu perfil en la balanza
                        </DialogTitle>
                        <DialogDescription>
                            Guía paso a paso para actualizar tus datos en la balanza
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Introducción */}
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <p className="text-sm text-primary">
                                Si actualizaste tus datos personales, es importante que también los actualices en tu <span className="font-semibold">perfil de la balanza</span> para que las mediciones sigan siendo precisas.
                            </p>
                        </div>

                        <Separator />

                        {/* Paso 1 */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex h-6 w-6 rounded-full bg-primary text-white items-center justify-center text-xs font-semibold flex-shrink-0">
                                    1
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-semibold text-foreground">Selecciona tu perfil de memoria</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                                        <li>Presiona el botón <span className="font-semibold">SET</span> en la balanza</li>
                                        <li>Verás un número parpadeando en la parte inferior izquierda de la pantalla</li>
                                        <li>Usa las <span className="font-semibold">flechas de los costados</span> para navegar hasta tu perfil</li>
                                        <li><span className="font-semibold">Importante:</span> Usá el mismo número de perfil que elegiste al registrarte</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Paso 2 */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex h-6 w-6 rounded-full bg-primary text-white items-center justify-center text-xs font-semibold flex-shrink-0">
                                    2
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-semibold text-foreground">Actualiza los campos modificados</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Presiona SET varias veces para ir a cada campo. Los cambios se guardan automáticamente al pasar al siguiente.
                                    </p>
                                    
                                    <div className="space-y-3 mt-3">
                                        <div className="bg-muted/50 rounded-md p-3 space-y-3">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground mb-1">Género / Sexo</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Icono de persona en la pantalla. Usa las <span className="font-semibold">flechas</span> para cambiar.
                                                </p>
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div>
                                                <p className="text-sm font-semibold text-foreground mb-1">Edad (AGE)</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Aparece "AGE" a la izquierda. Usa las <span className="font-semibold">flechas arriba/abajo</span> para ajustar.
                                                </p>
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div>
                                                <p className="text-sm font-semibold text-foreground mb-1">Altura (CM)</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Aparece "CM" en pantalla. Usa las <span className="font-semibold">flechas arriba/abajo</span>.
                                                </p>
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div>
                                                <p className="text-sm font-semibold text-foreground mb-1">Nivel de Actividad (AC-N)</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Aparece "AC-N" (número 1-6). Usa las <span className="font-semibold">flechas</span>:
                                                </p>
                                                <ul className="text-xs text-muted-foreground mt-1 ml-4 space-y-0.5">
                                                    <li>• 1-2: Sedentario</li>
                                                    <li>• 3-4: Moderadamente activo</li>
                                                    <li>• 5-6: Muy activo</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Paso 3 */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex h-6 w-6 rounded-full bg-primary text-white items-center justify-center text-xs font-semibold flex-shrink-0">
                                    3
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-semibold text-foreground">Confirma los cambios</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Al presionar SET después del último campo, verás <span className="font-semibold">"KG"</span>. Tus datos ya están actualizados.
                                    </p>
                                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md p-3 mt-2">
                                        <p className="text-sm text-green-900 dark:text-green-100 font-semibold mb-1">¡Perfil actualizado!</p>
                                        <p className="text-xs text-green-900/80 dark:text-green-100/80">
                                            La balanza ahora usará tus datos actualizados para calcular tus métricas de salud.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Recomendación */}
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                ¿Cuándo actualizar?
                            </p>
                            <ul className="text-sm text-amber-900/80 dark:text-amber-100/80 space-y-1 ml-4 list-disc">
                                <li>Cuando cumplas años (actualizar edad)</li>
                                <li>Si cambia tu nivel de actividad física significativamente</li>
                                <li>Si corregiste algún dato personal en tu cuenta</li>
                            </ul>
                        </div>

                        <Separator />

                        {/* Close Button */}
                        <Button 
                            onClick={() => setShowBalanceSetupDialog(false)} 
                            className="w-full"
                        >
                            Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}