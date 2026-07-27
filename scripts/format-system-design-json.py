import json

snippet = """                                                         ┌───────────────────────────┐
                                                         │  PostgreSQL / Cassandra   │
                                                         └─────────────▲─────────────┘
                                                                       │ (Trip Audits / Logs)
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────┴──────┐
│ Rider/Driver │────▶│ CloudFront   │────▶│ Kong Gateway │────▶│ Trip Engine  │
│ App Client   │     │ Edge CDN     │     │ (WAF / Auth) │     │ Microservice │
└──────▲───────┘     └──────────────┘     └──────────────┘     └───────┬──────┘
       │                                                               │ (Trip Events)
       │                                                               ▼
       │                                                       ┌──────────────┐
       │                                                       │ Kafka Event  │
       │                                                       │ Streaming    │
       │                                                       └───────┬──────┘
       │                                                               │ (Pub/Sub)
       │             ┌──────────────┐                          ┌───────▼──────┐
       └─────────────│ WebSocket    │◀─────────────────────────│ Redis Cache  │
                     │ Gateway      │  (Location Stream)       │ & Pub/Sub    │
                     └──────────────┘                          └──────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 📊 CROSS-CUTTING OBSERVABILITY & TELEMETRY MESH (OpenTelemetry + SigNoz / Datadog)    │
│ - Context Propagation: x-correlation-id & traceparent injected at Kong Gateway         │
│ - Traces: End-to-end Flamegraphs for driver location updates (P99 Latency < 100ms)    │
│ - Metrics: Driver Ingestion RPS (250k/s), Match Lock Contention, Kafka Consumer Lag    │
└────────────────────────────────────────────────────────────────────────────────────────┘"""

