import {loadingIcon} from '../public/icons/utils';
import Image from 'next/image';
import styles from './loading-button.module.css';
import { MouseEventHandler } from 'react';

type LoadButtonProps = {
  children?: React.ReactNode,
  loading?: boolean,
  disabled?: boolean,
  onClick: CallableFunction
}

/** Shows a loading animation when loading is set to true.
 * Note: Disables onClick behavior when loading.
 */
export default function LoadButtonProps({children, loading=true, disabled=false, onClick}: LoadButtonProps) {
  return (
    <div>
      <button className={styles.button} disabled={disabled} onClick={() => {loading ? null : onClick()}}>
        {!loading ? 
          children : 
          <div className={styles.loadingIcon}>
            <Image 
              src={loadingIcon}
              width={50}
              height={50}
              layout='fill'
            />
          </div>
          }
      </button>
    </div>
  )
}