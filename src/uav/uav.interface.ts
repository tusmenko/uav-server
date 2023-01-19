export interface GeoPosition {
  lat: number;
  lng: number;
}

export interface UavPosition {
  uid: string;
  time: Date;
  lat: number;
  lng: number;
  climb?: number;
}

export interface UavEvent {
  id: string;
  uid: string;
  time: Date;
  position: GeoPosition;
  kind: "alert" | "warning" | "info";
  type: "new" | "lost" | "idle" | "climb";
  heading?: number;
  climb?: number;
  message?: string;
}

export type UavEventHandler = (event: UavEvent) => void;
export type Status = "new" | "active" | "pending" | "inactive";
