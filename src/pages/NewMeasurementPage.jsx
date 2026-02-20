import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMeasurements } from '@/hooks/useMeasurements';
import MeasurementForm from '@/components/measurements/MeasurementForm';

export default function NewMeasurementPage() {
    const { user } = useAuth();
    const { addMeasurement } = useMeasurements({ targetUserId: user?.id, autoFetch: false });
    const navigate = useNavigate();

    function handleSuccess() {
        navigate('/', { replace: true });
    }

    function handleCancel() {
        navigate(-1);
    }

    return (
        <div className="space-y-4">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Carga tus datos</h2>
                    <p className="text-sm text-muted-foreground">
                        Registra los datos de tu balanza
                    </p>
                </div>
                <PlusCircle className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* ── Form ──────────────────────────────────────────── */}
            <MeasurementForm
                userId={user?.id}
                onSave={addMeasurement}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}