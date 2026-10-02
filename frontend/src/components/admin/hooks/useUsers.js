import { useUsersQuery } from '@/src/components/admin/_queries/useUserRegistryQueries';

/**
 * Thin facade over useUsersQuery — keeps the { users, isLoading, error,
 * refetch } shape UsersView already consumes, so that component needed no
 * changes for the read side of this migration.
 */
export function useUsers() {
    const { data: users = [], isLoading, error, refetch } = useUsersQuery();

    return {
        users,
        isLoading,
        error: error ? (error.message || 'Failed to fetch users') : null,
        refetch,
    };
}
