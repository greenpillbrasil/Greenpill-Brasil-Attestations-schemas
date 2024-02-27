import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import React, { useState } from "react";
import { SCHEMA, SCHEMA_DETAILS } from "./config/config";
import { useEAS } from "./hooks/useEAS";
import image from "./assets/logo.png";

type AttestationData = {
  freelancer: string;
  valueOfWork: number;
  recommend: boolean;
  discordNewMembers: boolean;
  newMembersWithWallet: boolean;
  newMembersWithGitcoinPassport: boolean;
  areYouMember: boolean;
};
/** @dev AFTER REGISTERING A SCHEMA, OR MAKING AN ATTESTATION
 * IF YOU REFRESH APP MAKE SURE TO PASTE IN SCHEMA/ATTESTATIONUID IN STATE VARIABLES OR ELSE APP WONT WORK
 * */
const App = () => {
  const { eas, schemaRegistry, currentAddress } = useEAS();
  // schemaUID is set when Freelancer register's their own reputation schema
  const [schemaUID, setSchemaUID] = useState<string>(
    ""
  );
  // attestationUID is set when a client attests to the reputation schema
  const [attestationUID, setAttestationUID] = useState<string>(
    ""
  );
  // attestationData is set by client in the frontend code
  const [attestationData, setAttestationData] = useState<AttestationData>({
    freelancer: "",
    valueOfWork: 0,
    recommend: false,
    newMembersWithWallet: 0,
    discordNewMembers: false,
    charmverseNewMembers: false,
    newMembersWithGitcoinPassport: 0,
    areYouMember: false
  });

  const handleAttestationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;

    setAttestationData({
      ...attestationData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  // Handlers for button clicks (to be implemented)
  // TODO now: continue sdk implementation
  const registerSchema = async () => {
    if (!schemaRegistry) return;
    const transaction = await schemaRegistry.register({
      schema: SCHEMA,
      resolverAddress: undefined,
      revocable: true,
    });
    // schemaRegistry returns uid from event emitted on registration
    const uid = await transaction.wait();
    console.log("Schema UID: ", uid);
    setSchemaUID(uid);
  };

  const createAttestation = async () => {
    // SchemaUID required to make attestations
    if (!eas || !schemaUID) return;
    const schemaEncoder = new SchemaEncoder(SCHEMA);
    const encodedData = schemaEncoder.encodeData([
      { name: "personWallet", value: currentAddress, type: "string" },
      {
        name: "valueOfWork",
        value: attestationData.valueOfWork,
        type: "uint8",
      },
      { name: "recommend", value: attestationData.recommend, type: "bool" },
      { name: "discordNewMembers", value: attestationData.discordNewMembers, type: "bool" },
      { name: "charmverseNewMembers", value: attestationData.charmverseNewMembers, type: "bool" },
      { name: "newMembersWithWallet", value: attestationData.newMembersWithWallet, type: "uint8" },
      { name: "newMembersWithGitcoinPassport", value: attestationData.newMembersWithGitcoinPassport, type: "uint8" },
      { name: "areYouMember", value: attestationData.areYouMember, type: "bool" },
    ]);

    const transaction = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: attestationData.freelancer,
        expirationTime: undefined,
        revocable: true, // Be aware that if your schema is not revocable, this MUST be false
        data: encodedData,
      },
    });

    const newAttestationUID = await transaction.wait();
    setAttestationUID(newAttestationUID);

    console.log("New attestation UID:", newAttestationUID);
    console.log("Creating Attestation:", attestationData);
  };

  const revokeAttestation = async () => {
    if (!eas) return;
    const attestation = await eas.getAttestation(attestationUID);

    const transaction = await eas.revoke({
      schema: attestation.schema,
      data: { uid: attestation.uid },
    });
    const receipt = await transaction.wait();
    console.log("Revoking Attestation:", receipt);
  };

  return (
    
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <img src={image} width="81px" />
      <h1>Greenpill Brasil</h1>
      <h2>Testing Ethereum Attestation Service</h2>
      <h2>Sepolia Network</h2>
      <h2 style={{ textAlign: "center" }}>
        {!schemaUID
          ? "Step 1: Greenpill Brasil registers a schema to community driven reputation standards"
          : "Step 2: People can create attestation to credibility of Greenpill Brasil"}
      </h2>

      {!schemaUID && (
        <>
          <h2>Register Schema</h2>
          <div>
            <strong>Schema Name:</strong> {SCHEMA_DETAILS.schemaName}
          </div>
          <div>
            <strong>Person Wallet:</strong> {SCHEMA_DETAILS.personWallet}
          </div>
          <div>
            <strong>Value of Work:</strong> {SCHEMA_DETAILS.valueOfWork}
          </div>
          <div>
            <strong>Recommend:</strong> {SCHEMA_DETAILS.recommend}
          </div>
          <div>
            <strong>You saw new members on Discord</strong> {SCHEMA_DETAILS.discordNewMembers}
          </div>
          <div>
            <strong>You saw new members on Charmverse</strong> {SCHEMA_DETAILS.charmverseNewMembers}
          </div>
          <div>
            <strong>How many members now have a wallet</strong> {SCHEMA_DETAILS.newMembersWithWallet}
          </div>
          <div>
            <strong>How many members now have a Gitcoin Passport</strong> {SCHEMA_DETAILS.newMembersWithGitcoinPassport}
          </div>
          <div>
            <strong>Are you a member</strong> {SCHEMA_DETAILS.areYouMember}
          </div>
          <button onClick={registerSchema}>Register Schema</button>
        </>
      )}
      {/* <div>
      <h2>Create Attestation</h2>
      <input
        type="text"
        name="freelancer"
        value={attestationData.freelancer}
        onChange={handleAttestationChange}
        placeholder="Wallet of the person"
      />
      <input
        type="text"
        name="valueOfWork"
        value={attestationData.valueOfWork}
        onChange={handleAttestationChange}
        placeholder="Value of work (1-100)"
      />
      <label htmlFor="recommendCheckbox">
        Would you recommend this person?
      </label>
      <input
        type="checkbox"
        id="recommend"
        name="recommend"
        checked={attestationData.recommend}
        onChange={handleAttestationChange}
      />

      
      <button onClick={createAttestation}>Create Attestation</button>

      <h2>Revoke Attestation</h2>
      <button onClick={revokeAttestation}>Revoke Attestation</button>
    </div> */}
    </div>
  );
};

export default App;
