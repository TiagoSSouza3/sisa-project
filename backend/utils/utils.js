exports.resolveUserRole = (occupationId) => {
    if (occupationId === 1) return 'administrador';
    if (occupationId === 3) return 'professor';
    if (occupationId === 2) return 'colaborador';
    return 'colaborador';
};