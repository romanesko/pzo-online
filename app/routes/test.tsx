export async function loader({ request }: any) {
  const url = new URL(request.url);
  return {url}
}
