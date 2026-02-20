import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Scale, Flame, Droplets, Dumbbell, Bone, Utensils, Calculator, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const measurementSchema = z.object({
    weight_kg: z
        .string()
        .min(1, 'El peso es obligatorio')
        .refine(
            (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 2 && parseFloat(v) <= 180,
            { message: 'Ingresá un peso válido (2 - 180 kg)' }
        ),

    body_fat_pct: z
        .string()
        .optional()
        .transform((v) => (v === '' || v === undefined ? null : v))
        .refine(
            (v) => v === null || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0 && parseFloat(v) <= 100),
            { message: 'Valor entre 0 y 100' }
        ),

    body_water_pct: z
        .string()
        .optional()
        .transform((v) => (v === '' || v === undefined ? null : v))
        .refine(
            (v) => v === null || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0 && parseFloat(v) <= 100),
            { message: 'Valor entre 0 y 100' }
        ),

    muscle_mass_pct: z
        .string()
        .optional()
        .transform((v) => (v === '' || v === undefined ? null : v))
        .refine(
            (v) => v === null || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0 && parseFloat(v) <= 100),
            { message: 'Valor entre 0 y 100' }
        ),

    bone_mass_pct: z
        .string()
        .optional()
        .transform((v) => (v === '' || v === undefined ? null : v))
        .refine(
            (v) => v === null || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0 && parseFloat(v) <= 100),
            { message: 'Valor entre 0 y 100' }
    ),

    recommended_kcal: z
        .string()
        .optional()
        .transform((v) => (v === '' || v === undefined ? null : v))
        .refine(
            (v) => v === null || (!isNaN(parseInt(v)) && parseInt(v) >= 500 && parseInt(v) <= 10000),
            { message: 'KCAL entre 500 y 10,000' }
        ),

    bmi: z
        .string()
        .optional()
        .transform((v) => (v === '' || v === undefined ? null : v))
        .refine(
            (v) => v === null || (!isNaN(parseFloat(v)) && parseFloat(v) >= 10 && parseFloat(v) <= 90),
            { message: 'IMC entre 10 y 90' }
    ),

    notes: z.string().max(500, 'Máximo 500 caracteres').optional(),

    measured_at: z.string().optional(),
});

function preparePayload(data, userId) {
    const measuredAt = data.measured_at
        ? new Date(data.measured_at).toISOString()
        : new Date().toISOString();
    
    return {
        user_id: userId,
        weight_kg: parseFloat(data.weight_kg),
        body_fat_pct: data.body_fat_pct != null ? parseFloat(data.body_fat_pct) : null,
        body_water_pct: data.body_water_pct != null ? parseFloat(data.body_water_pct) : null,
        muscle_mass_pct: data.muscle_mass_pct != null ? parseFloat(data.muscle_mass_pct) : null,
        bone_mass_pct: data.bone_mass_pct != null ? parseFloat(data.bone_mass_pct) : null,
        recommended_kcal: data.recommended_kcal != null ? parseInt(data.recommended_kcal) : null,
        bmi: data.bmi != null ? parseFloat(data.bmi) : null,
        notes: data.notes || null,
        measured_at: measuredAt,
    }
}

