import React from 'react';

const KPICard = ({ titulo, valor, subtitulo, color = '#e30613' }) => {
  return (
    <div style={{
      backgroundColor: '#111111',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '4px',
      padding: '1.5rem'
    }}>
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 500,
        fontSize: '0.7rem',
        color: '#888888',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        marginBottom: '0.5rem'
      }}>
        {titulo}
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900,
        fontSize: '2.5rem',
        color: color,
        marginBottom: '0.25rem'
      }}>
        {valor}
      </div>
      {subtitulo && (
        <div style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 400,
          fontSize: '0.8rem',
          color: '#888888'
        }}>
          {subtitulo}
        </div>
      )}
      <div style={{
        height: '2px',
        backgroundColor: color,
        marginTop: '1rem'
      }} />
    </div>
  );
};

export default KPICard;

