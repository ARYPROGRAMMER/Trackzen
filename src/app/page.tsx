import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="">
      <Button variant={"primary"} size={"xs"}>Primary</Button>
      <Button variant={"secondary"}>Secondary</Button>
      <Button variant={"destructive"}>Destructive</Button>
      <Button variant={"ghost"}>ghost</Button>
      <Button variant={"muted"}>muted</Button>
      <Button variant={"outline"}>Outline</Button>
      <Button variant={"teritary"}>teritary</Button>
    </div>
  );
}
