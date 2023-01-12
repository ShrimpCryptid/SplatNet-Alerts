import "../styles/styles.css";
import { useEffect, useState } from "react";
import Layout from "../components/layout";
import type { AppProps } from "next/app";
import Filter from "../lib/filter";
import {
	API_NICKNAME,
	API_RESPONSE_FILTER_LIST,
	API_USER_CODE,
	FE_ERROR_404_MSG,
	FE_ERROR_500_MSG,
	FE_ERROR_INVALID_USERCODE,
	FE_LOCAL_USER_CODE,
	FE_UNKNOWN_MSG,
} from "../constants";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isValidUserCode, sleep } from "../lib/shared_utils";
import router from "next/router";
import { logEvent, logPageview } from "../lib/analytics";

const GET_USER_DATA_DEFAULT_ATTEMPTS = 3;

/**
 * Fetches and returns the user data for the given user from the backend.
 *
 * @param userCode The string user code to query data for.
 * @param printErrors Whether to print toast errors for non-200 return codes.
 *  True by default.
 * @returns
 * - An ordered array of data values if the operation was successful (200).
 *    Currently, returns the filter list and the user nickname in order.
 * - null if the usercode is invalid or if the backend returned any error codes
 */
export async function getUserData(
	userCode: string | null,
	printErrors = true,
	maxAttempts = GET_USER_DATA_DEFAULT_ATTEMPTS
): Promise<[Filter[], string] | null> {
	if (userCode === null || !isValidUserCode(userCode)) {
		if (printErrors) {
			toast.error(FE_ERROR_INVALID_USERCODE);
		}
		return null;
	}

	let url = `/api/get-user-data?${API_USER_CODE}=${userCode}`;

	try {
		let response = await fetch(url);
		let attempts = 0;

		// If the initial response is not 200, make multiple attempts
    let skippableResponses = [200, 404];  // skip 404 because unrecoverable
		while (attempts < maxAttempts && !skippableResponses.includes(response.status)) {
			if (attempts > 0) {
				// Add an additional sleep delay if multiple attempts made
				await sleep(200); // 200 ms delay
			}
			attempts++;
		}

		if (response.status == 200) {
			// ok
			let userData = await response.json();

			// Extract filter list from user data
			let filterList = [];
			for (let json of userData[API_RESPONSE_FILTER_LIST]) {
				filterList.push(Filter.deserializeObject(json));
			}

			// Get nicknames and other parameters
			let nickname: string = userData[API_NICKNAME];
			// Return multiple values as an array
			return [filterList, nickname];
		} else if (printErrors) {
			if (response.status === 404 && isValidUserCode(userCode)) {
				toast.error(FE_ERROR_404_MSG);
			} else if (response.status === 500 || response.status === 400) {
				toast.error(FE_ERROR_500_MSG);
			} else {
				toast.error(FE_UNKNOWN_MSG + " (error code: " + response.status + ")");
			}
		}
	} catch (e) {
		toast.error(FE_UNKNOWN_MSG);
	}
	return null;
}

/** Used to persist global state between pages. */
export type DefaultPageProps = {
	/** Unique user identifier. Undefined when not yet loaded,
	 * null if no user code is saved locally. */
	userCode: string | null | undefined;
	setUserCode: (newUserCode: string | null | undefined) => void;
	/** The filter currently being edited when opening the filters page. Null if
	 * we are instead making a new filter.
	 */
	editingFilterIndex: number | null;
	setEditingFilterIndex: (newFilter: number | null) => void;
	/** List of filters user is subscribed to. Undefined when unloaded
	 * yet, and null if there is no user or an error was encountered on load.
	 */
	userFilters: Filter[] | null | undefined;
	setUserFilters: (newFilters: Filter[] | null | undefined) => void;
	/** The user's display nickname. Undefined when unloaded, null if none is
	 * defined.
	 */
	userNickname: string | null | undefined;
	setUserNickname: (newNickname: string | null | undefined) => void;
  /**
   * A flag for when the user was newly created, and should be shown a series of
   * informational prompts.
   */
  isUserNew: boolean | undefined;
  setIsUserNew: (value: boolean | undefined) => void;
  /**
   * Fetches most recent user data from the backend and stores it locally,
   * returning whether the operation completed successfully.
   * @param userCode user identifier.
   * @param printErrors if true, prints error messages if unsuccessful.
   * @param forceUpdate if true, updates internal state with (null) values even
   *  if an error was encountered when retrieving user data.
   *  
   * @returns An array, where the first value is a boolean representing if the
   * data was fetched successfully, and second an object with the
   * new updated data values.
   */
	updateLocalUserData: (
		userCode: string | null,
		printErrors: boolean,
    forceUpdate?: boolean
	) => Promise<[boolean, {nickname: string | null, filters: Filter[] | null}]>;

  /**
 * Fetches and returns the user data for the given user from the backend.
 *
 * @param userCode The string user code to query data for.
 * @returns
 * - An ordered array of data values if the operation was successful (200).
 *    Currently, returns the filter list and the user nickname in order.
 * - null if the usercode is invalid or if the backend returned any error codes
 */
  getUserData: (
    userCode: string | null,
  ) => Promise<[Filter[], string] | null>;
};


