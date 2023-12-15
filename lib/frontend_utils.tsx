import Link from "next/link";
import { ReactNode } from "react";

export function makeIcon(icon: string, className = "") {
	// TODO: make symbol-filled a separate option, or specify it explicitly.
	return (
		<span
			className={"material-symbols-rounded symbol-filled " + className}
			style={{ display: "inline-block" }}
		>
			{icon}
		</span>
	);
}

export function makeIconHeader(
	icon: string,
	header: string,
	containerClassName = "",
	iconClassName = ""
) {
	return (
		<div
			className={"hdiv gap " + containerClassName}
			style={{ padding: "2px 0", alignItems: "center" }}
		>
			{makeIcon(icon, iconClassName)}
			<h3 style={{ marginBottom: "0" }}>{header}</h3>
		</div>
	);
}

export function makeLink(
	text: string,
	url: string,
	className?: string,
	newTab: boolean = true
) {
	if (newTab) {
		return (
			<a
				target="_blank"
				href={url}
				rel="noopener noreferrer"
				className={className}
			>
				{text}
			</a>
		);
	} else {
		return (
			<a href={url} rel="noopener noreferrer" className={className}>
				{text}
			</a>
		);
	}
}

export function LinkWithChildren(props: {
	url: string;
	className?: string;
	children?: ReactNode;
}) {
	return (
		<a
			href={props.url}
			rel="noopener noreferrer"
			target="_blank"
			className={props.className}
			style={{ display: "flex", width: "min-content" }}
		>
			{props.children}
		</a>
	);
}

export function makeHomeLink() {
	return (
		<Link href="/" className="navLink">
			<div className="hdiv" style={{ alignItems: "center", cursor: "pointer" }}>
				{makeIcon("arrow_back", "md-18")}
				<p style={{ margin: "0" }}>
					<b>Back to Home</b>
				</p>
			</div>
		</Link>
	);
}

export function isIOS() {
	// See https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
	// TODO: Replace navigator.platform because it may be deprecated?
	return (
		[
			"iPad Simulator",
			"iPhone Simulator",
			"iPod Simulator",
			"iPad",
			"iPhone",
			"iPod",
			"iPod touch",
		].includes(navigator.platform) ||
		// iPad on iOS 13 detection -- check if there's a touch object to distinguish
		// from a Mac, since they look the same
		(navigator.userAgent.includes("Mac") && "ontouchend" in document)
	);
}

/**
 * Returns whether the website is being run as a web app.
 */
export function isStandalone(): boolean {
	return (
		"standalone" in window.navigator &&
		window.navigator["standalone"] !== undefined
	);
}

export function getIOSVersion() {
	if (isIOS()) {
		var v = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
		if (v !== null) {
			return [
				parseInt(v[1], 10),
				parseInt(v[2], 10),
				parseInt(v[3] ? v[3] : "0", 10),
			];
		}
	}
	return [-1, -1];
}

export function isSupportedIOSVersion(): boolean {
	if (isIOS()) {
		let version = getIOSVersion();
		if (version[0] === -1) {
			return false;
		} else if (version[0] === 16 && version[1] >= 4) {
			return true;
		} else if (version[0] > 16) {
			return true;
		}
	}
	return false;
}
