export interface FormValues {
  name: string;
  description: string;
  external_url: string;
  licenseType: string;
  commercialUse: "Yes" | "No";
  derivatives: "Allowed" | "Not Allowed" | "Share-Alike";
  attribution: "Required" | "Not Required";
  geographicScope: string;
  aiPolicy: "Allowed" | "Not Allowed" | "Training Only";
  royalty: number;
}

export const DEFAULT_VALUES: FormValues = {
  name: "", description: "", external_url: "",
  licenseType: "CC BY-SA", commercialUse: "Yes", derivatives: "Share-Alike",
  attribution: "Required", geographicScope: "Worldwide", aiPolicy: "Allowed", royalty: 0,
};
