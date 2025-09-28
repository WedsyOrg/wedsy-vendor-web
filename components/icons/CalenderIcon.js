import { useRouter } from "next/router";

export default function CalenderIcon() {
  const router = useRouter();
  return (
    <img
      src="/assets/icons/calender.png"
      onClick={() => {
        router.push("/calender");
      }}
      className="cursor-pointer"
    />
  );
}
