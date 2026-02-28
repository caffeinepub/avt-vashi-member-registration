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
    area: string;
    name: string;
    mobileNo: string;
    alternateMobile?: string;
    address: string;
    familyMemberCount?: bigint;
    spouseName: string;
}
export interface BulkMemberInput {
    membershipNumber: string;
    area: string;
    name: string;
    mobileNo: string;
    alternateMobile?: string;
    address: string;
    familyMemberCount?: bigint;
    spouseName: string;
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
    addMember(name: string, mobileNo: string, address: string, area: string, spouseName: string, alternateMobile: string | null, familyMemberCount: bigint | null, membershipNumber: string): Promise<MemberID>;
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
