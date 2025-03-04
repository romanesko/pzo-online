import type {Route} from "./+types/home";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "ПЗО" },
    { name: "description", content: "ПЗО" },
  ];
}

export default function Home() {
  return <></>;
}
