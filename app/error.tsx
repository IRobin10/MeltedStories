"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: '20px', color: 'red', backgroundColor: 'white', zIndex: 9999, position: 'relative' }}>
      <h2>App Error!</h2>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  );
}
