import { redirect } from "next/navigation";

export default function Home() {
  redirect("/tutorial");
  return null;
}
