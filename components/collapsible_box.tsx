import { FunctionComponent, PropsWithChildren } from "react"
import { makeIcon } from "../lib/frontend_utils";
import styles from "./collapsible_box.module.css";

type CollapsibleHelpBoxProps = {
  header: string;
  icon?: string;
  showFullText: boolean;
  onClick: () => void;
}


const CollapsibleHelpBox: FunctionComponent<PropsWithChildren<CollapsibleHelpBoxProps>> = ({
    icon= "help",
    showFullText,
    onClick,
    header,
    children
  }) => {
  // ^ Props with children type is a union of existing allowed props with
  // React's definition for children
  

  return (
  <div className={styles.box}>
    <button 
      className={styles.headerText + " hdiv"}
      onClick={onClick}
    >
      <p>{makeIcon(icon)}</p>
      <p>{header}</p>
    </button>
    { showFullText ? 
      <div className={styles.contents}>
        {children}
      </div>
    : <></>}
  </div>
  )
}

export default CollapsibleHelpBox;