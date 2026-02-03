import React from 'react';
import Header from './Header';

export default function Layout({ children, title }) {
  return (
    <div className="page">
      <Header />
      <main className="container-page py-10">
        {title && <h1 className="section-title mb-4">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
