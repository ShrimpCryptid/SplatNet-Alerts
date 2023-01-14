import styles from "./user_id_field.module.css";
import { toast } from "react-toastify";
import { makeIcon } from "../lib/frontend_utils";
import LoadingButton, { ButtonStyle } from "./loading-button";

export function UserIDField(props: {userCode: string}) {
  return (
    <div className={styles.userIDTextContainer + " hdiv"}>
    <p className={styles.userIDText}>{props.userCode}</p>
    <LoadingButton buttonStyle={ButtonStyle.ICON}
      onClick={() => {
        navigator.clipboard.writeText(props.userCode);
        toast("Copied to clipboard!");
      }}
    >
      {makeIcon("content_copy")}
    </LoadingButton>
    </div>
  )
}