import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


// Migration via with-clause


actor {
  // Persistent Actor State
  var accessControlState = AccessControl.initState();
  var userProfiles = Map.empty<Principal, UserProfile>();
  var members = Map.empty<MemberID, Member>();
  include MixinAuthorization(accessControlState);

  // Actor Types
  type MemberID = Text;

  type Member = {
    id : MemberID;
    membershipNumber : Text;
    name : Text;
    mobileNo : Text;
    address : Text;
    area : Text;
    spouseName : Text;
    alternateMobile : ?Text;
    familyMemberCount : ?Nat;

    priorTo2021 : ?Bool;
    year2022 : ?Bool;
    year2023 : ?Bool;
    year2024 : ?Bool;
    year2025 : ?Bool;
    year2026 : ?Bool;
    year2027 : ?Bool;
    year2028 : ?Bool;
    year2029 : ?Bool;
    year2030 : ?Bool;

    receiptPriorTo2021 : ?Text;
    receipt2022 : ?Text;
    receipt2023 : ?Text;
    receipt2024 : ?Text;
    receipt2025 : ?Text;
    receipt2026 : ?Text;
    receipt2027 : ?Text;
    receipt2028 : ?Text;
    receipt2029 : ?Text;
    receipt2030 : ?Text;
  };

  type BulkMemberInput = {
    membershipNumber : Text;
    name : Text;
    mobileNo : Text;
    address : Text;
    area : Text;
    spouseName : Text;
    alternateMobile : ?Text;
    familyMemberCount : ?Nat;

    priorTo2021 : ?Bool;
    year2022 : ?Bool;
    year2023 : ?Bool;
    year2024 : ?Bool;
    year2025 : ?Bool;
    year2026 : ?Bool;
    year2027 : ?Bool;
    year2028 : ?Bool;
    year2029 : ?Bool;
    year2030 : ?Bool;

    receiptPriorTo2021 : ?Text;
    receipt2022 : ?Text;
    receipt2023 : ?Text;
    receipt2024 : ?Text;
    receipt2025 : ?Text;
    receipt2026 : ?Text;
    receipt2027 : ?Text;
    receipt2028 : ?Text;
    receipt2029 : ?Text;
    receipt2030 : ?Text;
  };

  module Member {
    public func compare(member1 : Member, member2 : Member) : Order.Order {
      Text.compare(member1.id, member2.id);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  // Functions
  func generateUniqueId(caller : Principal) : MemberID {
    let id = caller.toText() # Time.now().toText();
    switch (members.get(id)) {
      case (?_) { Runtime.trap("ID collision detected unexpectedly") };
      case (null) { id };
    };
  };

  public shared ({ caller }) func addMember(
    name : Text,
    mobileNo : Text,
    address : Text,
    area : Text,
    spouseName : Text,
    alternateMobile : ?Text,
    familyMemberCount : ?Nat,
    membershipNumber : Text,
    priorTo2021 : ?Bool,
    year2022 : ?Bool,
    year2023 : ?Bool,
    year2024 : ?Bool,
    year2025 : ?Bool,
    year2026 : ?Bool,
    year2027 : ?Bool,
    year2028 : ?Bool,
    year2029 : ?Bool,
    year2030 : ?Bool,
    receiptPriorTo2021 : ?Text,
    receipt2022 : ?Text,
    receipt2023 : ?Text,
    receipt2024 : ?Text,
    receipt2025 : ?Text,
    receipt2026 : ?Text,
    receipt2027 : ?Text,
    receipt2028 : ?Text,
    receipt2029 : ?Text,
    receipt2030 : ?Text,
  ) : async MemberID {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add members");
    };

    let id = generateUniqueId(caller);
    let member = {
      id;
      name;
      mobileNo;
      address;
      area;
      spouseName;
      alternateMobile;
      familyMemberCount;
      membershipNumber;
      priorTo2021;
      year2022;
      year2023;
      year2024;
      year2025;
      year2026;
      year2027;
      year2028;
      year2029;
      year2030;
      receiptPriorTo2021;
      receipt2022;
      receipt2023;
      receipt2024;
      receipt2025;
      receipt2026;
      receipt2027;
      receipt2028;
      receipt2029;
      receipt2030;
    };
    members.add(id, member);
    id;
  };

  public shared ({ caller }) func bulkAddMembers(membersInput : [BulkMemberInput]) : async Nat {
    // Allow all authenticated users except anonymous principals
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot bulk add members");
    };

    var addedCount = 0;

    for (input in membersInput.values()) {
      let id = input.membershipNumber;
      let member = {
        id;
        name = input.name;
        mobileNo = input.mobileNo;
        address = input.address;
        area = input.area;
        spouseName = input.spouseName;
        alternateMobile = input.alternateMobile;
        familyMemberCount = input.familyMemberCount;
        membershipNumber = input.membershipNumber;
        priorTo2021 = input.priorTo2021;
        year2022 = input.year2022;
        year2023 = input.year2023;
        year2024 = input.year2024;
        year2025 = input.year2025;
        year2026 = input.year2026;
        year2027 = input.year2027;
        year2028 = input.year2028;
        year2029 = input.year2029;
        year2030 = input.year2030;
        receiptPriorTo2021 = input.receiptPriorTo2021;
        receipt2022 = input.receipt2022;
        receipt2023 = input.receipt2023;
        receipt2024 = input.receipt2024;
        receipt2025 = input.receipt2025;
        receipt2026 = input.receipt2026;
        receipt2027 = input.receipt2027;
        receipt2028 = input.receipt2028;
        receipt2029 = input.receipt2029;
        receipt2030 = input.receipt2030;
      };
      members.add(id, member);
      addedCount += 1;
    };

    addedCount;
  };

  public query ({ caller }) func getAllMembers() : async [Member] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view members");
    };
    members.values().toArray().sort();
  };

  public query ({ caller }) func getMember(id : MemberID) : async Member {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view members");
    };
    switch (members.get(id)) {
      case (null) { Runtime.trap("Could not find member for ID " # id) };
      case (?member) { member };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
