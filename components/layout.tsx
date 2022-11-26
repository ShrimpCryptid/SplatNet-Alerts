import Head from "next/head";
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type LayoutProps = {
	children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
	// TODO: Custom animation for toasts
	return (
		<>
			<Head>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
				/>
			</Head>
			<div className="container">
				{children}
				<ToastContainer
					position={toast.POSITION.BOTTOM_CENTER}
					transition={Zoom}
					theme={"dark"}
				/>
			</div>
		</>
	);
}
