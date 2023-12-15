import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import mainLogo from "../public/images/main_logo.svg";
import kofiBanner from "../public/images/ko-fi_banner.png";
import splashBackground from "../public/images/splash_background.svg";
import styles from "./layout.module.css";
import { LinkWithChildren, makeIcon, makeLink } from "../lib/frontend_utils";

type LayoutProps = {
	children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
	// TODO: Custom animation for toasts
	return (
		<div
			className={styles.background}
			style={{ backgroundImage: `url(${splashBackground.src})` }}
		>
			<Head>
				<meta
					name="description"
					content="Get notified for drops of the Splatoon gear you want!"
				/>
				<meta
					property="og:description"
					content="Get notified for drops of the Splatoon gear you want!"
				/>
				<meta
					name="keywords"
					content="Splatoon 3, SplatNet, gear, notification, alert, clothing, Nintendo, Splatoon"
				/>
				<meta name="author" content="@ShrimpCryptid" />
				<meta property="og:title" content="SplatNet Alerts" />
				<meta
					name="image"
					content="https://jgkwzmybepmajpfuqyjz.supabase.co/storage/v1/object/public/splatnet-alerts-public/main_logo.png"
				/>
				<meta
					property="og:image"
					content="https://jgkwzmybepmajpfuqyjz.supabase.co/storage/v1/object/public/splatnet-alerts-public/main_logo.png"
				/>
				<meta
					property="og:url"
					content="https://splatnet-alerts.netlify.app/"
				/>
				<meta property="og:type" content="website" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta name="theme-color" content="#000000" />
				<link rel="manifest" href="manifest.json" />
				<title>SplatNet Alerts</title>
			</Head>
			<div className={styles.header}>
				<div className="hdiv">
					<Link href="/">
						<div className={styles.mainIcon}>
							<Image
								src={mainLogo}
								layout={"fill"}
								alt={
									"Website logo: an orange autobomb wearing the 18k aviators."
								}
								priority={true}
							/>
						</div>
					</Link>
					<div>
						<Link href="/">
							<h1 className={styles.headerMainText}>SplatNet Alerts</h1>
						</Link>
						<p className={styles.headerSubText}>
							A Splatoon gear alerts service!
						</p>
					</div>
				</div>
				<div className="hdiv" style={{ gap: "10px", marginLeft: "auto" }}>
					<Link href="/about">
						<a className={styles.aboutLink}>
							{makeIcon("help", styles.aboutIcon + " icon-inline")}About
						</a>
					</Link>
				</div>
			</div>

			<div className="container">
				{children}
				<ToastContainer
					position={toast.POSITION.BOTTOM_CENTER}
					transition={Zoom}
					theme={"dark"}
					limit={2}
					pauseOnFocusLoss={false}
					autoClose={2500}
				/>
			</div>
			<br />

			<div className={styles.footer}>
				<div className={"hdiv " + styles.footerLinkContainer}>
					<Link href="/about">
						<a className={styles.link}>About</a>
					</Link>
					<p>|</p>
					{makeLink(
						"GitHub",
						"https://github.com/ShrimpCryptid/SplatNet-Alerts",
						styles.link
					)}
					<p>|</p>
					<LinkWithChildren url={"https://ko-fi.com/shrimpcryptid"}>
						<div className={styles.kofiBanner}>
							<Image
								src={kofiBanner}
								layout={"responsive"}
								alt={"Ko-fi coffee cup logo (text: Support me on Ko-fi)"}
							/>
						</div>
					</LinkWithChildren>
				</div>
				<p
					style={{
						opacity: "70%",
						fontSize: "12px",
					}}
				>
					This website is not affiliated with Nintendo. Logos and artwork are
					property of their respective owners.
				</p>
			</div>
		</div>
	);
}
