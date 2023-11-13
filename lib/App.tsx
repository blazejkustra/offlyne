import React from 'react';

class QueryClient {
  // ...
}

function QueryClientProvider({ client, children }: { client: QueryClient; children: React.ReactNode }) {
  // ...
  return children;
}

// ⬇️ this creates the client
const queryClient = new QueryClient();

export default function App() {
  return (
    // ⬇️ this distributes the client
    <QueryClientProvider client={queryClient}>
      <UseRead />
      <UseWrite />
    </QueryClientProvider>
  );
}

function UseRead() {
  const { data, error, isLoading, isValidating, mutate } = useRead('/api/user', fetcher, options);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;
  return <div>hello {data.name}!</div>;
}

function UseWrite() {
  const { data, error, isLoading, isValidating, mutate } = useWrite('/api/user', fetcher, options);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;
  return <div>hello {data.name}!</div>;
}
