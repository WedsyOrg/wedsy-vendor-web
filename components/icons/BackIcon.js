import { useRouter } from "next/router";
import { MdArrowBackIos } from "react-icons/md";

export default function BackIcon({ backToSettings }) {
  const router = useRouter();
  return (
    <MdArrowBackIos
      cursor={"pointer"}
      onClick={() => {
        if (backToSettings === true) {
          router.push("/settings");
        } else {
          router.back();
        }
      }}
    />
  );
}
