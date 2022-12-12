import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import mainLogo from "../public/images/main_logo.svg";
import styles from "./layout.module.css";

type LayoutProps = {
	children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
	// TODO: Custom animation for toasts
	return (
		<>
			<Head>
        <title>SplatNet Alerts</title>
        <meta name="description" content="A notification service for Splatoon gear!"/>
        <meta name="keywords" content="Splatoon 3, SplatNet, gear, notification, alert, clothing"/>
        <meta name="author" content="@ShrimpCryptid"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
				/>
        <link 
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter"
        />
			</Head>
      <div className={styles.header}>
        <div className="hdiv">
          <div className={styles.mainIcon}>
            <Image src={mainLogo} layout={"fill"}/>
          </div>
          <div>
            <Link href="/">
              <h1 className={styles.headerMainText}>SplatNet Alerts</h1>
            </Link>
            <p className={styles.headerSubText}>A Splatoon gear alerts service by <Link href="https://twitter.com/ShrimpCryptid">@ShrimpCryptid</Link>!</p>
          </div>
        </div>
        <div className="hdiv" style={{gap: "15px", marginLeft: "auto"}}>
          <p><Link href="https://github.com/ShrimpCryptid/splatnet-shop-alerts">Source</Link></p>
          <p><Link href="/about">About</Link></p>
        </div>
      </div>

			<div className="container">
				{children}
				<ToastContainer
					position={toast.POSITION.BOTTOM_CENTER}
					transition={Zoom}
					theme={"dark"}
				/>
			</div>
      <br/>

      <div className="hdiv" style={{justifyContent:"center", padding: "5px"}}>

        <p
        style={{
          opacity: "70%",
          fontSize: "12px"
        }}
        >
          This website is not affiliated with Nintendo. Logos and artwork are property of their respective owners.
        </p>
      </div>

		</>
	);
}
