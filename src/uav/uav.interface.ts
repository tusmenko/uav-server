export interface GeoPosition {
  lat: number;
  lng: number;
}

export interface UavPosition {
  uid: string;
  time: number;
  lat: number;
  lng: number;
  climb?: number;
}

export interface UavEvent {
  id: string;
  uid: string;
  time: number;
  position: GeoPosition;
  kind: "alert" | "warning" | "info";
  type: "new" | "lost" | "idle" | "climb";
  heading?: number;
  climb?: number;
  message?: string;
}
export type UavPositionHandler = (position: UavPosition) => void;
export type UavEventHandler = (event: UavEvent) => void;
export type Status = "new" | "active" | "pending" | "inactive";
