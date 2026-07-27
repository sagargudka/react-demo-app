import React, { useState } from 'react';

interface SystemDesignBlueprintProps {
  blueprint: {
    id: string;
    category: string;
    question: string;
    snippet: string | null;
    answer: string;
  };
}

export const SystemDesignViewer: React.FC<SystemDesignBlueprintProps> = ({ blueprint }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'lld' | 'scale' | 'resiliency'>('architecture');

  return (
    <div style={{ textAlign: 'left', color: '#e2e8f0', width: '100%' }}>
      
      {/* Header Banner */}
      <div style={{ borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.75rem', background: '#3b0764', color: '#c084fc', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
          {blueprint.category}
        </span>
        <h2 style={{ color: '#f8fafc', margin: '12px 0 6px 0', fontSize: '1.4rem', textAlign: 'left' }}>
          {blueprint.question}
        </h2>
      </div>

      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('architecture')}
          style={{
            background: activeTab === 'architecture' ? '#2563eb' : '#0f172a',
            color: '#fff',
            border: activeTab === 'architecture' ? '1px solid #3b82f6' : '1px solid #334155',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          🏛️ Interactive Horseshoe Architecture
        </button>
        <button
          onClick={() => setActiveTab('lld')}
          style={{
            background: activeTab === 'lld' ? '#2563eb' : '#0f172a',
            color: '#fff',
            border: activeTab === 'lld' ? '1px solid #3b82f6' : '1px solid #334155',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          💻 LLD Code & Patterns
        </button>
        <button
          onClick={() => setActiveTab('scale')}
          style={{
            background: activeTab === 'scale' ? '#2563eb' : '#0f172a',
            color: '#fff',
            border: activeTab === 'scale' ? '1px solid #3b82f6' : '1px solid #334155',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          🧮 Scale Math & Guardrails
        </button>
        <button
          onClick={() => setActiveTab('resiliency')}
          style={{
            background: activeTab === 'resiliency' ? '#2563eb' : '#0f172a',
            color: '#fff',
            border: activeTab === 'resiliency' ? '1px solid #3b82f6' : '1px solid #334155',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          ⚡ Resiliency & SQL Queries
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'architecture' && (
        <div>
          {/* Animated Visual Whiteboard Canvas */}
          <div style={{
            background: '#090d16',
            border: '2px solid #1e293b',
            borderRadius: '12px',
            padding: '24px',
            position: 'relative',
            marginBottom: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>📍 MIRO WHITEBOARD CANVAS (HORSESHOE LAYOUT)</span>
              <span style={{ fontSize: '0.75rem', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>Interactive View</span>
            </div>

            {/* Visual Component Flow Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* TOP ARM: Ingestion Flow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
                <div style={{ background: '#1e1b4b', border: '1px solid #6366f1', borderRadius: '8px', padding: '12px', width: '150px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem' }}>📱</div>
                  <strong style={{ color: '#818cf8', fontSize: '0.85rem' }}>Clients</strong>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Rider / Driver Mobile</div>
                </div>

                <div style={{ color: '#6366f1', fontWeight: 'bold' }}>➔</div>

                <div style={{ background: '#064e3b', border: '1px solid #10b981', borderRadius: '8px', padding: '12px', width: '150px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem' }}>🌐</div>
                  <strong style={{ color: '#34d399', fontSize: '0.85rem' }}>CloudFront CDN</strong>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Edge Cache & DNS</div>
                </div>

                <div style={{ color: '#10b981', fontWeight: 'bold' }}>➔</div>

                <div style={{ background: '#451a03', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px', width: '160px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem' }}>🛡️</div>
                  <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>Kong API Gateway</strong>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>WAF / JWT / Rate Limit</div>
                </div>

                <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>➔</div>

                <div style={{ background: '#312e81', border: '1px solid #818cf8', borderRadius: '8px', padding: '12px', width: '170px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem' }}>⚙️</div>
                  <strong style={{ color: '#a5b4fc', fontSize: '0.85rem' }}>Trip Engine Microservice</strong>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Go / Node Services</div>
                </div>

                <div style={{ color: '#818cf8', fontWeight: 'bold' }}>➔</div>

                <div style={{ background: '#831843', border: '1px solid #f43f5e', borderRadius: '8px', padding: '12px', width: '150px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem' }}>🗄️</div>
                  <strong style={{ color: '#fda4af', fontSize: '0.85rem' }}>Postgres / Cassandra</strong>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Primary Database</div>
                </div>
              </div>

              {/* BOTTOM ARM: Egress & Real-Time Stream */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px dashed #334155' }}>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 'bold', minWidth: '100px' }}>⚡ EGRESS PATH:</span>

                <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '8px 12px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Kafka Event Streaming
                </div>
                <span style={{ color: '#38bdf8' }}>➔</span>
                <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '8px 12px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Redis Geo-Spatial Cache & Pub/Sub
                </div>
                <span style={{ color: '#38bdf8' }}>➔</span>
                <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '8px 12px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  WebSocket Gateway
                </div>
                <span style={{ color: '#38bdf8' }}>➔</span>
                <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '8px 12px', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 'bold' }}>
                  Real-time Map Stream to App
                </div>
              </div>

              {/* CROSS-CUTTING OBSERVABILITY MESH */}
              <div style={{ background: '#022c22', border: '1px solid #059669', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 'bold', marginBottom: '6px' }}>
                  📊 OpenTelemetry Observability & Telemetry Mesh
                </div>
                <div style={{ fontSize: '0.75rem', color: '#a7f3d0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>• <strong>Trace Context:</strong> <code>x-correlation-id</code> & <code>traceparent</code> injected at Gateway</div>
                  <div>• <strong>Telemetry Stack:</strong> OpenTelemetry Spans exporting flamegraphs to SigNoz / Datadog</div>
                  <div>• <strong>Golden Signals:</strong> P99 Match Latency (&lt;2s), Ingestion RPS (250k/s), Kafka Lag</div>
                  <div>• <strong>Log Correlation:</strong> 1-click drill-down from slow trace to exact container log</div>
                </div>
              </div>

            </div>
          </div>

          {/* ASCII Raw Whiteboard */}
          <h4 style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '0.9rem' }}>Raw ASCII Blueprint Notation:</h4>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', border: '1px solid #1e293b', overflowX: 'auto', fontSize: '0.8rem', color: '#38bdf8', lineHeight: '1.4' }}>
            <code>{blueprint.snippet}</code>
          </pre>
        </div>
      )}

      {activeTab === 'lld' && (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ color: '#60a5fa', margin: '0 0 15px 0' }}>💻 Low-Level Design (LLD) Code Models & Patterns</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>
            These TypeScript design pattern implementations demonstrate object-oriented code abstractions for internal components before scaling out.
          </p>

          <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid #334155', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontFamily: 'Fira Code, monospace', fontSize: '0.85rem', color: '#4ade80', lineHeight: '1.5' }}>
              <code>{`// 1. Strategy Pattern: Dynamic Surge Pricing Engine
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

// 2. State Pattern: Transactional Ride Lifecycle
export interface IRideState {
  acceptRide(context: RideContext): void;
  startRide(context: RideContext): void;
  completeRide(context: RideContext): void;
}

export class RequestedState implements IRideState {
  acceptRide(context: RideContext): void {
    context.setState(new AcceptedState());
  }
  startRide(): void { throw new Error("Cannot start ride before driver accepts"); }
  completeRide(): void { throw new Error("Cannot complete unaccepted ride"); }
}`}</code>
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'scale' && (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ color: '#fbbf24', margin: '0 0 15px 0' }}>🧮 Scale Math & Performance Guardrails</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ background: '#1e1b4b', padding: '15px', borderRadius: '8px', border: '1px solid #4338ca' }}>
              <div style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>DRIVER INGESTION THROUGHPUT</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#818cf8', margin: '5px 0' }}>250,000 RPS</div>
              <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>1M active drivers updating GPS coordinates every 4s</div>
            </div>

            <div style={{ background: '#064e3b', padding: '15px', borderRadius: '8px', border: '1px solid #047857' }}>
              <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>RIDE MATCH WRITE SURGE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#34d399', margin: '5px 0' }}>300 Writes/sec</div>
              <div style={{ fontSize: '0.75rem', color: '#d1fae5' }}>100 avg RPS × 3x peak surge multiplier (100k shortcut)</div>
            </div>
          </div>

          <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#f59e0b', margin: '0 0 10px 0' }}>Scale Derivations & CAP Choice:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.7' }}>
              <li><strong>Rider Volume Shortcut:</strong> 10 Million Daily Rides ÷ 100,000 seconds = 100 Write RPS average.</li>
              <li><strong>Peak Surge Math:</strong> Applying 3x multiplier = 300 Ride Match Writes/sec peak.</li>
              <li><strong>Network Ingress:</strong> 250,000 RPS × 100 bytes = 25 MB/sec = <strong>2.16 TB raw location logs/day</strong>.</li>
              <li><strong>CAP Theorem Decision:</strong> <strong>AP (Availability)</strong> for location streaming (stale map icon for 1s is fine); <strong>CP (Strong Consistency)</strong> for ride matching & payment transactions.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'resiliency' && (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ color: '#f43f5e', margin: '0 0 15px 0' }}>⚡ Resiliency & Hands-On Production SQL</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>
            Production-grade PostgreSQL queries demonstrating Window functions, CTEs, and pessimistic locking for zero double-booking.
          </p>

          <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid #334155', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontFamily: 'Fira Code, monospace', fontSize: '0.85rem', color: '#f43f5e', lineHeight: '1.5' }}>
              <code>{`-- 1. Production Query: Top 3 Highest Rated Drivers per City (Window Function)
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

-- 2. Production Query: Atomic Ride Status Transition (Pessimistic Locking)
BEGIN;
SELECT id, status FROM rides WHERE id = 'RIDE_9921' FOR UPDATE;
UPDATE rides SET status = 'IN_TRANSIT', updated_at = NOW() WHERE id = 'RIDE_9921' AND status = 'ACCEPTED';
COMMIT;`}</code>
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
