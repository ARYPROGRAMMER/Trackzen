import { Button } from "@/components/ui/button";
import TestComponent from "@/features/test";

export default function Home() {
  return (
    <div>
      <Button
      variant={"destructive"}
      size={"lg"}
      >Click me</Button>

      <TestComponent/>
    </div>
  );
}
