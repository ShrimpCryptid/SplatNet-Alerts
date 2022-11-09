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
	const [usercode, setUserCode] = useState<null | string>("37fb40c4-68e9-4475-a492-c2a9bce57737");
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
