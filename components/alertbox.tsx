import React, { MouseEventHandler, useState } from "react";
import { toast } from "react-toastify";
import styles from "./alertbox.module.css";
import LoadingButton, { ButtonStyle } from "./loading-button";

export function Alertbox(props: React.PropsWithChildren) {
  return (
    <div className={styles.background}>
      <div className={styles.alertbox}>
        {props.children}
      </div>
    </div>
  )
}


type LabeledAlertboxProps = {
  children?: React.ReactNode,
  header?: string,
  onClickClose?: MouseEventHandler<HTMLElement>,
  primaryButton?: string,
  primaryButtonOnClick?: CallableFunction,
  secondaryButton?: string,
  secondaryButtonOnClick?: CallableFunction,
}
export default function LabeledAlertbox(props: LabeledAlertboxProps) {
  return (
    <Alertbox>
      {props.onClickClose ? 
      // Render close button ONLY if there's a closing behavior defined.
      <div className={styles.closeButton} onClick={props.onClickClose}>
        <span className="material-symbols-rounded md-36 md-light">close</span>
      </div>
      : <></>}
      <h1 style={{margin: "0 auto"}}>{props.header}</h1>
      {props.children}
      <div className={styles.buttonDiv}>
        {props.secondaryButton ? 
          <LoadingButton onClick={props.secondaryButtonOnClick}>
            {props.secondaryButton}
          </LoadingButton>:<></>}
        {props.primaryButton ? 
          <LoadingButton onClick={props.primaryButtonOnClick}>
            {props.primaryButton}
          </LoadingButton> : <></>
        }
      </div>
    </Alertbox>
  )
}

/** Predefined alertbox that shows once the user makes their first filter. */
type WelcomeAlertboxProps = {
  onClickClose: MouseEventHandler<HTMLElement>,
  usercode: string,
  onClickSubmitNickname: MouseEventHandler<HTMLElement>
}
export function WelcomeAlertbox(props: WelcomeAlertboxProps) {
  const [nickname, setNickname] = useState("");

  // TODO: Register nickname to server on submit
  const onChangedNickname = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNickname(event.currentTarget.value);
  }

  return (
  <LabeledAlertbox
    header="Welcome!"
  >
    <p>You've made your first filter! Your filters are saved to your account
      and can be synced across devices using your <b>unique user ID</b>,
      shown below.
    </p>
    <h3 style={{marginBottom: "0"}}>User ID</h3>
    <p style={{marginTop: "0"}}>
      Please copy and save this somewhere safe! You may not be able to
      recover your account without it.
    </p>

    <div style={{display: "flex", flexDirection: "row", gap:"10px"}}>
      <textarea value={props.usercode ? props.usercode : ""}/>
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

    <h3 style={{marginBottom: "0"}}>Nickname</h3>
    <p style={{marginTop: "0"}}>Set a nickname to remember this account by.</p>
    <div style={{display: "flex", flexDirection: "row", gap:"10px"}}>
      <textarea
        value={nickname}
        onChange={onChangedNickname}
      />
      <LoadingButton buttonStyle={ButtonStyle.ICON}>
        <span className="material-symbols-rounded">refresh</span>
      </LoadingButton>
    </div>
    <br/>
    <LoadingButton
      disabled={nickname === ""}
    >
      Submit
    </LoadingButton>
  </LabeledAlertbox>
  );
}