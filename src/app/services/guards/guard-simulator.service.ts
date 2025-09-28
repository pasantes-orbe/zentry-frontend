import { Injectable } from '@angular/core';
import * as L from 'leaflet';

type LatLng = { lat: number; lng: number };
type SimGuard = {
  id: string;
  marker: L.CircleMarker;
  path: LatLng[];
  idx: number;
  speed: number;
};

@Injectable({ providedIn: 'root' })
export class GuardSimulatorService {
  private map: L.Map | null = null;
  private guards: SimGuard[] = [];
  private timer: any = null;

  start(map: L.Map, perimeter: LatLng[], count = 3, tickMs = 800): void {
    this.stop();
    if (!map || !perimeter || perimeter.length < 3) return;

    this.map = map;
    const path = this.buildLoopPath(perimeter);

    this.guards = Array.from({ length: count }).map((_, i) => {
      const idx = Math.floor((i * path.length) / count);
      const p = path[idx];

      const marker = L.circleMarker([p.lat, p.lng], {
        color: '#1488cc',
        fillColor: '#1488cc',
        fillOpacity: 0.8,
        radius: 7,
        weight: 2
      }).bindPopup(`Guardia demo #${i + 1}`, { closeButton: false })
        .addTo(this.map!);

      return { id: `demo-${i + 1}`, marker, path, idx, speed: 1 + (i % 2) };
    });

    this.timer = setInterval(() => this.tick(), tickMs);
  }

  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.guards.forEach(g => g.marker.remove());
    this.guards = [];
    this.map = null;
  }

  private tick(): void {
    for (const g of this.guards) {
      g.idx = (g.idx + g.speed) % g.path.length;
      const p = g.path[g.idx];
      g.marker.setLatLng([p.lat, p.lng]);
    }
  }

  // densifica y cierra el polígono para un loop suave
  private buildLoopPath(perimeter: LatLng[]): LatLng[] {
    const closed = (perimeter[0].lat === perimeter[perimeter.length - 1].lat &&
                    perimeter[0].lng === perimeter[perimeter.length - 1].lng)
                   ? perimeter.slice()
                   : [...perimeter, perimeter[0]];

    const densified: LatLng[] = [];
    const SEGMENTS = 25;

    for (let i = 0; i < closed.length - 1; i++) {
      const a = closed[i], b = closed[i + 1];
      for (let s = 0; s < SEGMENTS; s++) {
        const t = s / SEGMENTS;
        densified.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });
      }
    }
    return densified;
  }
}
