import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Scale, Flame, Dumbbell, Droplets, Bone, Utensils, Calculator, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useMeasurements, useWeightChartData } from '@/hooks/useMeasurements';
import { cn } from '@/lib/utils';

function WeightTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const point = payload[0]?.payload;

    return (
        <div className="rounded-xl border bg-card px-3 py-2 shadow-xl text-sm">
            <p className="text-muted-foreground mb-1">{label}</p>
            <p className="font-bold text-lg text-primary">
                {payload[0]?.value?.toFixed(1)}{' '}
                <span className="text-xs font-normal text-muted-foreground">kg</span>
            </p>
            {point?.isAverage && (
                <p className="text-xs text-muted-foreground mt-0.5">
                    Promedio de {point.count} mediciones
                </p>
            )}
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, unit, colorClass, isEmpty }) {
    return (
        <div className={cn(
            'flex flex-col gap-1 rounded-xl p-3 border bg-card transition-opacity',
            isEmpty && 'opacity-40'
        )}>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label}
            </div>
            <div className={cn('text-xl font-bold tabular-nums', colorClass)}>
                {isEmpty
                    ? <span className="text-sm font-normal text-muted-foreground">—</span>
                    : <>{value} <span className="text-xs font-normal text-muted-foreground">{unit}</span></>
                }
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-44" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
    );
}

export default function DashboardPage() {
    const { user, profile } = useAuth();

    const { measurements, latestMeasurement, isLoading, error, totalCount } = useMeasurements({ targetUserId: user?.id });

    const chartData = useWeightChartData(measurements, 30);

    const { yMin, yMax } = useMemo(() => {
        if (!chartData.length) return { yMin: 50, yMax: 100 };

        const weights = chartData.map((d) => d.weight);
        const min = Math.min(...weights);
        const max = Math.max(...weights);
        const pad = Math.max((max - min) * 0.2, 2);
        
        return { yMin: Math.floor(min - pad), yMax: Math.ceil(max + pad) };
    }, [chartData]);

    const weightDelta = useMemo(() => {
        if (chartData.length < 2) return null;
        return chartData[chartData.length - 1].weight - chartData[0].weight;
    }, [chartData]);

    if (isLoading) return <DashboardSkeleton />;

    return (
        <div className="space-y-5">

            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Hola, {profile?.full_name ?? 'usuario'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {totalCount === 0
                            ? 'Todavía no tenés mediciones'
                            : `${totalCount} medición${totalCount !== 1 ? 'es' : ''} registrada${totalCount !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>
                <Button asChild size="sm" className="gap-1.5 rounded-xl">
                    <Link to="/nueva-medicion">
                        <Plus className="h-4 w-4" /> Nuevo
                    </Link>
                </Button>
            </div>

            {/* ── Error ───────────────────────────────────────────── */}
            {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* ── No data ───────────────────────────── */}
            {!error && totalCount === 0 && (
                <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
                    <Scale className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="font-medium">Sin registros todavía</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Registrá tu primera medición para ver la evolución
                    </p>
                    <Button asChild variant="outline">
                        <Link to="/nueva-medicion">Registrar ahora</Link>
                    </Button>
                </Card>
            )}

            {/* ── Weight Chart ──────────────────────────────────────── */}
            {chartData.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-base">Evolución del peso</CardTitle>
                                <CardDescription>Últimos {chartData.length} registros</CardDescription>
                            </div>
                            {weightDelta !== null && (
                                <Badge
                                    className={cn(
                                        'text-sm font-semibold tabular-nums',
                                        weightDelta <= 0
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15'
                                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15'
                                    )}
                                >
                                    {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2 pr-2">
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="hsl(var(--border))"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    domain={[yMin, yMax]}
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={36}
                                />
                                
                                <Tooltip content={<WeightTooltip />} />
                                
                                {latestMeasurement && (
                                    <ReferenceLine
                                        y={latestMeasurement.weight_kg}
                                        stroke="hsl(var(--primary))"
                                        strokeDasharray="4 3"
                                        strokeOpacity={0.35}
                                    />
                                )}

                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2.5}
                                    dot={{ r: 3, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* ── Latest Measurement ──────────────────────────────────────── */}
            {latestMeasurement && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Último registro</CardTitle>
                                <CardDescription>
                                    <time dateTime={latestMeasurement.measured_at}>
                                        {format(new Date(latestMeasurement.measured_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                                    </time>
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
                                <Link to="/historial">
                                    Ver más <ChevronRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Main weight display */}
                        <div className="text-center py-5 rounded-xl bg-primary/8 border border-primary/20">
                            <div className="text-5xl font-black tabular-nums text-primary leading-none">
                                {latestMeasurement.weight_kg.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-2 font-medium">kilogramos</div>
                        </div>

                        {/* Metrics grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <MetricCard
                                icon={Flame}
                                label="Grasa Corporal"
                                value={latestMeasurement.body_fat_pct?.toFixed(1)}
                                unit="%"
                                colorClass="text-orange-500 dark:text-orange-400"
                                isEmpty={latestMeasurement.body_fat_pct == null}
                            />
                            <MetricCard
                                icon={Droplets}
                                label="Agua Corporal"
                                value={latestMeasurement.body_water_pct?.toFixed(1)}
                                unit="%"
                                colorClass="text-sky-500 dark:text-sky-400"
                                isEmpty={latestMeasurement.body_water_pct == null}
                            />
                            <MetricCard
                                icon={Dumbbell}
                                label="Masa Muscular"
                                value={latestMeasurement.muscle_mass_pct?.toFixed(1)}
                                unit="%"
                                colorClass="text-blue-500 dark:text-blue-400"
                                isEmpty={latestMeasurement.muscle_mass_pct == null}
                            />
                            <MetricCard
                                icon={Bone}
                                label="Masa Ósea"
                                value={latestMeasurement.bone_mass_pct?.toFixed(1)}
                                unit="%"
                                colorClass="text-stone-500 dark:text-stone-400"
                                isEmpty={latestMeasurement.bone_mass_pct == null}
                            />
                            <MetricCard
                                icon={Utensils}
                                label="Ingesta Calórica"
                                value={latestMeasurement.recommended_kcal}
                                unit="kcal"
                                colorClass="text-emerald-500 dark:text-emerald-400"
                                isEmpty={latestMeasurement.recommended_kcal == null}
                            />
                            <MetricCard
                                icon={Calculator}
                                label="IMC"
                                value={latestMeasurement.bmi?.toFixed(1)}
                                unit="kg/m²"
                                colorClass="text-violet-500 dark:text-violet-400"
                                isEmpty={latestMeasurement.bmi == null}
                            />
                        </div>

                        {/* Notes */}
                        {latestMeasurement.notes && (
                            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground italic">
                                "{latestMeasurement.notes}"
                            </div>
                        )}

                    </CardContent>
                </Card>
            )}
        
        </div>
    );
}