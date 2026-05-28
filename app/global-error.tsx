"use client";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', color: 'red', backgroundColor: 'white', zIndex: 9999, position: 'relative' }}>
          <h2>Something went wrong!</h2>
          <pre>{error.message}</pre>
          <pre>{error.stack}</pre>
        </div>
      </body>
    </html>
  );
}
