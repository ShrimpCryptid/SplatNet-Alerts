import styles from "./superjump.module.css";
import Image from "next/image";
import {
	superjumpBody,
	superjumpHead,
	superjumpTail,
	superjumpMarker,
} from "../../public/images/superjump";

const totalFaces = 20;
const gap = 1;

export type SuperJumpLoadAnimationProps = {
	filterText: string;
	fillLevel?: number;
};

const SuperJumpLoadAnimation = ({
	filterText,
	fillLevel = 1.0,
}: SuperJumpLoadAnimationProps) => {
	let images: any[] = [];

	let bodyLength = totalFaces / 2 - gap - 2;
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
		<div className={styles.holder} style={{ "--face-count": totalFaces }}>
			<div className={styles.bigIconHolder}>
				<Image src={superjumpMarker} layout={"fill"} priority={true} />
			</div>

			<div className={styles.cylinder}>
				{images.map((value, index) => {
					if (value != null) {
						return (
							<div
								className={`${styles.face}`}
								//@ts-ignore Needed because --index is a custom property
								style={{ "--index": index }}
								key={index}
							>
								<Image src={value} layout={"fill"} priority={true} />
							</div>
						);
					}
				})}
			</div>
			<div className={styles.label}>
				<h3>{filterText}</h3>
			</div>
		</div>
	);
};

export default SuperJumpLoadAnimation;
