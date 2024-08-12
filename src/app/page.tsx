import { DefaultLayout } from "client/components/layouts/default_layout";
import type { FunctionComponent } from "react";

const Page: FunctionComponent = () => {
  return (
    <DefaultLayout>
      <div>Hello, world!</div>
    </DefaultLayout>
  );
};

export default Page;
