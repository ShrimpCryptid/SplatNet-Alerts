import React from "react";
import styles from "./alertbox.module.css";

// TODO: Add close button to Alertbox, if applicable.
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
  onClickClose?: CallableFunction
}
export default function LabeledAlertbox(props: LabeledAlertboxProps) {
  return (
    <Alertbox>
      <h1>{props.header}</h1>
      {props.children}
    </Alertbox>
  )
}