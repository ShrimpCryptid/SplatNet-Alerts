import "../styles/styles.css";
import { useEffect, useState } from "react";
import Layout from "../components/layout";
import type { AppProps } from "next/app";
import Filter from "../lib/filter";
import { FE_LOCAL_USER_CODE } from "../constants";

export type DefaultPageProps = {
	usercode: string | null;
	setUserCode: CallableFunction;
	editingFilter: Filter | null;
	setEditingFilter: CallableFunction;
};

export default function App({ Component, pageProps }: AppProps) {
  const [usercode, setUserCode] = useState<null | string>(null);
	const [editingFilter, setEditingFilter] = useState<null | Filter>(null);

  useEffect(() => {
    // Load locally-stored user code if it exists
    if (window && window.localStorage.getItem(FE_LOCAL_USER_CODE) !== null && usercode === null) {
      let storedUserCode = window.localStorage.getItem(FE_LOCAL_USER_CODE);
      // Update internally stored usercode
      setUserCode(storedUserCode);
    }
  });

  // Method passed to children instead of a direct setter so we can update local
  // storage when the stored user code is updated.
  const onSetUserCode = (newUserCode: string) => {
    // TODO: Validate usercode here?
    setUserCode(newUserCode);
    if (window) {
      window.localStorage.setItem(FE_LOCAL_USER_CODE, newUserCode);
    }
  }


	return (
		<Layout>
			<Component
				{...pageProps}
				usercode={usercode}
				setUserCode={onSetUserCode}
				editingFilter={editingFilter}
				setEditingFilter={(filter: Filter) => {
					setEditingFilter(filter);
				}}
			/>
		</Layout>
	);
}
