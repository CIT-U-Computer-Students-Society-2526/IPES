import { useLocation } from 'react-router-dom';

export const useMemberRoutes = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return {
        evaluationsList: isAdmin ? '/admin/my-evaluations' : '/member/evaluations',
        evaluationForm: (id: string | number) => isAdmin ? `/admin/evaluations/${id}` : `/member/evaluations/${id}`,
        dashboard: isAdmin ? '/admin/my-dashboard' : '/member/dashboard',
        results: isAdmin ? '/admin/my-results' : '/member/results',
        accomplishments: isAdmin ? '/admin/my-accomplishments' : '/member/accomplishments'
    };
};
