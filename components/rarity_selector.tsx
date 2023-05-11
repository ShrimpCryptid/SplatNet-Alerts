import styles from "./rarity_selector.module.css";
import { FunctionComponent } from "react";
import ReactSlider from "react-slider";
import { GEAR_RARITY_MIN, GEAR_RARITY_MAX } from "../constants";
import { RarityMeter } from "./rarity_meter";


type RaritySelectorProps = {
  rarity: number;
  onRarityChanged: (newRarity: number, thumbIndex: number) => void;
  disabled?: boolean;
  override?: number | undefined;
}

const defaultProps: RaritySelectorProps = {
  rarity: 0,
  onRarityChanged: (newRarity: number, thumbIndex: number) => {},
  disabled: false,
  override: undefined
}

const RaritySelector: FunctionComponent<RaritySelectorProps> = ({rarity, onRarityChanged, disabled=false, override}) => {
  let sliderValue = override ? override : rarity;
  return (
    <div>
      <h3 className={styles.categoryLabel} style={{marginTop: "5px"}}>
				Minimum Rarity
			</h3>
      <div className={`${styles.raritySelectorContainer} ${disabled ? styles.disabled : ""}`} >
        <div className={styles.raritySliderAndLabel + " hdiv"}>
          <div className={styles.rarityLabelContainer}>
            <h3>Rarity: <span className="highlight">{sliderValue}🟊</span></h3>
          </div>
          <div className={styles.raritySliderContainer}>
            <ReactSlider
              min={GEAR_RARITY_MIN}
              max={GEAR_RARITY_MAX}
              value={sliderValue}
              onChange={onRarityChanged}
              disabled={disabled}
            />
          </div>
        </div>
        <div className={styles.rarityMeterContainer}>          
          <RarityMeter
            minRarity={sliderValue}
            maxRarity={GEAR_RARITY_MAX}
          />
        </div>
      </div>
    </div>
  )
}

RaritySelector.defaultProps = defaultProps;
export default RaritySelector;