answer = """# 🛠️ Master System Design Blueprint: Uber / Lyft

---

## Phase 0: Problem Alignment & Business Context

Before writing requirements or drawing architecture components, we establish alignment on the business context:

1. **Core Purpose:** The system is responsible for matching riders with the nearest available drivers in real time, streaming high-frequency GPS coordinates (every 4s per driver), and orchestrating the transactional ride lifecycle with zero double-booking.
2. **Real-World Users:**
   - **Riders:** Requesting rides, viewing real-time driver movement on map, making payments.
   - **Drivers:** Streaming location coordinates (latitude, longitude, bearing), accepting/rejecting ride requests.
3. **Peak Stress Scenario:** Friday night 10:00 PM surge in dense urban zones (e.g., Manhattan, NYC) with thousands of simultaneous ride requests.
4. **Primary Engineering Challenge:** Ingesting **250,000 location updates per second** without overloading database read replicas, while matching riders to drivers within 2 seconds using spatial indexing.
5. **Blast Radius of Failure:** System outage halts urban transportation, leaves riders stranded, and exposes driver location PII.
6. **Known Constraints:** Mobile cellular networks are spotty—the system must handle out-of-order GPS telemetry and connection drops gracefully.

---

## Phase 1: Functional Scope & Low-Level Design (LLD)

### A. Functional Scope & API Contracts
- **Write Endpoint (Driver GPS Telemetry):**
  - `WS /api/v1/driver/location` (WebSocket / Protobuf binary stream)
  - *Payload:* `{ driver_id: string, lat: number, lng: number, bearing: number, timestamp: number }`
- **Write Endpoint (Rider Request):**
  - `POST /api/v1/rides/request` (REST / JSON)
  - *Payload:* `{ rider_id: string, pickup_lat: number, pickup_lng: number, drop_lat: number, drop_lng: number }`

### B. LLD Class Diagrams & Design Patterns

#### 1. Strategy Pattern: Dynamic Surge Pricing Engine
```typescript
// Interchangeable surge calculation algorithms based on demand/supply density
export interface ISurgePricingStrategy {
  calculateMultiplier(geoHash: string, riderDemand: number, driverSupply: number): number;
}

export class DemandSupplySurgeStrategy implements ISurgePricingStrategy {
  calculateMultiplier(geoHash: string, riderDemand: number, driverSupply: number): number {
    if (driverSupply === 0) return 3.5; // Maximum cap when no drivers available
    const ratio = riderDemand / driverSupply;
    if (ratio <= 1.0) return 1.0; // Normal fare
    return Math.min(1.0 + (ratio - 1.0) * 0.4, 3.5);
  }
}
```

#### 2. State Pattern: Transactional Ride Lifecycle
```typescript
// Finite State Machine governing valid ride status transitions
export interface IRideState {
  acceptRide(context: RideContext): void;
  startRide(context: RideContext): void;
  completeRide(context: RideContext): void;
}

export class RequestedState implements IRideState {
  acceptRide(context: RideContext): void {
    context.setState(new AcceptedState());
  }
  startRide(): void { throw new Error('Cannot start ride before driver accepts'); }
  completeRide(): void { throw new Error('Cannot complete unaccepted ride'); }
}
```

---

## Phase 2: Non-Functional Requirements & Scale Math

### A. Scale Estimation Shortcuts
- **Rider Volume:** 10 Million Daily Rides ÷ 100,000 seconds = 100 Write RPS average.
- **Surge Multiplier (3x):** 100 * 3 = 300 Ride Match Writes/sec peak.
- **Driver Location Ingestion:** 1 Million active drivers updating location every 4 seconds:
  Ingestion RPS = 1,000,000 drivers / 4 seconds = 250,000 Location Writes/sec
- **Network Bandwidth Ingress:** 250,000 RPS * 100 bytes/packet = 25 MB/sec = 2.16 TB raw location logs/day.

### B. Performance & SLA Guardrails
- **Latency Target:** P99 Driver Matching Latency < 2 seconds. Location update broadcast < 200 ms.
- **CAP Theorem:** AP (Availability / Eventual Consistency) for driver location streaming (stale map icon for 1s is acceptable); CP (Strong Consistency) for ride matching and payments (zero double-booking).

---

## Phase 3: High-Level Architecture (HLD) & Security

### A. Geo-Sharding & Spatial Indexing
- **Uber H3 / Google S2 Cells:** Divide the world into hexagonal spatial cells. Active driver locations are indexed in Redis Sorted Sets (`ZADD geo_drivers:<cell_id> timestamp driver_id`).
- **Rider Matching Lookup:** When a rider requests a pickup at coordinate (lat, lng), the system resolves the H3 cell ID and queries the corresponding Redis spatial shard (`ZRANGEBYSCORE`).

### B. Defense-in-Depth Security
1. **API Gateway (Kong):** SSL/TLS 1.3 termination at edge, WAF DDoS protection, Token Bucket rate limiting.
2. **In-Memory JWT Verification:** Gateway validates asymmetric public keys in RAM (< 1ms) and forwards authenticated principal headers (`x-rider-id`, `x-tenant-id`) downstream.
3. **PostgreSQL Row-Level Security (RLS):** Database policy enforces tenant data isolation at the database kernel level:
   CREATE POLICY rider_privacy ON rides FOR ALL USING (rider_id = current_setting('app.current_user'));

### C. OpenTelemetry Observability Mesh
- Correlation ID (`x-correlation-id`) injected at Gateway and propagated across Kafka headers and microservice async contexts (`AsyncLocalStorage`).
- SigNoz/Datadog flamegraphs track full span duration across Gateway -> Location Service -> Redis Pub/Sub -> WebSocket Gateway.

---

## Phase 4: Failure Modes, Resiliency & Hands-On Production SQL

### A. Distributed Resiliency Patterns
1. **Redis Hot-Key Saturation:** Viral location zones (e.g., Airport pickup hub) split key traffic using Key Salting (`geo_drivers:cell_882_1`, `geo_drivers:cell_882_2`).
2. **Database Master Failover:** Patroni multi-replica leader election promotes a read replica to primary writer in < 10 seconds during hardware faults.
3. **Stripe Payment Circuit Breaker:** Outbound calls to Stripe wrapped in a Circuit Breaker with Exponential Backoff + Jitter and Dead-Letter Queues (DLQ).

### B. Production SQL Query Verification

```sql
-- Production Query 1: Top 3 Highest Rated Drivers per City (Window Function)
WITH RankedDrivers AS (
    SELECT 
        d.city_id,
        d.driver_id,
        d.name,
        AVG(r.rating) AS avg_rating,
        COUNT(r.ride_id) AS total_trips,
        DENSE_RANK() OVER (PARTITION BY d.city_id ORDER BY AVG(r.rating) DESC, COUNT(r.ride_id) DESC) AS rank
    FROM drivers d
    INNER JOIN ride_ratings r ON d.driver_id = r.driver_id
    WHERE r.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY d.city_id, d.driver_id, d.name
    HAVING COUNT(r.ride_id) >= 20
)
SELECT city_id, driver_id, name, ROUND(avg_rating, 2) AS rating, total_trips
FROM RankedDrivers
WHERE rank <= 3
ORDER BY city_id, rank;

-- Production Query 2: Atomic Ride Status Transition (Pessimistic Locking)
BEGIN;
SELECT id, status FROM rides WHERE id = 'RIDE_9921' FOR UPDATE;
UPDATE rides SET status = 'IN_TRANSIT', updated_at = NOW() WHERE id = 'RIDE_9921' AND status = 'ACCEPTED';
COMMIT;
```"""

data = [
    {
        "id": "sys-uber-master",
        "category": "High-Level & Low-Level System Design",
        "question": "System Design: Uber / Lyft (Real-Time Driver Tracking, Geo-Sharding & Surge Engine)",
        "snippet": snippet,
        "answer": answer
    }
]

with open('apps/host/public/data/system-design.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

with open('apps/host/dist/data/system-design.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('Successfully written clean JSON file!')
