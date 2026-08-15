import { api } from "@/lib/api/client";

import {
  toAnomaly,
  toSummary,
  toTrendPoint,
  type Anomaly,
  type AnomalyDto,
  type Summary,
  type SummaryDto,
  type TrendPoint,
  type TrendPointDto,
} from "./types";

const BASE = "/dashboard";

export const dashboardApi = {
  async summary(): Promise<Summary> {
    return toSummary(await api.get<SummaryDto>(`${BASE}/summary`));
  },

  async trend(days: number): Promise<TrendPoint[]> {
    const rows = await api.get<TrendPointDto[] | null>(`${BASE}/trend`, {
      params: { days },
    });
    return (rows ?? []).map(toTrendPoint);
  },

  async anomalies(): Promise<Anomaly[]> {
    const rows = await api.get<AnomalyDto[] | null>(`${BASE}/anomalies`);
    return (rows ?? []).map(toAnomaly);
  },
};
