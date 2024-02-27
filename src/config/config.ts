export const FREELANCER_ADDRESS = import.meta.env.VITE_FREELANCER_ADDRESS;
export const CLIENT_ADDRESS = import.meta.env.VITE_CLIENT_ADDRESS;
// eas-sdk config
export const EAS_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26
export const SCHEMA_REGISTRY_ADDRESS =
  "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"; // Sepolia
export const SCHEMA = "string personWallet, uint8 valueOfWork, bool recommend, bool discordNewMembers, bool charmverseNewMembers, uint8 newMembersWithWallet, uint8 newMembersWithGitcoinPassport, bool areYouMember";
export const SCHEMA_DETAILS = {
  schemaName: "Greenpill Brasil Impact Report - GreenPill OnBoarding",
  personWallet: "string (multisig wallet of Greenpill Brasil)",
  valueOfWork: "uint8 (value between 1-100)",
  recommend: "bool (yes or no)",
  discordNewMembers:"bool (yes or no)",
  charmverseNewMembers:"bool (yes or no)",
  newMembersWithWallet:"uint8 (value between 1-100)",
  newMembersWithGitcoinPassport: "uint8 (value between 1-100)",
  areYouMember:"bool (yes or no)"
};
