import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    
    const pageRef = useRef(0);

    const hasMore = measurements.length < totalCount;
    const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

    // Fetch measurements from Supabase with optional pagination
    const fetchMeasurements = useCallback(async ({ reset = true } = {}) => {
        if (!targetUserId) return;

        reset ? setIsLoading(true) : setIsLoadingMore(true);
        setError(null);
        
        try {
            // Calculate pagination range
            const currentPage = reset ? 0 : pageRef.current;
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
                pageRef.current = 1;
            } else {
                setMeasurements((prev) => [...prev, ...(data ?? [])]);
                pageRef.current = currentPage + 1;
            }
        } catch (err) {
            console.error('[useMeasurements]', err);
            setError(err?.message || 'Error al cargar las mediciones');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [targetUserId, limit]);

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
            pageRef.current = 0;
            fetchMeasurements({ reset: true });
        }
    }, [targetUserId, autoFetch]);

    return {
        measurements,
        latestMeasurement,
        totalCount,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        refetch: () => { pageRef.current = 0; fetchMeasurements({ reset: true }) },
        fetchMore: () => fetchMeasurements({ reset: false }),
        addMeasurement,
        deleteMeasurement,
    }
}

/**
 * Transform measurements into chart-formatted data
 * Limits to a specified number of recent days and averages multiple entries per day
 */
export function useWeightChartData(measurements, maxDays = 30) {
    if (!measurements?.length) return [];

    // Group measurements by day (using local date string as key)
    const byDay = new Map();

    // Iterate in reverse to maintain chronological order when grouping
    [...measurements].reverse().forEach((m) => {
        const dateObj = new Date(m.measured_at);

        const dayKey = format(dateObj, "yyyy-MM-dd");
        
        if (!byDay.has(dayKey)) {
            byDay.set(dayKey, { weights: [], date: dateObj });
        }
        
        byDay.get(dayKey).weights.push(m.weight_kg);
    });

    // Transform grouped data into chart format, limiting to maxDays
    return [...byDay.entries()]
        .slice(-maxDays)
        .map(([dayKey, { weights, date }]) => ({
            date,
            weight: Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10,
            label: format(date, "dd MMM", { locale: es }),
            isAverage: weights.length > 1,
            count: weights.length,
    }));
}
