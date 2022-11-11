import "../styles/styles.css";
import { useState } from "react";
import Layout from "../components/layout";
import type { AppProps } from "next/app";
import Filter from "../lib/filter";

export type DefaultPageProps = {
	usercode: string | null;
	setUserCode: CallableFunction;
	editingFilter: Filter | null;
	setEditingFilter: CallableFunction;
};

export default function App({ Component, pageProps }: AppProps) {
  // TODO: Save user code to cookies (or browser local state) on app load.
	const [usercode, setUserCode] = useState<null | string>("6c7824b8-319d-43f1-8fe6-5f4cda2cc5b0");
	const [editingFilter, setEditingFilter] = useState<null | Filter>(null);

	return (
		<Layout>
			<Component
				{...pageProps}
				usercode={usercode}
				setUserCode={setUserCode}
				editingFilter={editingFilter}
				setEditingFilter={(filter: Filter) => {
					setEditingFilter(filter);
				}}
			/>
		</Layout>
	);
}
