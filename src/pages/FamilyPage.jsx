import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, Scale, Flame, Dumbbell, Droplets, Bone, Utensils, Calculator, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function MiniMetric({ icon: Icon, label, value, unit, colorClass }) {
    if (value == null) return null;

    return (
        <div className="flex items-center gap-2 text-sm">
            <Icon className={cn('h-3.5 w-3.5', colorClass)} />
            <span className="text-muted-foreground text-xs">{label}:</span>
            <span className="font-semibold tabular-nums">
                {value}
                {unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
            </span>
        </div>
    );
}

function FamilyMemberCard({ member, isCurrentUser, className }) {
    const initials = member?.full_name
        ? member.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    const hasMetrics = [
        member.body_fat_pct,
        member.body_water_pct,
        member.muscle_mass_pct,
        member.bone_mass_pct,
        member.recommended_kcal,
        member.bmi,
    ].some(v => v != null);

    return (
        <Card className={cn(
            'overflow-hidden',
            isCurrentUser && 'border-primary/20 bg-muted/40 ring-1 ring-primary/10',
            className
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 shrink-0">
                        <AvatarFallback className="text-base font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base truncate">
                                {member.full_name || 'Usuario'}
                            </CardTitle>
                            {isCurrentUser && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                    Vos
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <time dateTime={member.measured_at}>
                                {format(new Date(member.measured_at), "d MMM, HH:mm", { locale: es })}
                            </time>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Main Weight Display */}
                <div className="flex items-baseline gap-2 justify-center py-3 rounded-lg bg-muted/90">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <span className="text-3xl font-bold tabular-nums">
                        {member.weight_kg.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">kg</span>
                </div>

                {/* Optional Metrics */}
                {hasMetrics && (
                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                        <MiniMetric
                            icon={Flame} label="Grasa"
                            value={member.body_fat_pct?.toFixed(1)} unit="%"
                            colorClass="text-orange-500"
                        />
                        <MiniMetric
                            icon={Droplets} label="Agua"
                            value={member.body_water_pct?.toFixed(1)} unit="%"
                            colorClass="text-sky-500"
                        />
                        <MiniMetric
                            icon={Dumbbell} label="Músculo"
                            value={member.muscle_mass_pct?.toFixed(1)} unit="%"
                            colorClass="text-blue-500"
                        />
                        <MiniMetric
                            icon={Bone} label="Masa Ósea"
                            value={member.bone_mass_pct?.toFixed(1)} unit="%"
                            colorClass="text-stone-500"
                        />
                        <MiniMetric
                            icon={Utensils} label="Calorías"
                            value={member.recommended_kcal} unit="kcal"
                            colorClass="text-emerald-500"
                        />
                        <MiniMetric
                            icon={Calculator} label="IMC"
                            value={member.bmi?.toFixed(1)} unit="kg/m²"
                            colorClass="text-violet-500"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function FamilySkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
        </div>
    );
}

export default function FamilyPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchFamilyData() {
            setIsLoading(true);
            setError(null);

            try {
                const { data, error: fetchError } = await supabase
                    .from('latest_measurements')
                    .select('*')
                    .eq('is_public', true)
                    .order('full_name', { ascending: true });

                if (fetchError) throw fetchError;

                setMembers(data || []);
            } catch (err) {
                console.error('[FamilyPage] error:', err);
                setError(err?.message || 'Error al cargar los datos familiares');
            } finally {
                setIsLoading(false);
            }
        }

        fetchFamilyData();
    }, []);

    if (isLoading) return <FamilySkeleton />;

    return (
        <div className="space-y-4">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Dashboard familiar</h2>
                    <p className="text-sm text-muted-foreground">
                        Últimos registros de perfiles públicos
                    </p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* ── Error ───────────────────────────────────────────── */}
            {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* ── No public profiles ─────────────────────────────────────── */}
            {!error && members.length === 0 && (
                <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
                    <EyeOff className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="font-medium">No hay perfiles públicos todavía</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                        Los miembros de tu familia deben activar "Perfil público" en su
                        configuración para aparecer acá.
                    </p>
                </Card>
            )}

            {/* ── Family Member Cards ─────────────────────────────────────── */}
            {members.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((member, index) => (
                        <FamilyMemberCard
                            key={member.user_id}
                            member={member}
                            isCurrentUser={member.user_id === user?.id}
                            className={members.length % 2 !== 0 && index === members.length - 1 ? 'md:col-span-2' : undefined}
                        />
                    ))}
                </div>
            )}

            {/* ── Privacy Note ─────────────────────────────────────────────── */}
            {members.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex gap-3 text-sm">
                            <Eye className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-medium text-primary">
                                    Solo se muestran perfiles públicos
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    Cada miembro controla su privacidad desde "Mi perfil" en el menú superior.
                                    Los perfiles privados solo pueden ver sus propios datos.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}