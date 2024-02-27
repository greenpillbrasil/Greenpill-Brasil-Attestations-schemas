import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import React, { useState } from "react";
import { SCHEMA, SCHEMA_DETAILS } from "./config/config";
import { useEAS } from "./hooks/useEAS";
import image from "./assets/logo.png";

type AttestationData = {
  freelancer: string;
  valueOfWork: number;
  recommend: boolean;
};
/** @dev AFTER REGISTERING A SCHEMA, OR MAKING AN ATTESTATION
 * IF YOU REFRESH APP MAKE SURE TO PASTE IN SCHEMA/ATTESTATIONUID IN STATE VARIABLES OR ELSE APP WONT WORK
 * */
const App = () => {
  const { eas, schemaRegistry, currentAddress } = useEAS();
  // schemaUID is set when Freelancer register's their own reputation schema
  const [schemaUID, setSchemaUID] = useState<string>(
    "0xdcbcf37868242c38aa4e0617f6ba19d7f51054adb1e3b4fb0c1b038c58946e09"
  );
  // attestationUID is set when a client attests to the reputation schema
  const [attestationUID, setAttestationUID] = useState<string>(
    "0x8f7903475b67f0d342e93a9d9f6de9364fd117d708442a5ed3977c52758b7b19"
  );
  // attestationData is set by client in the frontend code
  const [attestationData, setAttestationData] = useState<AttestationData>({
    freelancer: "",
    valueOfWork: 0,
    recommend: false,
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
      { name: "personName", value: currentAddress, type: "string" },
      {
        name: "valueOfWork",
        value: attestationData.valueOfWork,
        type: "uint8",
      },
      { name: "recommend", value: attestationData.recommend, type: "bool" },
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
          ? "Step 1: Greenpill Brasil registers a schema for their own reputation"
          : "Step 2: Person creates attestation for credibility of Greenpill Brasil"}
      </h2>

      {!schemaUID && (
        <>
          <h2>Register Schema</h2>
          <div>
            <strong>Schema Name:</strong> {SCHEMA_DETAILS.schemaName}
          </div>
          <div>
            <strong>Person Name:</strong> {SCHEMA_DETAILS.personName}
          </div>
          <div>
            <strong>Value of Work:</strong> {SCHEMA_DETAILS.valueOfWork}
          </div>
          <div>
            <strong>Recommend:</strong> {SCHEMA_DETAILS.recommend}
          </div>
          <button onClick={registerSchema}>Register Schema</button>
        </>
      )}
      <div>
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
        Would you recommend this freelancer?
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
    </div>
    </div>
  );
};

export default App;
