import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MeasurementForm from '@/components/measurements/MeasurementForm';

export default function NewMeasurementPage() {
    const { user } = useAuth();
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
            onSuccess={handleSuccess}
            onCancel={handleCancel}
        />
    );
}