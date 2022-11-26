import Head from "next/head";
import Link from "next/link";
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
      <div style={{display: "flex", flexDirection: "row", justifyContent:"space-between", padding: "10px"}}>
        <div>
          <Link href="/">
            <h1 style={{margin: "0", cursor: "pointer"}}>SplatNet Alerts</h1>
          </Link>
          <p style={{marginTop: "0"}}>A Splatoon gear alerts service by <a href="https://twitter.com/ShrimpCryptid" target="_blank" rel="noopener noreferrer">@ShrimpCryptid</a>!</p>
        </div>
        <div style={{fontSize: "48px", gap: "10px"}}>
          <Link href="/about">
            <span style={{cursor: "pointer"}} className="material-symbols-rounded md-36">help</span>
          </Link>
        </div>
      </div>
      <hr
        style={{
          color: "white",
          backgroundColor: "white",
          height: 0,
          borderStyle: "solid"
        }}
        />
			<div className="container">
				{children}
				<ToastContainer
					position={toast.POSITION.BOTTOM_CENTER}
					transition={Zoom}
					theme={"dark"}
				/>
			</div>
      <br/>

      <div style={{display: "flex", flexDirection: "row", justifyContent:"center", padding: "5px"}}>

        <p
        style={{
          opacity: "70%",
          fontSize: "14px"
        }}
        >
          This website is not affiliated with Nintendo. Logos and artwork are property of their respective owners.
        </p>
      </div>

		</>
	);
}
