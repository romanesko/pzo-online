import {isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration,} from "react-router";

import type {Route} from "./+types/root";
import "./app.css";


// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/notifications/styles.css';
import {ColorSchemeScript, mantineHtmlProps, MantineProvider} from '@mantine/core';
import {ClientSettingsProvider} from "@/lib/ClientSettingsContext";
import {useEffect, useRef} from "react";
import {api} from "@/lib/api";
import {mutate} from "swr";
import {Notifications} from "@mantine/notifications";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body>
      <MantineProvider>
        <Notifications />
        {children}
      </MantineProvider>
      <ScrollRestoration />
      <Scripts />
      </body>
      </html>
  );
}

// ... other app/root.tsx content

export default function App() {

  const lastQueueResponse = useRef<number>(0)


  async function getQueue(){
    return api.queue.get(lastQueueResponse.current.toString()).then(res => {
      lastQueueResponse.current = res.ts
      if (res.entries.length > 0) {
        for (let entry of res.entries) {
          const data = entry.data as {key: string, value: any}
          if (data.key == 'mutate') {
            mutate(data.value).then(() => {console.log('mutated', data.value)})
          } else {
            console.log('unknown event', data)
          }
        }
      }
    })
  }


  useEffect(() => {
    getQueue()
    const intervalId = setInterval(() => {
      getQueue()
    }, 3000);
    return () => clearInterval(intervalId);
  }, [])


  return <ClientSettingsProvider><Outlet /></ClientSettingsProvider>
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
