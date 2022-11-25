import "../styles/styles.css";
import { useEffect, useState } from "react";
import Layout from "../components/layout";
import type { AppProps } from "next/app";
import Filter from "../lib/filter";
import { FE_ERROR_INVALID_USERCODE, FE_LOCAL_USER_CODE } from "../constants";

import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isValidUserCode } from "../lib/shared_utils";

export type DefaultPageProps = {
	usercode: string | null;
	setUserCode: CallableFunction;
	editingFilter: Filter | null;
	setEditingFilter: CallableFunction;
};

export default function App({ Component, pageProps }: AppProps) {
  // Initialize as undefined until we render, then get the local user data
  // and transition it to either a string or null value.
  const [usercode, setUserCode] = useState<null | string | undefined>(undefined);
	const [editingFilter, setEditingFilter] = useState<null | Filter>(null);

  // Wrapped in useEffect because this needs to run on the client side
  // (not during server-side rendering)
  useEffect(() => {
    // Load locally-stored user code if it exists
    if (usercode === undefined) {
      if (window && window.localStorage.getItem(FE_LOCAL_USER_CODE) !== null) {
        let storedUserCode = window.localStorage.getItem(FE_LOCAL_USER_CODE);
        // Update internally stored usercode
        setUserCode(storedUserCode);
      } else {
        setUserCode(null);
      }
    }
  });

  // Method passed to children instead of a direct setter so we can update local
  // storage when the stored user code is updated.
  const onSetUserCode = (newUserCode: string) => {
    if (isValidUserCode(newUserCode)) {
      setUserCode(newUserCode);
      if (window) {
        window.localStorage.setItem(FE_LOCAL_USER_CODE, newUserCode);
      }
    } else {
      toast.error(FE_ERROR_INVALID_USERCODE);
    }
  }

	return (
		<Layout>
      <>
      <Component
        {...pageProps}
        usercode={usercode}
        setUserCode={onSetUserCode}
        editingFilter={editingFilter}
        setEditingFilter={(filter: Filter) => {
          setEditingFilter(filter);
        }}
        />
      </>
		</Layout>
	);
}
