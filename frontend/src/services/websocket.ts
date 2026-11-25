import type { TelemetryFrame, SimulationMetadata } from "../types/telemetry";

export type ConnectionState = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "RECONNECTING";

const getDefaultWsUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProto}//${window.location.host}/ws/telemetry`;
  }
  return "ws://localhost:8000/ws/telemetry";
};

type FrameHandler = (frame: TelemetryFrame) => void;
type MetadataHandler = (meta: SimulationMetadata) => void;
type StatusHandler = (status: ConnectionState) => void;

class WebSocketTelemetryService {
  private ws: WebSocket | null = null;
  private url: string = getDefaultWsUrl();
  private frameListeners: Set<FrameHandler> = new Set();
  private metaListeners: Set<MetadataHandler> = new Set();
  private statusListeners: Set<StatusHandler> = new Set();
  private reconnectTimer: number | null = null;
  private status: ConnectionState = "DISCONNECTED";
  private shouldReconnect: boolean = true;
  private reconnectAttempts: number = 0;

  constructor() {
    this.setStatus("DISCONNECTED");
  }

  public connect(customUrl?: string) {
    if (customUrl) this.url = customUrl;
    this.shouldReconnect = true;
    this.createSocket();
  }

  private setStatus(newStatus: ConnectionState) {
    this.status = newStatus;
    this.statusListeners.forEach(listener => listener(newStatus));
  }

  public getStatus(): ConnectionState {
    return this.status;
  }

  private createSocket() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus(this.reconnectAttempts > 0 ? "RECONNECTING" : "CONNECTING");

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus("CONNECTED");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "TELEMETRY_UPDATE" || data.type === "INITIAL_STATE") {
            if (data.frame) {
              this.frameListeners.forEach(fn => fn(data.frame));
            }
            if (data.metadata) {
              this.metaListeners.forEach(fn => fn(data.metadata));
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
      };

      this.ws.onclose = () => {
        this.setStatus("DISCONNECTED");
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.setStatus("DISCONNECTED");
      };
    } catch {
      this.setStatus("DISCONNECTED");
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectAttempts += 1;
    const delay = Math.min(2000 * Math.pow(1.2, this.reconnectAttempts), 8000);
    this.reconnectTimer = window.setTimeout(() => {
      this.createSocket();
    }, delay);
  }

  public sendCommand(action: string, params: Record<string, unknown> = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action, params }));
    }
  }

  public onFrame(handler: FrameHandler): () => void {
    this.frameListeners.add(handler);
    return () => this.frameListeners.delete(handler);
  }

  public onMetadata(handler: MetadataHandler): () => void {
    this.metaListeners.add(handler);
    return () => this.metaListeners.delete(handler);
  }

  public onStatus(handler: StatusHandler): () => void {
    this.statusListeners.add(handler);
    handler(this.status);
    return () => this.statusListeners.delete(handler);
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus("DISCONNECTED");
  }
}

export const wsService = new WebSocketTelemetryService();
