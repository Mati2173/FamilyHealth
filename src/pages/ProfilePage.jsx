import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function ProfilePage() {
    const { profile, refreshProfile } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile?.full_name  ?? '',
            height_cm: profile?.height_cm?.toString() ?? '',
            birth_date: profile?.birth_date ?? '',
            gender: profile?.gender ?? '',
            is_public: profile?.is_public ?? false,
        },
    });

    const { reset: resetForm } = form;

    // Reset form values when profile data changes
    useEffect(() => {
        if (profile) {
            resetForm({
                full_name: profile.full_name ?? '',
                height_cm: profile.height_cm?.toString() ?? '',
                birth_date: profile.birth_date ?? '',
                gender: profile.gender ?? '',
                is_public: profile.is_public ?? false,
            });
        }
    }, [profile, resetForm]);

    async function onSubmit(data) {
        if (!profile?.id) return;

        setIsLoading(true);
        
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: data.full_name,
                    height_cm: parseFloat(data.height_cm),
                    birth_date: data.birth_date,
                    gender: data.gender,
                    is_public: data.is_public,
                })
                .eq('id', profile.id);

            if (error) throw error;

            await refreshProfile();

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
            setIsLoading(false);
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

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    {/* Personal Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                Datos personales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
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
                                    control={form.control}
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
                                    control={form.control}
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
                                control={form.control}
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
                                control={form.control}
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
                    <Button type="submit" className="w-full h-11" disabled={isLoading || !form.formState.isDirty}>
                        {isLoading ? (
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
        </div>
    );
}