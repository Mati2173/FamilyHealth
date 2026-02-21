import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, HeartPulse, Eye, EyeOff, Lock, Mail, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { ACTIVITY_LEVELS, ACTIVITY_LEVEL_OPTIONS } from '@/constants'

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showBalanceSetupDialog, setShowBalanceSetupDialog] = useState(false);

    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            heightCm: '',
            birthDate: '',
            gender: '',
            activityLevel: '',
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
                activityLevel: parseInt(data.activityLevel),
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
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10 relative">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md space-y-6">
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
                        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-5">
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">¿Cómo programar la balanza?</span>
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

                                <FormField
                                    control={form.control}
                                    name="activityLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nivel de actividad física</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Seleccionar" />
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
                                                {field.value && (
                                                    <>
                                                        {ACTIVITY_LEVELS[field.value].description} (Ejemplo: {ACTIVITY_LEVELS[field.value].example})
                                                    </>
                                                )}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                {/* ── Credentials ── */}
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Acceso
                                </p>

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
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>Contraseña</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input 
                                                        {...field} 
                                                        type={showPassword ? "text" : "password"} 
                                                        placeholder="••••••" 
                                                        autoComplete="new-password" 
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
                                                <FormDescription>Mínimo 6 caracteres</FormDescription>
                                            )}
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
                                                        type={showConfirmPassword ? "text" : "password"} 
                                                        placeholder="••••••" 
                                                        autoComplete="new-password" 
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

                {/* Balance Setup Dialog */}
                <Dialog open={showBalanceSetupDialog} onOpenChange={setShowBalanceSetupDialog}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <HeartPulse className="h-5 w-5" />
                                Cómo programar la balanza
                            </DialogTitle>
                            <DialogDescription>
                                Guía paso a paso para guardar tus datos en la balanza digital Philco BAP2021PI
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Introducción */}
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                                <p className="text-sm text-primary">
                                    Para que la balanza calcule correctamente tus métricas de salud, debes configurar un <span className="font-semibold">perfil de memoria</span> con tus datos personales.
                                </p>
                                <p className="text-xs text-primary mt-2">
                                    <span className="font-semibold">Nota:</span> El nombre, email y contraseña son solo para tu cuenta en FamilyHealth. La balanza solo necesita género, edad, altura y nivel de actividad.
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
                                        <h4 className="font-semibold text-foreground">Selecciona un perfil de memoria</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                                            <li>Presiona el botón <span className="font-semibold">SET</span> en la balanza</li>
                                            <li>Verás un número parpadeando en la parte inferior izquierda de la pantalla</li>
                                            <li>Usa las <span className="font-semibold">flechas de los costados</span> para seleccionar un perfil libre (1-10)</li>
                                            <li><span className="font-semibold">Recomendación:</span> Elige un número que nadie más de tu familia esté usando</li>
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
                                        <h4 className="font-semibold text-foreground">Configura tus datos personales</h4>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Presiona SET varias veces para ir ingresando cada campo. Los cambios se guardan automáticamente al pasar al siguiente campo.
                                        </p>
                                        
                                        <div className="space-y-3 mt-3">
                                            <div className="bg-muted/50 rounded-md p-3 space-y-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground mb-1">Género / Sexo</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Verás el icono de una persona (hombre o mujer) en la parte izquierda de la pantalla. Usa las <span className="font-semibold">flechas</span> para cambiar entre opciones.
                                                    </p>
                                                </div>
                                                
                                                <Separator />
                                                
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground mb-1">Edad (AGE)</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Aparece "AGE" a la izquierda. Usa las <span className="font-semibold">flechas arriba/abajo</span> para ajustar tu edad en años.
                                                    </p>
                                                </div>
                                                
                                                <Separator />
                                                
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground mb-1">Altura (CM)</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Aparece "CM" en pantalla. Usa las <span className="font-semibold">flechas arriba/abajo</span> para establecer tu altura en centímetros.
                                                    </p>
                                                </div>
                                                
                                                <Separator />
                                                
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground mb-1">Nivel de Actividad (AC-N)</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Aparece "AC-N" donde N es un número del 1 al 6. Usa las <span className="font-semibold">flechas</span> para seleccionar tu nivel:
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
                                        <h4 className="font-semibold text-foreground">Finaliza la configuración</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Al presionar SET después del último campo, verás <span className="font-semibold">"KG"</span> en pantalla. Esto significa que estás listo para pesarte.
                                        </p>
                                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md p-3 mt-2">
                                            <p className="text-sm text-green-900 dark:text-green-100 font-semibold mb-1">¡Configuración completa!</p>
                                            <p className="text-xs text-green-900/80 dark:text-green-100/80">
                                                Tus datos están guardados en el perfil seleccionado. Ahora ya puedes usar la balanza para tomar mediciones completas.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Recomendaciones */}
                            <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Recomendaciones importantes
                                </p>
                                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 ml-4 list-disc">
                                    <li>Apunta el número de perfil que elegiste para no olvidarlo</li>
                                    <li>Recuerda usar siempre el mismo perfil para obtener mediciones consistentes</li>
                                    <li>Los cambios se guardan automáticamente al avanzar entre campos</li>
                                    <li>Si cumplís años o cambia tu nivel de actividad, actualiza el perfil repitiendo estos pasos</li>
                                </ul>
                            </div>

                            <Separator />

                            {/* Close Button */}
                            <Button 
                                onClick={() => setShowBalanceSetupDialog(false)} 
                                className="w-full"
                            >
                                Entendido
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}