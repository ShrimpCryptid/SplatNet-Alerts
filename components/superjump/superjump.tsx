import styles from './superjump.module.css';
import Image from "next/image";
import { superjumpBody, superjumpHead, superjumpTail, superjumpMarker } from '../../public/images/superjump';

const totalFaces = 20;
const gap = 1;

const SuperJumpLoadAnimation = () => {

  let images: any[] = [];
  
  let bodyLength = (totalFaces / 2) - gap - 2;
  let repeatLength = Math.floor(totalFaces / 2);
  for (let i = 0; i < totalFaces; i++) {
    if (i % repeatLength === 0) {
      images.push(superjumpTail);
    } else if (i % repeatLength < 1 + bodyLength) {
      images.push(superjumpBody);
    } else if (i % repeatLength === 1 + bodyLength) {
      images.push(superjumpHead);
    } else {
      images.push(null);
    }
  }

  return (
    //@ts-ignore
    <div className={styles.holder} style={{"--face-count": totalFaces}}>
      <div className={styles.bigIconHolder}>
        <Image src={superjumpMarker} layout={"fill"}/>
      </div>
      
      <div className={styles.cylinder}>
        {images.map((value, index) => {
          if (value != null) {
            return (
              //@ts-ignore Needed because --index is a custom property
              <div className={`${styles.face}`} style={{'--index': index}}>
                <Image
                src={value}
                layout={"fill"}
                width={40}
                height={40}
              />
              </div>
            )
          }
        })}
      </div>
      <div className={styles.label}>
        <h3>Loading...</h3>
      </div>
    </div>
  )
}

export default SuperJumpLoadAnimation;
