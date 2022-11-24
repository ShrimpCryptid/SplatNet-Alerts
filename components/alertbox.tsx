import React, { MouseEventHandler } from "react";
import styles from "./alertbox.module.css";

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
  onClickClose?: MouseEventHandler<HTMLElement>
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
      <h1 style={{marginTop: "0"}}>{props.header}</h1>
      {props.children}
    </Alertbox>
  )
}