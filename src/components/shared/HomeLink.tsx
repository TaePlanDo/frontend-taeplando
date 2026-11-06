import { Link } from "react-router-dom";

import { CustomizedButton } from "@/components/shared/CustomizedButton";

export function HomeLink() {
  return (
    <CustomizedButton variant="primary" className="w-auto px-6" asChild>
      <Link to="/">Wróć do strony głównej</Link>
    </CustomizedButton>
  );
}
