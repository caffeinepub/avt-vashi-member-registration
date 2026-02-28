import { Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MemberCard from './MemberCard';
import { useGetAllMembers } from '@/hooks/useQueries';

export default function MemberList() {
  const { data: members, isLoading, isError, refetch, isFetching } = useGetAllMembers();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-1/3" />
              <div className="h-px bg-border" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/3 rounded-full" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <RefreshCw className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">Failed to load members</h3>
        <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching the member list.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-1">No members yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Start by registering your first member using the Register Member page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{members.length}</span> member{members.length !== 1 ? 's' : ''}
        </p>
        {isFetching && (
          <span className="text-xs text-muted-foreground animate-pulse">Refreshing…</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
