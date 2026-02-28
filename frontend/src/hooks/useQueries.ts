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
      priorTo2021,
      year2022,
      year2023,
      year2024,
      year2025,
      year2026,
      year2027,
      year2028,
      year2029,
      year2030,
      receiptPriorTo2021,
      receipt2022,
      receipt2023,
      receipt2024,
      receipt2025,
      receipt2026,
      receipt2027,
      receipt2028,
      receipt2029,
      receipt2030,
    }: {
      name: string;
      mobileNo: string;
      address: string;
      area: string;
      spouseName: string;
      alternateMobile: string | null;
      familyMemberCount: bigint | null;
      membershipNumber: string;
      priorTo2021: boolean | null;
      year2022: boolean | null;
      year2023: boolean | null;
      year2024: boolean | null;
      year2025: boolean | null;
      year2026: boolean | null;
      year2027: boolean | null;
      year2028: boolean | null;
      year2029: boolean | null;
      year2030: boolean | null;
      receiptPriorTo2021: string | null;
      receipt2022: string | null;
      receipt2023: string | null;
      receipt2024: string | null;
      receipt2025: string | null;
      receipt2026: string | null;
      receipt2027: string | null;
      receipt2028: string | null;
      receipt2029: string | null;
      receipt2030: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addMember(
        name,
        mobileNo,
        address,
        area,
        spouseName,
        alternateMobile,
        familyMemberCount,
        membershipNumber,
        priorTo2021,
        year2022,
        year2023,
        year2024,
        year2025,
        year2026,
        year2027,
        year2028,
        year2029,
        year2030,
        receiptPriorTo2021,
        receipt2022,
        receipt2023,
        receipt2024,
        receipt2025,
        receipt2026,
        receipt2027,
        receipt2028,
        receipt2029,
        receipt2030,
      );
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
