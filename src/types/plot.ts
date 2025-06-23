
export interface PlotData {
  frequency: number;
  [key: string]: number;
}

export interface NodeTitleMap {
  [nodeId: number]: string;
}

export interface PPTExportOptions {
  startNode: number;
  endNode: number;
  magnificationFactor: number;
  unitLabel: string;
  templatePath?: string;
}

export interface RMSData {
  "DNS_1_100": number;
  "DNS_100_150": number;
  "DNS_150_300": number;
}
