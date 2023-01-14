import styles from './triangle_divider.module.css';

const DEFAULT_REPEATS = 5;

export function TriangleDivider(props: {repeats?: number}) {
  let repeats = props.repeats;
  if (repeats === undefined) {
    repeats = DEFAULT_REPEATS;
  }

  let triangles = [];
  for (let i = 0; i < repeats; i++) {
    triangles.push(
      <div
        className={styles.triangle + " " + (i % 2 === 0 ? styles.up : styles.down)}
        key={i}
      />
    )
  }

  return (
    <div className={styles.container}>
      {triangles}
    </div>
  )
}