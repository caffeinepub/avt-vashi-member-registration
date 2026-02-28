import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Member, BulkMemberInput } from '../backend';

export function useGetAllMembers() {
  const { actor, isFetching } = useActor();

  return useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      mobileNo,
      address,
      area,
      spouseName,
      alternateMobile,
      familyMemberCount,
      membershipNumber,
    }: {
      name: string;
      mobileNo: string;
      address: string;
      area: string;
      spouseName: string;
      alternateMobile: string | null;
      familyMemberCount: bigint | null;
      membershipNumber: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addMember(name, mobileNo, address, area, spouseName, alternateMobile, familyMemberCount, membershipNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useBulkAddMembers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (membersInput: BulkMemberInput[]) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.bulkAddMembers(membersInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
