import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type MemberID = string;
export interface Member {
    id: MemberID;
    membershipNumber: string;
    receipt2022?: string;
    receipt2023?: string;
    receipt2024?: string;
    receipt2025?: string;
    receipt2026?: string;
    receipt2027?: string;
    receipt2028?: string;
    receipt2029?: string;
    receipt2030?: string;
    receiptPriorTo2021?: string;
    area: string;
    name: string;
    mobileNo: string;
    alternateMobile?: string;
    priorTo2021?: boolean;
    address: string;
    familyMemberCount?: bigint;
    spouseName: string;
    year2022?: boolean;
    year2023?: boolean;
    year2024?: boolean;
    year2025?: boolean;
    year2026?: boolean;
    year2027?: boolean;
    year2028?: boolean;
    year2029?: boolean;
    year2030?: boolean;
}
export interface BulkMemberInput {
    membershipNumber: string;
    receipt2022?: string;
    receipt2023?: string;
    receipt2024?: string;
    receipt2025?: string;
    receipt2026?: string;
    receipt2027?: string;
    receipt2028?: string;
    receipt2029?: string;
    receipt2030?: string;
    receiptPriorTo2021?: string;
    area: string;
    name: string;
    mobileNo: string;
    alternateMobile?: string;
    priorTo2021?: boolean;
    address: string;
    familyMemberCount?: bigint;
    spouseName: string;
    year2022?: boolean;
    year2023?: boolean;
    year2024?: boolean;
    year2025?: boolean;
    year2026?: boolean;
    year2027?: boolean;
    year2028?: boolean;
    year2029?: boolean;
    year2030?: boolean;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMember(name: string, mobileNo: string, address: string, area: string, spouseName: string, alternateMobile: string | null, familyMemberCount: bigint | null, membershipNumber: string, priorTo2021: boolean | null, year2022: boolean | null, year2023: boolean | null, year2024: boolean | null, year2025: boolean | null, year2026: boolean | null, year2027: boolean | null, year2028: boolean | null, year2029: boolean | null, year2030: boolean | null, receiptPriorTo2021: string | null, receipt2022: string | null, receipt2023: string | null, receipt2024: string | null, receipt2025: string | null, receipt2026: string | null, receipt2027: string | null, receipt2028: string | null, receipt2029: string | null, receipt2030: string | null): Promise<MemberID>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkAddMembers(membersInput: Array<BulkMemberInput>): Promise<bigint>;
    getAllMembers(): Promise<Array<Member>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMember(id: MemberID): Promise<Member>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
