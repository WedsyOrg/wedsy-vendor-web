import { useRouter } from "next/router";

export default function MessageIcon() {
  const router = useRouter();
  return (
    <img
      src="/assets/icons/message.png"
      onClick={() => {
        router.push("/chats");
      }}
      className="cursor-pointer"
    />
  );
}