function MetricField({ control, name, label, placeholder, unit, icon: Icon, description, helpText, step = '0.1', min = '0', max = '100' }) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                        {label}
                        <Badge variant="outline" className="ml-auto text-xs font-normal text-muted-foreground">
                            Opcional
                        </Badge>
                    </FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input {...field} type="number" inputMode="decimal" step={step} min={min} max={max} placeholder={placeholder} className="pr-12 h-12 text-base" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                {unit}
                            </span>
                        </div>
                    </FormControl>
                    {helpText && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 border border-muted">
                            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span>{helpText}</span>
                        </div>
                    )}
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function MeasurementForm({ userId, onSave, onSuccess, onCancel }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showHelpDialog, setShowHelpDialog] = useState(false);

    const todayLocal = format(new Date(), "yyyy-MM-dd'T'HH:mm");

    const form = useForm({
        resolver: zodResolver(measurementSchema),
        defaultValues: {
            weight_kg: '',
            body_fat_pct: '',
            body_water_pct: '',
            muscle_mass_pct: '',
            bone_mass_pct: '',
            recommended_kcal: '',
            bmi: '',
            notes: '',
            measured_at: todayLocal,
        },
    });

    async function onSubmit(data) {
        if (!userId) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se encontró tu sesión. Por favor, iniciá sesión nuevamente.' });
            return;
        }

        setIsLoading(true);
        
        try {
            const payload = preparePayload(data, userId);

            await onSave(payload);

            toast({
                title: '✓ Medición guardada',
                description: `Peso registrado: ${payload.weight_kg} kg — ${format(new Date(payload.measured_at), "d 'de' MMMM, HH:mm", { locale: es })}`,
            });

            form.reset();
            onSuccess?.();

        } catch (error) {
            console.error('Error saving measurement:', error);

            toast({
                variant: 'destructive',
                title: 'Error al guardar',
                description: error?.message || 'Hubo un problema. Intentá de nuevo.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>

                {/* ── SECTION: Help ────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">¿Cómo usar la balanza?</span>
                    </div>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowHelpDialog(true)}
                        className="text-primary hover:bg-primary/10 h-8"
                    >
                        Ver instrucciones
                    </Button>
                </div>

                {/* ── SECTION: Date & Time ──────────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Fecha y hora
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="measured_at"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} type="datetime-local" className="h-12 text-base" />
                                    </FormControl>
                                    <FormDescription>Por defecto: fecha y hora actual</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* ── SECTION: Weight ─────────────────────────────────────────────── */}
                <Card className="border-primary/20 bg-muted/40 ring-1 ring-primary/10">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Peso corporal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="weight_kg"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                                        Peso
                                        <Badge className="ml-auto">Obligatorio</Badge>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input {...field} type="number" inputMode="decimal" step="0.1" min="2" max="500" placeholder="70.5" className="pr-12 h-12 text-base" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                                kg
                                            </span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* ── SECTION: Body Composition ──────────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Composición corporal
                        </CardTitle>
                        <CardDescription>Datos opcionales de la balanza</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <MetricField
                            control={form.control}
                            name="body_fat_pct"
                            label="% Grasa Corporal"
                            placeholder="18.5"
                            unit="%"
                            icon={Flame}
                            step="0.1"
                            helpText="En la balanza aparece con 'FAT' abajo y el símbolo % a la derecha."
                        />
                        
                        <Separator />

                        <MetricField
                            control={form.control}
                            name="body_water_pct"
                            label="% Agua Corporal"
                            placeholder="55.0"
                            unit="%"
                            icon={Droplets}
                            step="0.1"
                            helpText="En la balanza aparece con 'TBW' abajo y el símbolo % a la derecha."
                        />

                        <Separator />

                        <MetricField
                            control={form.control}
                            name="muscle_mass_pct"
                            label="% Masa Muscular"
                            placeholder="40.0"
                            unit="%"
                            icon={Dumbbell}
                            step="0.1"
                            helpText="En la balanza aparece con el dibujo de un hombre musculoso a la izquierda y el símbolo % a la derecha."
                        />

                        <Separator />

                        <MetricField
                            control={form.control}
                            name="bone_mass_pct"
                            label="% Masa Ósea Estimada"
                            placeholder="3.5"
                            unit="%"
                            icon={Bone}
                            step="0.1"
                            helpText="En la balanza aparece con el dibujo de un hueso a la izquierda y el símbolo % a la derecha."
                        />
                    </CardContent>
                </Card>

                {/* ── SECTION: Calculated Indices ──────────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Índices calculados
                        </CardTitle>
                        <CardDescription>Datos opcionales de la balanza</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <MetricField
                            control={form.control}
                            name="recommended_kcal"
                            label="Ingesta Calórica Recomendada"
                            placeholder="1650"
                            unit="kcal"
                            icon={Utensils}
                            step="1"
                            min="500"
                            max="10000"
                            helpText="En la balanza aparece con 'KCAL' abajo."
                        />

                        <Separator />

                        <MetricField
                            control={form.control}
                            name="bmi"
                            label="IMC (Índice de Masa Corporal)"
                            placeholder="22.5"
                            unit="kg/m²"
                            icon={Calculator}
                            step="0.1"
                            min="10"
                            max="90"
                            helpText="En la balanza aparece con 'BMI' abajo."
                        />
                    </CardContent>
                </Card>

                {/* ── SECTION: Notes ────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Notas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Ej: Medido en ayunas, después del entrenamiento..." className="resize-none min-h-[80px] text-base" maxLength={500} />
                                    </FormControl>
                                    <FormDescription className="text-right">
                                        {field.value?.length || 0}/500
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* ── SECTION: Submit Button ──────────────────────────────────────── */}
                <div className="flex flex-col gap-3 sticky bottom-4">
                    <Button type="submit" size="lg" className="h-14 text-base font-semibold w-full shadow-lg" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Scale className="mr-2 h-5 w-5" />
                                Guardar medición
                            </>
                        )}
                    </Button>

                    {onCancel && (
                        <Button type="button" variant="outline" size="lg" className="h-12" onClick={onCancel} disabled={isLoading}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>

            {/* ── HELP DIALOG ────────────────────────────────────────────────────── */}
            <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Scale className="h-5 w-5" />
                            Guía de uso de la balanza
                        </DialogTitle>
                        <DialogDescription>
                            Instrucciones para obtener todas las mediciones correctamente en la balanza digital Philco BAP2021PI
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Modo Simple */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <div className="flex h-6 w-6 rounded-full bg-primary text-white items-center justify-center text-xs font-semibold mt-0.5 flex-shrink-0">
                                    1
                                </div>
                                <div className="space-y-1 flex-1 pt-0.5">
                                    <h4 className="font-semibold text-foreground">Modo Simple (solo peso)</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Si solo necesitas el peso:
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                                        <li>La balanza debe estar apagada inicialmente</li>
                                        <li>Sube a la balanza (con o sin calzado)</li>
                                        <li>La balanza se encenderá automáticamente y calculará tu peso</li>
                                        <li>Cuando la pantalla deje de parpadear, el peso está listo</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Modo Completo */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <div className="flex h-6 w-6 rounded-full bg-primary text-white items-center justify-center text-xs font-semibold mt-0.5 flex-shrink-0">
                                    2
                                </div>
                                <div className="space-y-1 flex-1 pt-0.5">
                                    <h4 className="font-semibold text-foreground">Modo Completo</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Para obtener datos de composición corporal:
                                    </p>
                                    
                                    <div className="space-y-3 ml-4">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Paso 1: Selecciona tu perfil</p>
                                            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc mt-1">
                                                <li>Presiona el botón <span className="font-semibold">SET</span> en la balanza</li>
                                                <li>Verás un número parpadeando en la pantalla en la parte inferior izquierda (representa tu memoria/perfil)</li>
                                                <li>Usa las <span className="font-semibold">flechas de los costados</span> para cambiar entre perfiles</li>
                                                <li>Selecciona el número que corresponde a tu perfil</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-foreground">Paso 2: Calibra la balanza</p>
                                            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc mt-1">
                                                <li>Presiona <span className="font-semibold">SET varias veces</span> hasta que veas <span className="font-semibold">0.0 kg</span></li>
                                                <li><span className="font-semibold">Importante:</span> Debes estar <span className="font-semibold">descalzo</span> para que funcione</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-foreground">Paso 3: Toma las mediciones</p>
                                            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc mt-1">
                                                <li>Sube a la balanza descalzo, asegurándote de que tus pies estén en contacto con las tiras metálicas</li>
                                                <li>La balanza registrará tu peso como primera lectura</li>
                                                <li>Observa la pantalla mientras procesa: verás una animación indicando que está calculando</li>
                                                <li>Los valores irán apareciendo automáticamente, uno por uno</li>
                                                <li><span className="font-semibold">Nota:</span> Una vez que comience a mostrar los demás datos, ya puedes bajarte (no necesitas esperar a que termine)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Orden de valores */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <div className="flex h-6 w-6 rounded-full bg-primary text-white items-center justify-center text-xs font-semibold mt-0.5 flex-shrink-0">
                                    3
                                </div>
                                <div className="space-y-1 flex-1 pt-0.5">
                                    <h4 className="font-semibold text-foreground">Orden de los valores en pantalla</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Los datos aparecen en este orden:
                                    </p>
                                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                                        <div className="text-sm"><span className="font-semibold">1.</span> Peso (kg)</div>
                                        <div className="text-sm"><span className="font-semibold">2.</span> Porcentaje de grasa corporal (FAT %)</div>
                                        <div className="text-sm"><span className="font-semibold">3.</span> Porcentaje de agua corporal (TBW %)</div>
                                        <div className="text-sm"><span className="font-semibold">4.</span> Porcentaje de masa muscular (icono de músculo)</div>
                                        <div className="text-sm"><span className="font-semibold">5.</span> Porcentaje de masa ósea (icono de hueso)</div>
                                        <div className="text-sm"><span className="font-semibold">6.</span> Calorías recomendadas (KCAL)</div>
                                        <div className="text-sm"><span className="font-semibold">7.</span> IMC - Índice de Masa Corporal (BMI)</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Consejos */}
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Consejos para mejores resultados
                            </p>
                            <ul className="text-sm text-amber-900/80 dark:text-amber-100/80 space-y-1 ml-4 list-disc">
                                <li>Mídete siempre a la misma hora del día para consistencia</li>
                                <li>Hazlo antes de comer o después de 2-3 horas de la última comida</li>
                                <li>Evita medir después de entrenamientos intensos</li>
                                <li>Asegúrate de que la balanza esté en una <span className="font-semibold">superficie plana y firme</span></li>
                            </ul>
                        </div>

                        <Separator />

                        {/* Close Button */}
                        <Button 
                            onClick={() => setShowHelpDialog(false)} 
                            className="w-full"
                        >
                            Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Form>
    );
}

export default MeasurementForm;