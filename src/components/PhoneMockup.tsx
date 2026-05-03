'use client'

import { useState, useEffect } from 'react'

const C = {
  fg: '#0c0c0e',
  muted: '#6b7280',
  border: '#ececef',
  primary: '#3a59ff',
  green: '#16a34a',
  greenSoft: '#dcfce7',
  bgSoft: '#f5f5f5',
}

function Screen0() {
  return (
    <div style={{ padding: '20px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>Přehled</div>
        <div style={{ fontSize: 11, color: C.muted }}>Duben 2026</div>
      </div>
      <div style={{ height: 1, background: C.border, marginBottom: 14 }} />
      <div style={{ background: C.bgSoft, borderRadius: 10, padding: '14px 12px', marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 500 }}>Vyfakturováno</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.fg, letterSpacing: -0.5 }}>148 200 Kč</div>
          </div>
          <div style={{ fontSize: 12, color: C.green, fontWeight: 600, background: C.greenSoft, padding: '3px 8px', borderRadius: 999 }}>↑ +24%</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div style={{ background: C.greenSoft, borderRadius: 10, padding: '12px 10px' }}>
          <div style={{ fontSize: 10, color: C.green, fontWeight: 600, marginBottom: 4 }}>✓ Zaplaceno</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>124 350 Kč</div>
        </div>
        <div style={{ background: '#fef3c7', borderRadius: 10, padding: '12px 10px' }}>
          <div style={{ fontSize: 10, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>⏳ Čeká</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>23 850 Kč</div>
        </div>
      </div>
      <div style={{ height: 1, background: C.border, marginBottom: 14 }} />
      <div style={{ background: C.fg, color: '#fff', borderRadius: 10, padding: '12px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
        + Nová faktura
      </div>
    </div>
  )
}

function Screen1() {
  return (
    <div style={{ padding: '20px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: C.muted }}>←</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>Nová faktura</div>
      </div>
      <div style={{ height: 1, background: C.border, marginBottom: 14 }} />
      {[
        { label: 'Klient', value: 'Alza.cz a.s.' },
        { label: 'Položka', value: 'Konzultace' },
        { label: 'Cena', value: '15 000 Kč' },
        { label: 'Splatnost', value: '15 dnů' },
      ].map(row => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{row.label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>{row.value}</span>
        </div>
      ))}
      <div style={{ marginTop: 20, background: C.primary, color: '#fff', borderRadius: 10, padding: '13px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
        Vystavit a odeslat →
      </div>
    </div>
  )
}

function Screen2() {
  return (
    <div style={{ padding: '32px 16px', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 999, background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>
        ✓
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.fg, marginBottom: 20 }}>Faktura odeslána</div>
      <div style={{ background: C.bgSoft, borderRadius: 12, padding: '16px 14px', marginBottom: 20, textAlign: 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.fg, marginBottom: 4 }}>Alza.cz a.s.</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.fg, letterSpacing: -0.5, marginBottom: 4 }}>15 000 Kč</div>
        <div style={{ fontSize: 11, color: C.muted }}>Splatnost 20. 5. 2026</div>
      </div>
      <div style={{ background: C.bgSoft, border: `1px solid ${C.border}`, color: C.fg, borderRadius: 10, padding: '11px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
        Zobrazit fakturu
      </div>
    </div>
  )
}

function Screen3() {
  return (
    <div style={{ padding: '32px 16px', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 999, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.fg, marginBottom: 20 }}>Platba přijata!</div>
      <div style={{ background: C.greenSoft, borderRadius: 12, padding: '16px 14px', marginBottom: 20, textAlign: 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.green, marginBottom: 4 }}>Alza.cz a.s.</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.green, letterSpacing: -0.5, marginBottom: 4 }}>15 000 Kč</div>
        <div style={{ fontSize: 11, color: C.green, opacity: 0.8 }}>Zaplaceno dnes</div>
      </div>
      <div style={{ background: C.fg, color: '#fff', borderRadius: 10, padding: '12px', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
        Přejít na přehled
      </div>
    </div>
  )
}

const screens = [Screen0, Screen1, Screen2, Screen3]

export function PhoneMockup() {
  const [active, setActive] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => {
        setActive(prev => (prev + 1) % screens.length)
        setTransitioning(false)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const Screen = screens[active]

  return (
    <div style={{
      background: '#0c0c0e',
      borderRadius: 44,
      padding: 14,
      width: 290,
      boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
      position: 'relative',
    }}>
      {/* Notch */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 80,
        height: 28,
        background: '#0c0c0e',
        borderRadius: '0 0 18px 18px',
        zIndex: 10,
      }} />
      {/* Screen area */}
      <div style={{
        background: '#ffffff',
        borderRadius: 32,
        overflow: 'hidden',
        minHeight: 520,
        position: 'relative',
      }}>
        {/* Status bar */}
        <div style={{
          height: 44,
          background: '#ffffff',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 20px 8px',
          fontSize: 11,
          fontWeight: 600,
          color: '#0c0c0e',
        }}>
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><rect x="0" y="4" width="3" height="7" rx="1"/><rect x="4" y="2.5" width="3" height="8.5" rx="1"/><rect x="8" y="1" width="3" height="10" rx="1"/><rect x="12" y="0" width="3" height="11" rx="1"/></svg>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><rect x="0.5" y="0.5" width="13" height="10" rx="2.5" stroke="currentColor" strokeOpacity="0.35"/><rect x="14" y="3.5" width="1.5" height="4" rx="0.75" fill="currentColor" fillOpacity="0.4"/><rect x="1.5" y="1.5" width="9" height="8" rx="1.5" fill="currentColor"/></svg>
          </span>
        </div>
        {/* Content with fade transition */}
        <div style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}>
          <Screen />
        </div>
      </div>
      {/* Bottom indicator dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingTop: 12 }}>
        {screens.map((_, i) => (
          <div key={i} style={{
            width: i === active ? 18 : 6,
            height: 6,
            borderRadius: 999,
            background: i === active ? '#ffffff' : 'rgba(255,255,255,0.3)',
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  )
}
