import {loadingIcon} from '../public/icons/utils';
import Image from 'next/image';
import styles from './loading-button.module.css';

type LoadingButtonProps = {
  children?: React.ReactNode,
  loading?: boolean,
  disabled?: boolean,
  onClick: CallableFunction
}

/** Shows a loading animation when loading is set to true.
 * Note: Disables onClick behavior when loading.
 */
export default function LoadingButton({children, loading=true, disabled=false, onClick}: LoadingButtonProps) {
  return (
    <div>
      <button className={styles.button} disabled={disabled} onClick={() => {loading ? null : onClick()}}>
        <div className={loading ? styles.hidden : ""}>
          {children}
        </div>
        <div className={`${styles.loadingIcon} ${loading ? "" : styles.hidden}`}>
            <Image 
              src={loadingIcon}
              width={50}
              height={50}
              layout='fill'
            />
        </div>
      </button>
    </div>
  )
}

export function LoadingLabeledButton() {
  return (<></>);
}

export function LoadingIconButton() {
  return (<></>);
}