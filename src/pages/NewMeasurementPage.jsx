import { useNavigate } from 'react-router-dom';
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
        <MeasurementForm
            userId={user?.id}
            onSave={addMeasurement}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
        />
    );
}