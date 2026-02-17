import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Default number of measurements to fetch per page
const PAGE_SIZE = 20;

/**
 * Hook to manage user measurements with pagination support
 * Fetches, adds, and deletes measurements from Supabase
 */
export function useMeasurements({ targetUserId, limit = PAGE_SIZE, autoFetch = true } = {}) {
    const [measurements, setMeasurements] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);

    const hasMore = measurements.length < totalCount;
    const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

    // Fetch measurements from Supabase with optional pagination
    const fetchMeasurements = useCallback(async ({ reset = true } = {}) => {
        if (!targetUserId) return;

        reset ? setIsLoading(true) : setIsLoadingMore(true);
        setError(null);
        
        try {
            // Calculate pagination range
            const currentPage = reset ? 0 : page;
            const from = currentPage * limit;
            const to = from + limit - 1;

            // Fetch measurements ordered by date (newest first)
            const { data, error: fetchError, count } = await supabase
                .from('measurements')
                .select('*', { count: 'exact' })
                .eq('user_id', targetUserId)
                .order('measured_at', { ascending: false })
                .range(from, to);

            if (fetchError) throw fetchError;

            setTotalCount(count ?? 0);

            // Reset or append based on reset flag
            if (reset) {
                setMeasurements(data ?? []);
                setPage(1);
            } else {
                setMeasurements((prev) => [...prev, ...(data ?? [])]);
                setPage((prev) => prev + 1);
            }
        } catch (err) {
            console.error('[useMeasurements]', err);
            setError(err?.message || 'Error al cargar las mediciones');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [targetUserId, limit, page]);

    // Add a new measurement and update state
    const addMeasurement = useCallback(async (payload) => {
        const { data, error } = await supabase
            .from('measurements')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;

        // Add to top of array (newest first)
        setMeasurements((prev) => [data, ...prev]);
        setTotalCount((prev) => prev + 1);
        
        return data;
    }, []);

    // Delete a measurement and update state
    const deleteMeasurement = useCallback(async (measurementId) => {
        const { error } = await supabase
            .from('measurements')
            .delete()
            .eq('id', measurementId);

        if (error) throw error;

        // Remove from measurements
        setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
        setTotalCount((prev) => Math.max(prev - 1, 0));
    }, []);

    // Auto-fetch when userId changes
    useEffect(() => {
        if (autoFetch && targetUserId) {
            fetchMeasurements({ reset: true });
        }
    }, [targetUserId, autoFetch, fetchMeasurements]);

    return {
        measurements,
        latestMeasurement,
        totalCount,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        refetch: () => fetchMeasurements({ reset: true }),
        fetchMore: () => fetchMeasurements({ reset: false }),
        addMeasurement,
        deleteMeasurement,
    }
}

/**
 * Transform measurements into chart-formatted data
 * Limits to maxPoints and orders chronologically for display
 */
export function useWeightChartData(measurements, maxPoints = 30) {
    if (!measurements?.length) return [];

    // Format measurements for chart: limit, reverse to oldest-first, extract needed fields
    return [...measurements]
        .slice(0, maxPoints)
        .reverse()
        .map((m) => ({
            date: m.measured_at,
            weight: m.weight_kg,
            label: new Intl.DateTimeFormat('es-AR', {
                day: '2-digit', month: 'short',
            }).format(new Date(m.measured_at)),
        }));
}