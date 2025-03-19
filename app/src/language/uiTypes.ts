export type ActionInfo = { type: "replaceWith"; value: string };
export type ExtraInfo =
  | {
      infoType: "var hover";
      varInfo: MetaInfo;
      type: string;
    }
  | ({
      infoType: "error";
      errorText: string;
      actionInfo?: ActionInfo;
    } & Meta)
  | VarDefined
  | Required
  | LogInfo;
export type VarDefined = {
  infoType: "var defined";
  varType: string;
  varName: string;
} & Meta;
export type ReturnMethod = "return" | "break" | "continue" | "value";
export type Required = {
  infoType: "required";
  requirement: string;
  returnMethod: ReturnMethod;
} & Meta;
export type LogInfoValue = {
  value: string;
  logType: "error" | "output";
};
export type LogInfo = {
  infoType: "log";
  outPromise: Promise<LogInfoValue>;
  counterHolder: { counter: number };
} & Meta;
export type MetaInfo = { start: number; end: number };
export type Meta = { meta: MetaInfo };
