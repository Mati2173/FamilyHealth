import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Scale, Flame, Dumbbell, Droplets, Bone, Utensils, Calculator, Trash2, Calendar, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMeasurements } from '@/hooks/useMeasurements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

function MiniMetric({ icon: Icon, label, value, unit }) {
    if (value == null) return null;
    
    return (
        <div className="flex items-center gap-2 text-sm">
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-semibold tabular-nums">
                {value}{unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
            </span>
        </div>
    );
}

function MeasurementCard({ measurement, onDelete }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { toast } = useToast();

    const hasMetrics = [
        measurement.body_fat_pct,
        measurement.body_water_pct,
        measurement.muscle_mass_pct,
        measurement.bone_mass_pct,
        measurement.recommended_kcal,
        measurement.bmi,
    ].some((v) => v != null);

    async function handleDelete() {
        try {
            await onDelete(measurement.id);

            toast({
                title: 'Medición eliminada',
                description: 'El registro fue eliminado correctamente.',
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error al eliminar',
                description: error?.message || 'No se pudo eliminar la medición.',
            });
        } finally {
            setDeleteDialogOpen(false);
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <time dateTime={measurement.measured_at} className="capitalize">
                                    {format(new Date(measurement.measured_at), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                </time>
                                <span className="text-muted-foreground/50">·</span>
                                <span>{format(new Date(measurement.measured_at), 'HH:mm')} hs</span>
                            </div>
                            <CardTitle className="text-3xl tabular-nums">
                                {measurement.weight_kg.toFixed(1)}{' '}
                                <span className="text-base font-normal text-muted-foreground">kg</span>
                            </CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteDialogOpen(true)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                {/* Optional metrics — only if there's at least one */}
                {(hasMetrics || measurement.notes) && (
                    <CardContent className="pt-0 space-y-3">
                        {hasMetrics && (
                            <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted/40 p-3">
                                <MiniMetric
                                    icon={Flame}
                                    label="Grasa Corporal"
                                    value={measurement.body_fat_pct?.toFixed(1)}
                                    unit="%"
                                />
                                <MiniMetric
                                    icon={Droplets}
                                    label="Agua Corporal"
                                    value={measurement.body_water_pct?.toFixed(1)}
                                    unit="%"
                                />
                                <MiniMetric
                                    icon={Dumbbell}
                                    label="Masa Muscular"
                                    value={measurement.muscle_mass_pct?.toFixed(1)}
                                    unit="%"
                                />
                                <MiniMetric
                                    icon={Bone}
                                    label="Masa Ósea"
                                    value={measurement.bone_mass_pct?.toFixed(1)}
                                    unit="%"
                                />
                                <MiniMetric
                                    icon={Utensils}
                                    label="Ingesta Calórica"
                                    value={measurement.recommended_kcal}
                                    unit="kcal"
                                />
                                <MiniMetric
                                    icon={Calculator} label="IMC"
                                    value={measurement.bmi?.toFixed(1)}
                                    unit="kg/m²"
                                />
                            </div>
                        )}

                        {measurement.notes && (
                            <>
                                {hasMetrics && <Separator />}
                                <p className="text-sm text-muted-foreground italic">
                                    "{measurement.notes}"
                                </p>
                            </>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Confirmation dialog for deletion */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta medición?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El registro del día{' '}
                            <span className="font-medium">
                                {format(new Date(measurement.measured_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                            </span>{' '}
                            será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function HistorySkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-44" />
                </div>
                <Skeleton className="h-5 w-5 rounded" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}

export default function HistoryPage() {
    const { user } = useAuth();

    const {
        measurements,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        totalCount,
        fetchMore,
        deleteMeasurement,
    } = useMeasurements({ targetUserId: user?.id, limit: 10 });

    if (isLoading) return <HistorySkeleton />;

    return (
        <div className="space-y-4">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Historial completo</h2>
                    <p className="text-sm text-muted-foreground">
                        {totalCount} medición{totalCount !== 1 ? 'es' : ''} registrada{totalCount !== 1 ? 's' : ''}
                    </p>
                </div>
                <History className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* ── Error ───────────────────────────────────────────── */}
            {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* ── No data ───────────────────────────────────────── */}
            {!error && measurements.length === 0 && (
                <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
                    <Scale className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="font-medium">Sin registros todavía</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tus mediciones aparecerán acá
                    </p>
                </Card>
            )}

            {/* ── Measurements list ──────────────────────────────────── */}
            {measurements.length > 0 && (
                <div className="space-y-3">
                    {measurements.map((m) => (
                        <MeasurementCard
                            key={m.id}
                            measurement={m}
                            onDelete={deleteMeasurement}
                        />
                    ))}
                </div>
            )}

            {/* ── Load more button ──────────────────────────────────────── */}
            {hasMore && (
                <Button variant="outline" className="w-full" onClick={fetchMore} disabled={isLoadingMore}>
                    {isLoadingMore ? 'Cargando...' : `Cargar más (${totalCount - measurements.length} restantes)`}
                </Button>
            )}
        </div>
    );
}