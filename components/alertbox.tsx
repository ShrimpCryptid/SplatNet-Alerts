import React, { MouseEventHandler, useState } from "react";
import { toast } from "react-toastify";
import { getRandomTitle, sanitizeNickname } from "../lib/shared_utils";
import styles from "./alertbox.module.css";
import LoadingButton, { ButtonStyle } from "./loading-button";
import notificationImage from "../public/images/notifications-forever.jpg";
import Image from "next/image";

type AlertboxProps = {
  children?: React.ReactNode;
  visible?: boolean;
}

export function Alertbox(props: AlertboxProps) {
  let visible = props.visible === undefined ? true : props.visible;
	return (
		<div className={styles.background}
      style={{visibility: visible ? "visible" : "hidden"}}
    >
			<div className={styles.alertbox}>{props.children}</div>
		</div>
	);
}

type LabeledAlertboxProps = {
	children?: React.ReactNode;
	header?: string;
	onClickClose?: MouseEventHandler<HTMLElement>;
	primaryButton?: string;
	primaryButtonOnClick?: CallableFunction;
	secondaryButton?: string;
	secondaryButtonOnClick?: CallableFunction;
  visible?: boolean;
};
export default function LabeledAlertbox(props: LabeledAlertboxProps) {
  let visibility = props.visible === undefined ? true : props.visible;

	return (
		<Alertbox visible={visibility}>
			{props.onClickClose ? (
				// Render close button ONLY if there's a closing behavior defined.
				<div className={styles.closeButton} onClick={props.onClickClose}>
					<span className="material-symbols-rounded md-36 md-light">close</span>
				</div>
			) : (
				<></>
			)}
			<h2 style={{marginBottom: "10px"}}>{props.header}</h2>
			{props.children}
			<div className={styles.buttonDiv}>
				{props.secondaryButton ? (
					<LoadingButton onClick={props.secondaryButtonOnClick}>
						{props.secondaryButton}
					</LoadingButton>
				) : (
					<></>
				)}
				{props.primaryButton ? (
					<LoadingButton onClick={props.primaryButtonOnClick}>
						{props.primaryButton}
					</LoadingButton>
				) : (
					<></>
				)}
			</div>
		</Alertbox>
	);
}

/** Predefined alertbox that shows once the user makes their first filter. */
type WelcomeAlertboxProps = {
	onClickSubmit: (nickname: string) => Promise<void>;
	usercode: string;
  loading: boolean;
};

export function WelcomeAlertbox(props: WelcomeAlertboxProps) {
	const [nickname, setNickname] = useState("");

	const onChangedNickname = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setNickname(sanitizeNickname(event.currentTarget.value));
	};

	return (
		<LabeledAlertbox header="Welcome!">
			<p>
				You've made your first filter! Your filters are saved to your account
				and can be synced across devices using your <b>unique user ID</b>, shown
				below.
			</p>
			<h3 style={{ marginBottom: "0" }}>User ID</h3>
			<p style={{ marginTop: "0" }}>
				Please copy and save this somewhere safe! You may not be able to recover
				your account without it.
			</p>

			<div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
				<textarea value={props.usercode ? props.usercode : ""} readOnly={true} />
				<LoadingButton
					buttonStyle={ButtonStyle.ICON}
					onClick={() => {
						navigator.clipboard.writeText(props.usercode);
						toast("User ID copied!");
					}}
				>
					<span className="material-symbols-rounded">content_copy</span>
				</LoadingButton>
			</div>

			<h3 style={{ marginBottom: "0" }}>Nickname</h3>
			<p style={{ marginTop: "0" }}>
				Set a nickname to remember this account by. You can also generate a
        random in-game title using the button.
        <br/><i>(Limited to alphanumeric characters, dashes, and spaces!)</i>
			</p>
			<div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
				<textarea value={nickname} onChange={onChangedNickname} />
				<LoadingButton
					buttonStyle={ButtonStyle.ICON}
					onClick={() => setNickname(getRandomTitle())}
				>
					<span className="material-symbols-rounded">refresh</span>
				</LoadingButton>
			</div>
			<br />
			<LoadingButton
        disabled={nickname === ""}
        loading={props.loading}
        onClick={() => {props.onClickSubmit(nickname)}}
      >
        Submit
      </LoadingButton>
		</LabeledAlertbox>
	);
}

type NotificationAlertboxProps = {
  onClickCancel: () => void,
  onClickSignUp: () => void,
  loading: boolean
}

export function NotificationAlertbox(props: NotificationAlertboxProps) {
  const [cancelClicked, setCancelClicked] = useState(false);

  return (
    <LabeledAlertbox header="Enable Notifications!">
      <p>
        SplatNet Alerts needs notifications enabled to work
        properly! When enabled, a push notification will be sent to this device
        whenever matching gear appears in the SplatNet shop.
      </p>
      <p>
        Notifications can be switched on/off at any time, and will
        never be used for advertising or spam.
      </p>
      <div className="gap" style={{alignContent: "center"}}>
        <div style={{width: "calc(200px + 10vmin)", position: "relative", margin: "0 auto"}}>
          <Image src={notificationImage} layout="responsive"/>
        </div>
        <div className="hdiv gap" style={{padding: "5px", alignItems: "center", color: "var(--highlight)"}}>
          <span className="material-symbols-rounded md-36">info</span>
          <p style={{margin: "0", color: "var(--highlight)"}}>
            <b>When prompted, set notifications to 'Forever' or else you may stop
              getting notified!</b>
          </p>
        </div>
      </div>
      <br/>
      <div className={styles.twoButtonContainer}>
        <LoadingButton
          onClick={() => {props.onClickCancel(); setCancelClicked(true);}}
          disabled={props.loading}
        >
          {/**TODO: Make "No Thanks" button have secondary colors */}
          <div className="hdiv gap">
            <span className="material-symbols-rounded md-24 md-light"
              style={{lineHeight: "100%"}}
              >
              block
            </span> No Thanks
          </div>
        </LoadingButton>

        <LoadingButton
          onClick={props.onClickSignUp}
          loading={props.loading}
          disabled={cancelClicked}
        >
          <div className="hdiv gap">
            <span className="material-symbols-rounded md-24 md-light"
              style={{lineHeight: "100%"}}
              >
              notifications
            </span> Sign Me Up!
          </div>
        </LoadingButton>
      </div>
    </LabeledAlertbox>
  )
}