export default function App({ Component, pageProps }: AppProps) {
	// Initialize as undefined until we render, then get the local user data
	// and transition it to either a string or null value.
	const [editingFilterIndex, setEditingFilterIndex] = useState<null | number>(null);
	const [userCode, setUserCode] = useState<null | string | undefined>(undefined);
	const [userFilters, setUserFilters] = useState<Filter[] | null | undefined>(undefined);
	const [userNickname, setUserNickname] = useState<string | null | undefined>(undefined);
  const [isUserNew, setIsUserNew] = useState<boolean | undefined>(undefined);
	const [hasDoneInitialLoad, setHasDoneInitialLoad] = useState(false);

	// Wrapped in useEffect because this needs to run on the client side
	// (not during server-side rendering)
	useEffect(() => {
		// Load locally-stored user code if it exists
		if (userCode === undefined) {
			if (window && window.localStorage.getItem(FE_LOCAL_USER_CODE) !== null) {
				let storedUserCode = window.localStorage.getItem(FE_LOCAL_USER_CODE);
				// Update internally stored usercode-- ignore if invalid.
        if (storedUserCode && isValidUserCode(storedUserCode)) {
          setUserCode(storedUserCode);
        } else {
          setUserCode(null);
        }
			} else {
				setUserCode(null);
			}
		}

		// Perform an initial load of user data from the backend
		if (userCode !== undefined && userCode !== null && !hasDoneInitialLoad) {
			// We've loaded the user code, so update our local user data using it.
			setHasDoneInitialLoad(true);
			updateLocalUserData(userCode, false, true).then((result) => {
        if (result[0]) {
          logEvent('login');  // TODO: Fix event logging
        }
      });
		}
	});

  // Track pageview change events
  // Adapted from https://andrew-simpson-ross.medium.com/strongly-typed-google-analytics-v4-with-next-js-aad6c6a5e383
  useEffect(() => {
    const handleRouteChange = (url: URL) => {
      logPageview(url);
    };
    router.events.on(
      'routeChangeComplete',
      handleRouteChange
    );
    return () => {
      router.events.off(
        'routeChangeComplete',
        handleRouteChange
      )
    }
  }, [router.events])

  /**
   * Fetches most recent user data from the backend and stores it locally,
   * returning whether the operation completed successfully.
   * @param userCode user identifier.
   * @param printErrors if true, prints error messages if unsuccessful.
   * @param forceUpdate if true, updates internal state with (null) values even
   *  if an error was encountered when retrieving user data.
   *  
   * @returns true if user data was succesfully retrieved from the backend.
   * Otherwise, returns false.
   */
	const updateLocalUserData = async (
		userCode: string | null,
		printErrors: boolean,
    forceUpdate = false,
	) => {
		let userData = await getUserData(userCode, printErrors);
		if (userData !== null) {
			// Successfully got state, so save values to constant props
			const [filters, nickname] = userData;
			setUserNickname(nickname);
			setUserFilters(filters);
      return [true, {nickname: nickname, filters: filters}];
		} else {
      if (forceUpdate) {
        // Set local values to null.
        setUserNickname(null);
        setUserFilters(null);
      }
      return [false, {nickname: null, filters: null}];
		}
	};

	// Method passed to children instead of a direct setter so we can update local
	// storage when the stored user code is updated.
	const onSetUserCode = (newUserCode: string) => {
		if (isValidUserCode(newUserCode)) {
			setUserCode(newUserCode);
			if (window) {
				window.localStorage.setItem(FE_LOCAL_USER_CODE, newUserCode);
			}
		} else if (newUserCode === null) {
      setUserCode(null);
      if (window) {
        window.localStorage.removeItem(FE_LOCAL_USER_CODE);
      }
    }else {
			toast.error(FE_ERROR_INVALID_USERCODE);
		}
	};

	return (
		<Layout>
			<>
				<Component
					{...pageProps}
					userCode={userCode}
					setUserCode={onSetUserCode}
          userNickname={userNickname}
          setUserNickname={setUserNickname}
          userFilters={userFilters}
          setUserFilters={setUserFilters}

					editingFilterIndex={editingFilterIndex}
					setEditingFilterIndex={(filterIndex: number) => {
						setEditingFilterIndex(filterIndex);
					}}
          isUserNew={isUserNew}
          setIsUserNew={setIsUserNew}

					updateLocalUserData={updateLocalUserData}
          getUserData={getUserData}
				/>
			</>
		</Layout>
	);
}
