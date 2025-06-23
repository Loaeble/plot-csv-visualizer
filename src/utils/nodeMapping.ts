
import { NodeTitleMap } from '@/types/plot';

export const NODE_TITLE_MAP: NodeTitleMap = {
  8000001: "Engine Mount Front Top LH",
  8000002: "Engine Mount Front Top RH", 
  8000003: "Engine Mount Front Bottom LH",
  8000004: "Engine Mount Front Bottom RH",
  8000005: "Engine Mount Rear Top LH",
  8000006: "Engine Mount Rear Top RH",
  8000007: "Engine Mount Rear Bottom LH", 
  8000008: "Engine Mount Rear Bottom RH",
  8000013: "Swingarn bracket LH Top",
  8000014: "Swingarn bracket RH Top",
  8000015: "Swingarn bracket LH Bottom",
  8000016: "Swingarn bracket RH Bottom",
};

export const MAGNIFICATION_OPTIONS = [
  { value: 10000, label: "[d]={/*2}" },
  { value: 1000, label: "n/*2" },
  { value: 10, label: "cn/*2" },
  { value: 1, label: "in/*2" }
];
