// ================================================================
// Activity levels for physical activity (scale configuration)
// ================================================================

export const ACTIVITY_LEVELS = {
    1: {
        code: 'AC-1',
        label: 'Sedentario',
        description: 'Poco o ningún ejercicio, trabajo de escritorio',
        example: 'Oficina, sin actividad regular',
    },
    2: {
        code: 'AC-2',
        label: 'Ligeramente activo',
        description: 'Ejercicio ligero 1-3 días por semana',
        example: 'Caminatas ocasionales, tareas domésticas',
    },
    3: {
        code: 'AC-3',
        label: 'Moderadamente activo',
        description: 'Ejercicio moderado 3-5 días por semana',
        example: 'Gimnasio regular, deportes recreativos',
    },
    4: {
        code: 'AC-4',
        label: 'Muy activo',
        description: 'Ejercicio intenso 6-7 días por semana',
        example: 'Entrenamiento diario, deportista amateur',
    },
    5: {
        code: 'AC-5',
        label: 'Extremadamente activo',
        description: 'Ejercicio muy intenso + trabajo físico demandante',
        example: 'Construcción, deportes de alto rendimiento',
    },
    6: {
        code: 'AC-6',
        label: 'Atleta profesional',
        description: 'Entrenamiento profesional intensivo diario',
        example: 'Deportista de élite, preparación competitiva',
    },
}

// Array options for select inputs, with label and description
export const ACTIVITY_LEVEL_OPTIONS = Object.entries(ACTIVITY_LEVELS).map(
    ([value, data]) => ({
        value: value.toString(),
        label: `${data.code}: ${data.label}`,
        description: data.description,
    })
);