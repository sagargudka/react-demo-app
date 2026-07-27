import React, { useState } from 'react';

interface QuestionItem {
  id: string;
  category: string;
  question: string;
  snippet: string | null;
  answer: string;
}

interface SystemDesignGridProps {
  questions: QuestionItem[];
}

export const SystemDesignGrid: React.FC<SystemDesignGridProps> = ({ questions }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'lld' | 'scale' | 'resiliency'>('architecture');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = ['All', ...Array.from(new Set(questions.map((q) => q.category)))];

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ textAlign: 'left', color: '#e2e8f0', width: '100%', minHeight: '80vh' }}>
      
      {/* PERFECT ZERO-OVERLAP TOPOLOGY & STEP-BY-STEP GUIDANCE STYLES */}
      <style>{`
        @keyframes pulseLine {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes returnPulse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 24; }
        }
        .pipeline-req {
          stroke-dasharray: 6 6;
          animation: pulseLine 0.8s linear infinite;
        }
        .pipeline-res {
          stroke-dasharray: 6 6;
          animation: returnPulse 0.8s linear infinite;
        }
        .topology-node {
          background: rgba(15, 23, 42, 0.95);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          padding: 14px 18px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 5;
        }
        .topology-node:hover {
          transform: translateY(-3px) scale(1.03);
          border-color: #38bdf8;
          box-shadow: 0 10px 30px rgba(56, 189, 248, 0.4);
        }
        .step-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284c7 0%, #3b82f6 100%);
          color: #fff;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
          border: 2px solid #38bdf8;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          z-index: 10;
        }
        .step-badge:hover {
          transform: scale(1.2);
          background: #7c3aed;
          border-color: #c084fc;
          box-shadow: 0 0 20px rgba(192, 132, 252, 0.8);
        }
        .glass-card {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          border-color: rgba(56, 189, 248, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px 0 rgba(56, 189, 248, 0.25);
        }
      `}</style>

      {/* Search & Category Filter Bar */}
      <div style={{ marginBottom: '25px' }}>
        
        {/* Row with Search Input Bar + Filter Toggle Icon Side-by-Side */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1', minWidth: '280px' }}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search System Design Topics (e.g. Uber, Kafka, Locks)..."
              style={{ padding: '12px 16px', flex: '1', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', fontSize: '0.95rem', backdropFilter: 'blur(8px)', boxSizing: 'border-box' }}
            />
            
            {/* Filter Toggle Button (Icon Only beside Search Bar) */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              title="Toggle Category Filters"
              style={{
                background: mobileFilterOpen ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #38bdf8',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                whiteSpace: 'nowrap'
              }}
            >
              ⚙️
            </button>
          </div>

        </div>

        {/* Category Pills (Visible on Desktop, Collapsible on Mobile via Filter Toggle Button) */}
        <div 
          className={mobileFilterOpen ? '' : 'hide-on-mobile'}
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}
        >
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: selectedCategory === cat ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                background: selectedCategory === cat ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'rgba(15, 23, 42, 0.8)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* TOPIC CARDS GRID VIEW */}
      {!selectedQuestion && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {filteredQuestions.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              onClick={() => {
                setSelectedQuestion(item);
                setActiveTab('architecture');
              }}
              style={{
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(147, 51, 234, 0.25)', border: '1px solid rgba(192, 132, 252, 0.4)', color: '#c084fc', padding: '4px 12px', borderRadius: '12px', fontWeight: '600' }}>
                  {item.category}
                </span>
                <h3 style={{ color: '#f8fafc', margin: '16px 0 12px 0', fontSize: '1.25rem', lineHeight: '1.4', fontWeight: '700' }}>
                  {item.question}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.answer.replace(/#|\*|`|---/g, '')}
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💎 Step-by-Step Guided System Topology
                </span>
                <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: '700' }}>Inspect Architecture ➔</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN MODAL BLUEPRINT WORKSPACE */}
      {selectedQuestion && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(2, 6, 23, 0.94)',
          backdropFilter: 'blur(16px)',
          zIndex: 1000,
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            maxWidth: '1440px',
            width: '100%',
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: '30px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
            position: 'relative'
          }}>
            
            {/* Header Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <button
                onClick={() => setSelectedQuestion(null)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '8px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem'
                }}
              >
                ← Back to Topic Cards
              </button>

              <span style={{ fontSize: '0.85rem', background: 'rgba(147, 51, 234, 0.25)', border: '1px solid rgba(192, 132, 252, 0.4)', color: '#c084fc', padding: '4px 16px', borderRadius: '12px', fontWeight: 'bold' }}>
                {selectedQuestion.category}
              </span>
            </div>

            <h2 style={{ color: '#f8fafc', fontSize: '1.6rem', marginBottom: '20px', lineHeight: '1.3', fontWeight: '800' }}>
              {selectedQuestion.question}
            </h2>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('architecture')}
                style={{
                  background: activeTab === 'architecture' ? 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)' : 'rgba(30, 41, 59, 0.6)',
                  color: '#fff',
                  border: activeTab === 'architecture' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                💎 HD Step-by-Step System Topology & Dataflow
              </button>
              <button
                onClick={() => setActiveTab('lld')}
                style={{
                  background: activeTab === 'lld' ? 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)' : 'rgba(30, 41, 59, 0.6)',
                  color: '#fff',
                  border: activeTab === 'lld' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                💻 LLD Code & Patterns
              </button>
              <button
                onClick={() => setActiveTab('scale')}
                style={{
                  background: activeTab === 'scale' ? 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)' : 'rgba(30, 41, 59, 0.6)',
                  color: '#fff',
                  border: activeTab === 'scale' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                🧮 Scale Math & Guardrails
              </button>
              <button
                onClick={() => setActiveTab('resiliency')}
                style={{
                  background: activeTab === 'resiliency' ? 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)' : 'rgba(30, 41, 59, 0.6)',
                  color: '#fff',
                  border: activeTab === 'resiliency' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                ⚡ Resiliency & SQL Queries
              </button>
            </div>

            {/* TAB 1: ZERO-OVERLAP TOPOLOGY GRAPH WITH STEP-BY-STEP GUIDANCE BADGES */}
            {activeTab === 'architecture' && (
              <div>
                
                <div style={{
                  background: 'rgba(3, 7, 18, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '20px',
                  padding: '30px',
                  marginBottom: '24px',
                  position: 'relative',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  
                  {/* Canvas Header Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🌐 GUIDED ARCHITECTURE DATAFLOW (STEPS 1 ➔ 8)
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        Follow the numbered badges <strong style={{ color: '#38bdf8' }}>[1] through [8]</strong> to trace end-to-end request ingestion, transactional persistence, and egress return streaming. Click any step to view specifications!
                      </div>
                    </div>

                    {/* Canvas Zoom Controls */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(30, 41, 59, 0.8)', padding: '4px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: '4px' }}>Zoom: {Math.round(zoomLevel * 100)}%</span>
                      <button onClick={() => setZoomLevel(Math.max(0.7, zoomLevel - 0.1))} style={{ background: '#1e293b', color: '#fff', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                      <button onClick={() => setZoomLevel(1)} style={{ background: '#1e293b', color: '#38bdf8', border: 'none', borderRadius: '4px', padding: '0 6px', height: '24px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Reset</button>
                      <button onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.1))} style={{ background: '#1e293b', color: '#fff', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                    </div>
                  </div>

                  {/* RIGID ZERO-OVERLAP VIEWPORT (Width 1260px, Height 540px) */}
                  <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', transition: 'transform 0.2s ease-out', position: 'relative', width: '1260px', height: '540px', margin: '0 auto' }}>

                    {/* PERFECT SVG CONNECTOR LINES & ARROWHEADS */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                      <defs>
                        <marker id="hdArrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                        </marker>
                        <marker id="hdArrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
                        </marker>
                        <marker id="hdArrowPurple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#c084fc" />
                        </marker>
                        <marker id="hdArrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
                        </marker>
                      </defs>

                      {/* Step 1: Clients (Col 1 Top) -> CloudFront CDN (Col 2 Top) */}
                      <line x1="220" y1="55" x2="330" y2="55" stroke="#38bdf8" strokeWidth="2.5" className="pipeline-req" markerEnd="url(#hdArrowBlue)" />

                      {/* Step 2: CloudFront CDN (Col 2 Top) -> Kong Gateway (Col 3 Top) */}
                      <line x1="530" y1="55" x2="640" y2="55" stroke="#38bdf8" strokeWidth="2.5" className="pipeline-req" markerEnd="url(#hdArrowBlue)" />

                      {/* Step 3: Kong Gateway (Col 3 Top) -> Core Service (Col 4 Top) */}
                      <line x1="840" y1="55" x2="950" y2="55" stroke="#c084fc" strokeWidth="2.5" className="pipeline-req" markerEnd="url(#hdArrowPurple)" />

                      {/* Step 4: Core Service (Col 4 Top) -> Postgres DB (Col 4 Mid) */}
                      <line x1="1050" y1="95" x2="1050" y2="175" stroke="#fda4af" strokeWidth="2.5" className="pipeline-req" markerEnd="url(#hdArrowRed)" />

                      {/* Step 5: Core Service (Col 4 Top) -> Kafka Bus (Col 4 Bottom) */}
                      <line x1="1080" y1="95" x2="1080" y2="335" stroke="#fbbf24" strokeWidth="2.5" className="pipeline-req" markerEnd="url(#hdArrowPurple)" />

                      {/* Step 6: Kafka Bus (Col 4 Bottom) -> Redis Cache (Col 3 Bottom) */}
                      <line x1="950" y1="375" x2="840" y2="375" stroke="#f87171" strokeWidth="2.5" className="pipeline-req" markerEnd="url(#hdArrowRed)" />

                      {/* Step 7: Redis Cache (Col 3 Bottom) -> WS Gateway (Col 2 Bottom) */}
                      <line x1="640" y1="375" x2="530" y2="375" stroke="#34d399" strokeWidth="2.5" className="pipeline-res" markerEnd="url(#hdArrowGreen)" />

                      {/* Step 8: WS Gateway (Col 2 Bottom) -> Clients Return Loop (Col 1 Top) */}
                      <path d="M 330 375 C 100 375, 100 220, 100 95" fill="none" stroke="#34d399" strokeWidth="2.5" className="pipeline-res" markerEnd="url(#hdArrowGreen)" />
                    </svg>

                    {/* NUMBERED STEP BADGES [1] THROUGH [8] (ZERO OVERLAP PLACEMENT) */}

                    {/* STEP 1 BADGE */}
                    <div 
                      className="step-badge"
                      onClick={() => setActiveStep(1)}
                      style={{ position: 'absolute', top: '41px', left: '260px' }}
                      title="Step 1: Driver Location Telemetry Ingestion"
                    >
                      1
                    </div>

                    {/* STEP 2 BADGE */}
                    <div 
                      className="step-badge"
                      onClick={() => setActiveStep(2)}
                      style={{ position: 'absolute', top: '41px', left: '570px' }}
                      title="Step 2: Edge CDN Anycast Route"
                    >
                      2
                    </div>

                    {/* STEP 3 BADGE */}
                    <div 
                      className="step-badge"
                      onClick={() => setActiveStep(3)}
                      style={{ position: 'absolute', top: '41px', left: '880px' }}
                      title="Step 3: Gateway Token Authentication"
                    >
                      3
                    </div>

                    {/* STEP 4 BADGE */}
                    <div 
                      className="step-badge"
                      onClick={() => setActiveStep(4)}
                      style={{ position: 'absolute', top: '125px', left: '1036px', background: '#991b1b', borderColor: '#f87171' }}
                      title="Step 4: Primary Relational DB Persistence"
                    >
                      4
                    </div>

                    {/* STEP 5 BADGE */}
                    <div 
                      className="step-badge"
                      onClick={() => setActiveStep(5)}
                      style={{ position: 'absolute', top: '240px', left: '1066px', background: '#78350f', borderColor: '#fbbf24' }}
                      title="Step 5: High-Throughput Event Stream Produce"
                    >
                      5
                    </div>

                    {/* STEP 6 BADGE */}
                    <div 
                      className="step-badge"
                      onClick={() => setActiveStep(6)}
                      style={{ position: 'absolute', top: '361px', left: '880px', background: '#991b1b', borderColor: '#f87171' }}
                      title="Step 6: Geo-Spatial Cell Indexing"
                    >
                      6
                    </div>

                    {/* STEP 7 BADGE */}
                    <div 
                      className="step-badge"
                      onClick={() => setActiveStep(7)}
                      style={{ position: 'absolute', top: '361px', left: '570px', background: '#065f46', borderColor: '#34d399' }}
                      title="Step 7: Real-Time Egress Channel Broadcast"
                    >
                      7
                    </div>

                    {/* STEP 8 BADGE */}
                    <div 
                      className="step-badge"
                      onClick={() => setActiveStep(8)}
                      style={{ position: 'absolute', top: '220px', left: '86px', background: '#065f46', borderColor: '#34d399' }}
                      title="Step 8: Map Marker Stream Return"
                    >
                      8
                    </div>

                    {/* ZERO-OVERLAP COMPONENT NODES (Width 200px, Height 80px) */}

                    {/* ROW 1 TOP (Y: 15px) */}
                    {/* Node 1: Mobile Clients */}
                    <div 
                      className="topology-node" 
                      onClick={() => setActiveNode('clients')} 
                      style={{ position: 'absolute', top: '15px', left: '20px', width: '200px', height: '80px', borderColor: '#38bdf8' }}
                    >
                      <span style={{ fontSize: '2rem' }}>📱</span>
                      <div>
                        <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>Client App</strong>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>iOS / Android Mobile</div>
                        <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 'bold' }}>Protobuf Stream</div>
                      </div>
                    </div>

                    {/* Node 2: CloudFront CDN */}
                    <div 
                      className="topology-node" 
                      onClick={() => setActiveNode('cdn')} 
                      style={{ position: 'absolute', top: '15px', left: '330px', width: '200px', height: '80px', borderColor: '#34d399' }}
                    >
                      <span style={{ fontSize: '2rem' }}>☁️</span>
                      <div>
                        <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>CloudFront CDN</strong>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>AWS Edge Anycast</div>
                        <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 'bold' }}>TLS 1.3 Termination</div>
                      </div>
                    </div>

                    {/* Node 3: Kong API Gateway */}
                    <div 
                      className="topology-node" 
                      onClick={() => setActiveNode('gateway')} 
                      style={{ position: 'absolute', top: '15px', left: '640px', width: '200px', height: '80px', borderColor: '#fbbf24' }}
                    >
                      <span style={{ fontSize: '2rem' }}>🦍</span>
                      <div>
                        <strong style={{ color: '#fbbf24', fontSize: '0.9rem' }}>Kong Gateway</strong>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>WAF Edge & Auth</div>
                        <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 'bold' }}>JWT & Rate Limit</div>
                      </div>
                    </div>

                    {/* Node 4: Trip Engine Microservice */}
                    <div 
                      className="topology-node" 
                      onClick={() => setActiveNode('service')} 
                      style={{ position: 'absolute', top: '15px', left: '950px', width: '200px', height: '80px', borderColor: '#c084fc' }}
                    >
                      <span style={{ fontSize: '2rem' }}>⚙️</span>
                      <div>
                        <strong style={{ color: '#c084fc', fontSize: '0.9rem' }}>Trip Engine</strong>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Go Microservice</div>
                        <div style={{ fontSize: '0.65rem', color: '#c084fc', fontWeight: 'bold' }}>Match & Surge Logic</div>
                      </div>
                    </div>

                    {/* MIDDLE ROW (Y: 175px) */}
                    {/* Node 5: Postgres Primary DB */}
                    <div 
                      className="topology-node" 
                      onClick={() => setActiveNode('storage')} 
                      style={{ position: 'absolute', top: '175px', left: '950px', width: '200px', height: '80px', borderColor: '#fda4af' }}
                    >
                      <span style={{ fontSize: '2rem' }}>🐘</span>
                      <div>
                        <strong style={{ color: '#fda4af', fontSize: '0.9rem' }}>Postgres DB</strong>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Patroni Primary</div>
                        <div style={{ fontSize: '0.65rem', color: '#fda4af', fontWeight: 'bold' }}>RLS & Row Locks</div>
                      </div>
                    </div>

                    {/* ROW 2 BOTTOM (Y: 335px) */}
                    {/* Node 6: Kafka Event Bus */}
                    <div 
                      className="topology-node" 
                      onClick={() => setActiveNode('kafka')} 
                      style={{ position: 'absolute', top: '335px', left: '950px', width: '200px', height: '80px', borderColor: '#fbbf24' }}
                    >
                      <span style={{ fontSize: '2rem' }}>🧅</span>
                      <div>
                        <strong style={{ color: '#fbbf24', fontSize: '0.9rem' }}>Kafka Bus</strong>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Event Streaming</div>
                        <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 'bold' }}>250k Location RPS</div>
                      </div>
                    </div>

                    {/* Node 7: Redis Spatial Cache */}
                    <div 
                      className="topology-node" 
                      onClick={() => setActiveNode('redis')} 
                      style={{ position: 'absolute', top: '335px', left: '640px', width: '200px', height: '80px', borderColor: '#f87171' }}
                    >
                      <span style={{ fontSize: '2rem' }}>🔻</span>
                      <div>
                        <strong style={{ color: '#f87171', fontSize: '0.9rem' }}>Redis Geo</strong>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Spatial Indexing</div>
                        <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 'bold' }}>GEOADD & Pub/Sub</div>
                      </div>
                    </div>

                    {/* Node 8: WebSocket Egress Gateway */}
                    <div 
                      className="topology-node" 
                      onClick={() => setActiveNode('websocket')} 
                      style={{ position: 'absolute', top: '335px', left: '330px', width: '200px', height: '80px', borderColor: '#34d399' }}
                    >
                      <span style={{ fontSize: '2rem' }}>⚡</span>
                      <div>
                        <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>WS Gateway</strong>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Egress Stream</div>
                        <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 'bold' }}>Sub-200ms Egress</div>
                      </div>
                    </div>

                    {/* OPENTELEMETRY BANNER (Y: 450px) */}
                    <div style={{ position: 'absolute', top: '450px', left: '20px', width: '1130px', background: 'rgba(2, 44, 34, 0.9)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 'bold' }}>
                        📊 OpenTelemetry Observability Mesh (Trace Context & Spans)
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>
                        <code>x-correlation-id</code> & <code>traceparent</code> passed from Gateway ➔ Services ➔ Kafka
                      </span>
                    </div>

                  </div>

                </div>

                {/* STEP-BY-STEP GUIDED WORKFLOW INSPECTOR MODAL */}
                {activeStep && (
                  <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #38bdf8', borderRadius: '14px', padding: '20px', marginBottom: '24px', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(56, 189, 248, 0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1rem', fontWeight: '800' }}>
                        📍 Step {activeStep} Dataflow Specification & Protocol Contract
                      </h4>
                      <button onClick={() => setActiveStep(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}>✕ Close</button>
                    </div>
                    
                    {activeStep === 1 && (
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <div><strong>Description:</strong> Driver app streams high-frequency GPS telemetry every 4s via WebSocket.</div>
                        <div><strong>Protocol:</strong> WebSocket (WSS) / Protobuf Binary Stream</div>
                        <div><strong>Payload Schema:</strong> <code>{`{ driver_id: "DRV_8812", lat: 40.7128, lng: -74.0060, bearing: 180, timestamp: 1785169687 }`}</code></div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <div><strong>Description:</strong> CloudFront CDN terminates TLS 1.3 at edge locations with Anycast routing (&lt;15ms latency).</div>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <div><strong>Description:</strong> Kong Gateway validates JWT RS250 asymmetric public key in-memory (&lt;1ms) & injects trace headers.</div>
                        <div><strong>Injected Headers:</strong> <code>x-rider-id</code>, <code>x-tenant-id</code>, <code>traceparent</code></div>
                      </div>
                    )}

                    {activeStep === 4 && (
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <div><strong>Description:</strong> Trip Engine executes atomic database transactions with PostgreSQL Row-Level Security (RLS) & pessimistic locks (`FOR UPDATE`).</div>
                      </div>
                    )}

                    {activeStep === 5 && (
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <div><strong>Description:</strong> Core service produces async location telemetry events to Kafka `driver-locations-v1` topic (250,000 RPS peak).</div>
                      </div>
                    )}

                    {activeStep === 6 && (
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <div><strong>Description:</strong> Stream consumer indexes active driver coordinates in Redis Sorted Sets using Uber H3 spatial hashing (`GEOADD`).</div>
                      </div>
                    )}

                    {activeStep === 7 && (
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <div><strong>Description:</strong> Redis Pub/Sub channels broadcast nearby driver coordinates to WebSocket Gateway subscribers.</div>
                      </div>
                    )}

                    {activeStep === 8 && (
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <div><strong>Description:</strong> WebSocket Gateway streams live driver marker coordinates back to Rider App UI (Sub-200ms Egress SLA).</div>
                      </div>
                    )}
                  </div>
                )}

                {/* DYNAMIC NODE INSPECTOR PANEL */}
                {activeNode && (
                  <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #c084fc', borderRadius: '14px', padding: '20px', marginBottom: '24px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, color: '#c084fc', fontSize: '1rem', fontWeight: '700' }}>
                        🔍 Component Node Deep-Dive: {activeNode.toUpperCase()}
                      </h4>
                      <button onClick={() => setActiveNode(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕ Close</button>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0 }}>
                      Detailed protocol contracts, rate limiting, and failure modes for {activeNode}.
                    </p>
                  </div>
                )}

                <h4 style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '0.95rem' }}>Raw ASCII Blueprint Notation:</h4>
                <pre style={{ background: 'rgba(3, 7, 18, 0.9)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto', fontSize: '0.85rem', color: '#38bdf8', lineHeight: '1.4' }}>
                  <code>{selectedQuestion.snippet}</code>
                </pre>
              </div>
            )}

            {/* TAB 2: LLD */}
            {activeTab === 'lld' && (
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '24px' }}>
                <h3 style={{ color: '#60a5fa', margin: '0 0 15px 0' }}>💻 Low-Level Design (LLD) Code Models & Patterns</h3>
                <div style={{ background: '#030712', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
                  <pre style={{ margin: 0, fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', color: '#4ade80', lineHeight: '1.5' }}>
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

            {/* TAB 3: SCALE */}
            {activeTab === 'scale' && (
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '24px' }}>
                <h3 style={{ color: '#fbbf24', margin: '0 0 15px 0' }}>🧮 Scale Math & Performance Guardrails</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(30, 27, 75, 0.75)', padding: '20px', borderRadius: '12px', border: '1px solid #4338ca' }}>
                    <div style={{ fontSize: '0.85rem', color: '#a5b4fc' }}>DRIVER INGESTION THROUGHPUT</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#818cf8', margin: '8px 0' }}>250,000 RPS</div>
                    <div style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>1M active drivers updating GPS coordinates every 4s</div>
                  </div>

                  <div style={{ background: 'rgba(6, 78, 59, 0.75)', padding: '20px', borderRadius: '12px', border: '1px solid #047857' }}>
                    <div style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>RIDE MATCH WRITE SURGE</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34d399', margin: '8px 0' }}>300 Writes/sec</div>
                    <div style={{ fontSize: '0.8rem', color: '#d1fae5' }}>100 avg RPS × 3x peak surge multiplier (100k shortcut)</div>
                  </div>
                </div>

                <div style={{ background: '#030712', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 style={{ color: '#f59e0b', margin: '0 0 12px 0' }}>Scale Derivations & CAP Choice:</h4>
                  <ul style={{ margin: 0, paddingLeft: '24px', color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.8' }}>
                    <li><strong>Rider Volume Shortcut:</strong> 10 Million Daily Rides ÷ 100,000 seconds = 100 Write RPS average.</li>
                    <li><strong>Peak Surge Math:</strong> Applying 3x multiplier = 300 Ride Match Writes/sec peak.</li>
                    <li><strong>Network Ingress:</strong> 250,000 RPS × 100 bytes = 25 MB/sec = <strong>2.16 TB raw location logs/day</strong>.</li>
                    <li><strong>CAP Theorem Decision:</strong> <strong>AP (Availability)</strong> for location streaming (stale map icon for 1s is fine); <strong>CP (Strong Consistency)</strong> for ride matching & payment transactions.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: RESILIENCY */}
            {activeTab === 'resiliency' && (
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '24px' }}>
                <h3 style={{ color: '#f43f5e', margin: '0 0 15px 0' }}>⚡ Resiliency & Hands-On Production SQL</h3>
                <div style={{ background: '#030712', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
                  <pre style={{ margin: 0, fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', color: '#f43f5e', lineHeight: '1.5' }}>
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
        </div>
      )}

    </div>
  );
};
